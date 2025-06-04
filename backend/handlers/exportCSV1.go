package handlers

import (
	"context"
	"encoding/csv"
	"log"
	"net/http"
	"time"

	"backend/db"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// // toString converts an interface to string, handling nil and various types
// func toString(v interface{}) string {
//     if v == nil {
//         return ""
//     }
//     switch val := v.(type) {
//     case string:
//         return val
//     case int64:
//         return strconv.FormatInt(val, 10)
//     case float64:
//         return strconv.FormatFloat(val, 'f', -1, 64)
//     case bool:
//         return strconv.FormatBool(val)
//     default:
//         return fmt.Sprintf("%v", val)
//     }
// }

// // formatNumber formats numbers, handling int64, float64, and strings
// func formatNumber(v interface{}) string {
//     switch val := v.(type) {
//     case int64:
//         return fmt.Sprintf("%d.00", val)
//     case float64:
//         return fmt.Sprintf("%.2f", val)
//     case string:
//         if val == "" {
//             return "0.00"
//         }
//         if f, err := strconv.ParseFloat(val, 64); err == nil {
//             return fmt.Sprintf("%.2f", f)
//         }
//         return val
//     case nil:
//         return "0.00"
//     default:
//         return toString(v)
//     }
// }

// formatTime handles both time.Time and string in "DD-MMM-YY" or "D-MMM-YY" format
func formatTime(value interface{}) string {
	switch v := value.(type) {
	case time.Time:
		if v.IsZero() {
			return ""
		}
		return v.Format("02-Jan-06")
	case string:
		if v == "" {
			return ""
		}
		formats := []string{"02-Jan-06", "2-Jan-06", "1-Jan-06"} // Added "1-Jan-06" for single-digit days
		for _, format := range formats {
			t, err := time.Parse(format, v)
			if err == nil {
				return t.Format("02-Jan-06")
			}
		}
		log.Printf("Failed to parse time %s: no matching format", v)
		return v
	default:
		return ""
	}
}

func ExportCSV1(c *gin.Context) {
	requestID := uuid.New().String()
	log.Printf("[%s] Starting ExportCSV1 process", requestID)

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=SSRDataProcess.csv")

	ctx, cancel := context.WithTimeout(context.Background(), 600*time.Second)
	defer cancel()

	dashboardSsrCollection := db.GetCollection("dashboard_ssr")
	processesCollection := db.GetCollection("processes")

	var existingProcess bson.M
	err := processesCollection.FindOne(ctx, bson.M{"status": "running", "type": "export"}).Decode(&existingProcess)
	if err == nil {
		log.Printf("[%s] Another export process is already running", requestID)
		c.Header("Content-Type", "application/json")
		c.JSON(http.StatusConflict, gin.H{
			"success":   false,
			"message":   "Another export process is already running. Please wait or stop the current export.",
			"requestID": requestID,
		})
		return
	} else if err != mongo.ErrNoDocuments {
		log.Printf("[%s] Error checking export process status: %v", requestID, err)
		c.Header("Content-Type", "application/json")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":   false,
			"message":   "Error checking export process status",
			"error":     err.Error(),
			"requestID": requestID,
		})
		return
	}

	_, err = processesCollection.InsertOne(ctx, bson.M{
		"requestID": requestID,
		"status":    "running",
		"type":      "export",
		"startTime": time.Now(),
	})
	if err != nil {
		log.Printf("[%s] Failed to lock export process: %v", requestID, err)
		c.Header("Content-Type", "application/json")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":   false,
			"message":   "Failed to start export process",
			"error":     err.Error(),
			"requestID": requestID,
		})
		return
	}
	defer func() {
		if _, err := processesCollection.DeleteOne(ctx, bson.M{"requestID": requestID}); err != nil {
			log.Printf("[%s] Failed to unlock export process: %v", requestID, err)
		}
	}()

	headers := []string{
		"StationOpenDate", "StationCloseDate", "StationNo", "StationCode", "StationCurr", "StationCurrDec",
		"CloseEmpNumber", "TransCode", "DocType", "TktInd", "TicketNumber", "PaxName",
		"RefundTicket", "ExchTicket", "PreConjTicket", "IssuedDate", "PNRR", "AgentDie", "TourCode", "FOP",
		"intlcode", "Route1", "Route2", "Route3", "Route4", "Route5",
		"dateofFlight1", "dateofFlight2", "dateofFlight3", "dateofFlight4",
		"code1", "code2", "code3", "code4",
		"EMDRemark1", "EMDRemark2", "EMDRemark3", "EMDRemark4",
		"TktBaseFare", "TktPPN", "D8", "T6", "TktFSurcharge", "YR",
		"tktadm", "TktApoTax", "CalcTotal", "exbprasdesc", "country",
	}

	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	if err := writer.Write(headers); err != nil {
		log.Printf("[%s] Failed to write CSV headers: %v", requestID, err)
		c.Header("Content-Type", "application/json")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":   false,
			"message":   "Failed to write CSV headers",
			"error":     err.Error(),
			"requestID": requestID,
		})
		return
	}
	writer.Flush()

	batchSize := int64(5000)
	skip := int64(0)
	recordCount := 0
	for {
		if ctx.Err() != nil {
			log.Printf("[%s] Process canceled or timed out: %v", requestID, ctx.Err())
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusInternalServerError, gin.H{
				"success":   false,
				"message":   "Export process canceled or timed out",
				"error":     ctx.Err().Error(),
				"requestID": requestID,
			})
			return
		}

		cursor, err := dashboardSsrCollection.Find(ctx, bson.D{}, &options.FindOptions{
			Skip:  &skip,
			Limit: &batchSize,
		})
		if err != nil {
			log.Printf("[%s] Failed to query dashboard_ssr: %v", requestID, err)
			c.Header("Content-Type", "application/json")
			c.JSON(http.StatusInternalServerError, gin.H{
				"success":   false,
				"message":   "Failed to query dashboard_ssr",
				"error":     err.Error(),
				"requestID": requestID,
			})
			return
		}

		hasNext := false
		for cursor.Next(ctx) {
			hasNext = true
			var doc map[string]interface{}
			if err := cursor.Decode(&doc); err != nil {
				log.Printf("[%s] Failed to decode document: %v", requestID, err)
				continue
			}
			row := []string{
				formatTime(doc["StationOpenDate"]),
				formatTime(doc["StationCloseDate"]),
				toString(doc["StationNo"]),
				toString(doc["StationCode"]),
				toString(doc["StationCurr"]),
				formatNumber(doc["StationCurrDec"]),
				toString(doc["CloseEmpNumber"]),
				toString(doc["TransCode"]),
				toString(doc["DocType"]),
				toString(doc["TktInd"]),
				toString(doc["TicketNumber"]),
				toString(doc["PaxName"]),
				toString(doc["RefundTicket"]),
				toString(doc["exchTicket"]),
				toString(doc["PreConjTicket"]),
				formatTime(doc["IssuedDate"]),
				toString(doc["PNRR"]),
				toString(doc["AgentDie"]),
				toString(doc["TourCode"]),
				toString(doc["FOP"]),
				toString(doc["intlcode"]),
				toString(doc["Route1"]),
				toString(doc["Route2"]),
				toString(doc["Route3"]),
				toString(doc["Route4"]),
				toString(doc["Route5"]),
				formatTime(doc["dateofFlight1"]),
				formatTime(doc["dateofFlight2"]),
				formatTime(doc["dateofFlight3"]),
				formatTime(doc["dateofFlight4"]),
				toString(doc["code1"]),
				toString(doc["code2"]),
				toString(doc["code3"]),
				toString(doc["code4"]),
				toString(doc["EMDRemark1"]),
				toString(doc["EMDRemark2"]),
				toString(doc["EMDRemark3"]),
				toString(doc["EMDRemark4"]),
				formatNumber(doc["TktBaseFare"]),
				formatNumber(doc["TktPPN"]),
				formatNumber(doc["D8"]),
				formatNumber(doc["T6"]),
				formatNumber(doc["TktFSurcharge"]),
				formatNumber(doc["YR"]),
				formatNumber(doc["tktadm"]),
				formatNumber(doc["TktApoTax"]),
				formatNumber(doc["CalcTotal"]),
				toString(doc["exbprasdesc"]),
				toString(doc["country"]),
			}

			if err := writer.Write(row); err != nil {
				log.Printf("[%s] Failed to write CSV row: %v", requestID, err)
				continue
			}
			recordCount++
		}
		cursor.Close(ctx)

		if !hasNext {
			break
		}
		skip += batchSize
		writer.Flush()
	}

	log.Printf("[%s] Exported %d records to CSV successfully", requestID, recordCount)
	writer.Flush()
	if err := writer.Error(); err != nil {
		log.Printf("[%s] CSV writer error: %v", requestID, err)
		c.Header("Content-Type", "application/json")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":   false,
			"message":   "Failed to write CSV",
			"error":     err.Error(),
			"requestID": requestID,
		})
		return
	}

	log.Printf("[%s] ExportCSV1 completed successfully", requestID)
}
