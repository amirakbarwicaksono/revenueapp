package handlers

import (
	"context"
	"encoding/csv"
	"log"
	"net/http"
	"strings"
	"time"

	"backend/db"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ExportFilteredCSV(c *gin.Context) {
	requestID := uuid.New().String()
	log.Printf("[%s] Starting ExportFilteredCSV process", requestID)

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=FilteredSSRData.csv")

	ctx, cancel := context.WithTimeout(context.Background(), 600*time.Second)
	defer cancel()

	// Parse query parameters
	issuedDate := c.Query("issuedDate")
	country := c.Query("country")
	airline := c.Query("airline")
	searchTerm := c.Query("searchTerm")

	// Determine date field
	dateField := "IssuedDate"
	if count, err := db.GetCollection("dashboard_ssr").CountDocuments(ctx, bson.M{"issuedDate": bson.M{"$exists": true}}); err == nil && count > 0 {
		dateField = "issuedDate"
		log.Printf("[%s] Using issuedDate field for filtering", requestID)
	} else {
		log.Printf("[%s] Using IssuedDate field for filtering", requestID)
	}

	// Build filter
	filter := bson.M{}
	if issuedDate != "" {
		parsedDate, err := time.Parse("Jan-2006", issuedDate)
		if err == nil {
			monthAbbrev := parsedDate.Format("Jan")
			monthNum := parsedDate.Format("01")
			year := parsedDate.Format("2006")
			yearShort := year[2:]
			patterns := []string{
				monthAbbrev + ".*" + year,                     // Apr.*2025
				monthAbbrev + "[ -]" + year,                   // Apr-2025, Apr 2025
				"[0-3][0-9]-" + monthAbbrev + "-" + yearShort, // 27-Apr-25
				year + "-" + monthNum,                         // 2025-04
				monthAbbrev + "[ -]" + yearShort,              // Apr-25, Apr 25
				"[0-3][0-9]/" + monthNum + "/" + year,         // 27/04/2025
			}
			filter[dateField] = bson.M{"$regex": strings.Join(patterns, "|"), "$options": "i"}
		} else {
			log.Printf("[%s] Error parsing issuedDate %s: %v", requestID, issuedDate, err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid issuedDate format"})
			return
		}
	}
	if country != "" {
		filter["country"] = bson.M{"$regex": country, "$options": "i"} // Case-insensitive
	}
	if airline != "" {
		filter["Airlines"] = bson.M{"$regex": airline, "$options": "i"} // Case-insensitive
	}
	if searchTerm != "" {
		filter["$or"] = []bson.M{
			{"TicketNumber": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"PaxName": bson.M{"$regex": searchTerm, "$options": "i"}},
		}
		log.Printf("[%s] Applying search term: %s", requestID, searchTerm)
	}

	log.Printf("[%s] Applying filter: %v", requestID, filter)

	dashboardSsrCollection := db.GetCollection("dashboard_ssr")

	// Count total documents
	totalDocs, err := dashboardSsrCollection.CountDocuments(ctx, filter)
	if err != nil {
		log.Printf("[%s] Error counting documents: %v", requestID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count documents"})
		return
	}
	log.Printf("[%s] Total matching documents: %d", requestID, totalDocs)

	// Debug: Log distinct values if no documents found
	if totalDocs == 0 {
		if issuedDate != "" {
			for _, field := range []string{"IssuedDate", "issuedDate"} {
				values, err := dashboardSsrCollection.Distinct(ctx, field, bson.M{})
				if err == nil && len(values) > 0 {
					log.Printf("[%s] Distinct %s values: %v", requestID, field, values)
				}
			}
		}
		if searchTerm != "" {
			for _, field := range []string{"TicketNumber", "PaxName"} {
				values, err := dashboardSsrCollection.Distinct(ctx, field, bson.M{})
				if err == nil && len(values) > 0 {
					log.Printf("[%s] Distinct %s values: %v", requestID, field, values)
				}
			}
		}
	}

	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	// Write headers
	headers := []string{
		"StationOpenDate", "StationCloseDate", "StationNo", "StationCode", "StationCurr",
		"CloseEmpNumber", "TransCode", "DocType", "TktInd", "TicketNumber", "PaxName",
		"RefundTicket", "exchTicket", "PreConjTicket", "IssuedDate", "PNRR", "AgentDie", "TourCode", "FOP",
		"Route1", "Route2", "Route3", "Route4", "Route5",
		"dateofFlight1", "dateofFlight2", "dateofFlight3", "dateofFlight4",
		"code1", "code2", "code3", "code4",
		"EMDRemark1", "EMDRemark2", "EMDRemark3", "EMDRemark4",
		"TktBaseFare", "TktPPN", "D8", "T6", "TktFSurcharge", "YR",
		"tktadm", "TktApoTax", "CalcTotal", "exbprasdesc", "country", "Airlines",
	}
	if err := writer.Write(headers); err != nil {
		log.Printf("[%s] Failed to write CSV headers: %v", requestID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV headers"})
		return
	}
	writer.Flush()

	// Track exported rows
	var exportedRows int64

	batchSize := int64(5000)
	skip := int64(0)
	for {
		cursor, err := dashboardSsrCollection.Find(ctx, filter, &options.FindOptions{
			Skip:  &skip,
			Limit: &batchSize,
		})
		if err != nil {
			log.Printf("[%s] Failed to query dashboard_ssr: %v", requestID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query data"})
			return
		}

		hasNext := false
		for cursor.Next(ctx) {
			hasNext = true
			var doc bson.M
			if err := cursor.Decode(&doc); err != nil {
				log.Printf("[%s] Failed to decode document: %v", requestID, err)
				continue
			}
			row := []string{
				safeString(formatTime(doc["StationOpenDate"])),
				safeString(formatTime(doc["StationCloseDate"])),
				safeString(toString(doc["StationNo"])),
				safeString(toString(doc["StationCode"])),
				safeString(toString(doc["StationCurr"])),
				// safeString(formatNumber(doc["StationCurrDec"])),
				safeString(toString(doc["CloseEmpNumber"])),
				safeString(toString(doc["TransCode"])),
				safeString(toString(doc["DocType"])),
				safeString(toString(doc["TktInd"])),
				safeString(toString(doc["TicketNumber"])),
				safeString(toString(doc["PaxName"])),
				safeString(toString(doc["RefundTicket"])),
				safeString(toString(doc["exchTicket"])),
				safeString(toString(doc["PreConjTicket"])),
				safeString(formatTime(doc["IssuedDate"])),
				safeString(toString(doc["PNRR"])),
				safeString(toString(doc["AgentDie"])),
				safeString(toString(doc["TourCode"])),
				safeString(toString(doc["FOP"])),
				// safeString(toString(doc["intlcode"])),
				safeString(toString(doc["Route1"])),
				safeString(toString(doc["Route2"])),
				safeString(toString(doc["Route3"])),
				safeString(toString(doc["Route4"])),
				safeString(toString(doc["Route5"])),
				safeString(formatTime(doc["dateofFlight1"])),
				safeString(formatTime(doc["dateofFlight2"])),
				safeString(formatTime(doc["dateofFlight3"])),
				safeString(formatTime(doc["dateofFlight4"])),
				safeString(toString(doc["code1"])),
				safeString(toString(doc["code2"])),
				safeString(toString(doc["code3"])),
				safeString(toString(doc["code4"])),
				safeString(toString(doc["EMDRemark1"])),
				safeString(toString(doc["EMDRemark2"])),
				safeString(toString(doc["EMDRemark3"])),
				safeString(toString(doc["EMDRemark4"])),
				safeString(formatNumber(doc["TktBaseFare"])),
				safeString(formatNumber(doc["TktPPN"])),
				safeString(formatNumber(doc["D8"])),
				safeString(formatNumber(doc["T6"])),
				safeString(formatNumber(doc["TktFSurcharge"])),
				safeString(formatNumber(doc["YR"])),
				safeString(formatNumber(doc["tktadm"])),
				safeString(formatNumber(doc["TktApoTax"])),
				safeString(formatNumber(doc["CalcTotal"])),
				safeString(toString(doc["exbprasdesc"])),
				safeString(toString(doc["country"])),
				safeString(toString(doc["Airlines"])), // Ensure Airlines field is included
			}
			if err := writer.Write(row); err != nil {
				log.Printf("[%s] Failed to write CSV row: %v", requestID, err)
				continue
			}
			exportedRows++
		}
		if err := cursor.Err(); err != nil {
			log.Printf("[%s] Cursor error: %v", requestID, err)
		}
		cursor.Close(ctx)

		if !hasNext {
			break
		}
		skip += batchSize
		writer.Flush()
	}

	log.Printf("[%s] ExportFilteredCSV completed successfully with %d documents exported (expected %d)", requestID, exportedRows, totalDocs)

	if exportedRows != totalDocs {
		log.Printf("[%s] WARNING: Mismatch in exported rows (%d) vs expected (%d)", requestID, exportedRows, totalDocs)
	}
}

// Helper functions
func safeString(s string) string {
	// Remove or escape problematic characters for CSV
	s = strings.ReplaceAll(s, "\n", " ")
	s = strings.ReplaceAll(s, "\r", " ")
	s = strings.ReplaceAll(s, ",", ";")
	return s
}

// func formatTime(value interface{}) string {
// 	if value == nil {
// 		return ""
// 	}
// 	if t, ok := value.(time.Time); ok {
// 		return t.Format("2-Jan-06")
// 	}
// 	if s, ok := value.(string); ok && s != "" {
// 		for _, format := range []string{
// 			"2-Jan-06",
// 			"Jan-2006",
// 			"2006-01-02",
// 			"Jan 2006",
// 			"2006-01",
// 			"2006-01-02T15:04:05Z",
// 			"02/01/2006",
// 			"2-Jan-2006",
// 		} {
// 			if parsed, err := time.Parse(format, s); err == nil {
// 				return parsed.Format("2-Jan-06")
// 			}
// 		}
// 	}
// 	return toString(value)
// }

// func formatNumber(value interface{}) string {
// 	if value == nil {
// 		return ""
// 	}
// 	switch v := value.(type) {
// 	case float64:
// 		return strconv.FormatFloat(v, 'f', 2, 64)
// 	case int:
// 		return strconv.Itoa(v)
// 	case int64:
// 		return strconv.FormatInt(v, 10)
// 	default:
// 		return toString(value)
// 	}
// }

// func toString(value interface{}) string {
// 	if value == nil {
// 		return ""
// 	}
// 	switch v := value.(type) {
// 	case string:
// 		return v
// 	case int64:
// 		return strconv.FormatInt(v, 10)
// 	case float64:
// 		return strconv.FormatFloat(v, 'f', 2, 64)
// 	case time.Time:
// 		return v.Format("2-Jan-06")
// 	default:
// 		return ""
// 	}
// }
