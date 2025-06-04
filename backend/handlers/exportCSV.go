package handlers

import (
	"context"
	"encoding/csv"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"backend/db"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// toString converts an interface to string, handling nil and various types
func toString(v interface{}) string {
	if v == nil {
		return ""
	}
	switch val := v.(type) {
	case string:
		return val
	case int64:
		return strconv.FormatInt(val, 10)
	case float64:
		return strconv.FormatFloat(val, 'f', -1, 64)
	case bool:
		return strconv.FormatBool(val)
	default:
		return fmt.Sprintf("%v", val)
	}
}

// formatNumber formats numbers, handling int64 and float64
func formatNumber(v interface{}) string {
	switch val := v.(type) {
	case int64:
		return fmt.Sprintf("%d.00", val)
	case float64:
		return fmt.Sprintf("%.2f", val)
	case nil:
		return "0.00"
	default:
		return toString(v)
	}
}

// // formatTime handles both time.Time and string in "DD-MMM-YY" or "D-MMM-YY" format
// func formatTime(value interface{}) string {
// 	switch v := value.(type) {
// 	case time.Time:
// 		if v.IsZero() {
// 			return ""
// 		}
// 		return v.Format("02-Jan-06")
// 	case string:
// 		if v == "" {
// 			return ""
// 		}
// 		// Try multiple date formats
// 		formats := []string{"02-Jan-06", "2-Jan-06"}
// 		for _, format := range formats {
// 			t, err := time.Parse(format, v)
// 			if err == nil {
// 				return t.Format("02-Jan-06")
// 			}
// 		}
// 		log.Printf("Failed to parse time %s: no matching format", v)
// 		return v // Fallback to original string
// 	default:
// 		return ""
// 	}
// }

func ExportCSV(c *gin.Context) {
	log.Println("ExportCSV endpoint called")
	c.Writer.Header().Set("Content-Type", "text/csv")
	c.Writer.Header().Set("Content-Disposition", "attachment;filename=DataFpr_Lookup_2025.csv")

	collection := db.GetCollection("lookup_process")
	csvWriter := csv.NewWriter(c.Writer)
	defer csvWriter.Flush()

	headers := []string{
		"YearFlown", "MonthFlown", "PartitionCode", "StationOpenDate", "StationNo",
		"CountryName", "CityCode", "SalesCurrency", "TicketNumber", "PNRR",
		"PaxName", "IssuedDate", "RefundTicket", "ExchTicket", "PreconjTicket",
		"TransCode", "DocType", "AgentDie", "StationCode", "Channel",
		"AgencyName", "TourCode", "FlightNumber", "FC", "RouteAwal",
		"RouteAkhir", "DateOfFlight", "FareUpdate", "QSFare", "Descr",
		"StatusTicket", "StatusFlight", "Airlines", "FlownDate", "AirlinesTKT",
		"OriginalTransCode", "OriginalTicketNumber", "OriginalCurr", "OriginalFareUpdate",
		"OriginalIssuedDate", "AgentDieOrigin", "StationNoOrigin", "TourCodeOrigin",
	}
	if err := csvWriter.Write(headers); err != nil {
		log.Printf("Failed to write CSV headers: %v", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to write CSV headers",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	cursor, err := collection.Find(ctx, bson.D{})
	if err != nil {
		log.Printf("Failed to fetch data from lookup_process: %v", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch data from lookup_process",
		})
		return
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var doc map[string]interface{}
		if err := cursor.Decode(&doc); err != nil {
			log.Printf("Failed to decode document: %v", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to process data",
			})
			return
		}

		row := []string{
			toString(doc["YearFlown"]),
			toString(doc["MonthFlown"]),
			toString(doc["PartitionCode"]),
			formatTime(doc["stationopendate"]),
			formatNumber(doc["stationno"]),
			toString(doc["countryname"]),
			toString(doc["city_code"]),
			toString(doc["SalesCurrency"]),
			formatNumber(doc["ticketnumber"]),
			toString(doc["PNRR"]),
			toString(doc["Paxname"]),
			formatTime(doc["Issueddate"]),
			toString(doc["RefundTicket"]),
			toString(doc["Exchticket"]),
			toString(doc["PreconjTicket"]),
			toString(doc["transcode"]),
			toString(doc["doctype"]),
			toString(doc["Agentdie"]),
			toString(doc["Stationcode"]),
			toString(doc["Channel"]),
			toString(doc["AgencyName"]),
			toString(doc["tourcode"]),
			toString(doc["Flightnumber"]),
			toString(doc["fc"]),
			toString(doc["routeawal"]),
			toString(doc["routeakhir"]),
			formatTime(doc["dateofflight"]),
			formatNumber(doc["fareupdate"]),
			formatNumber(doc["QSfare"]),
			toString(doc["descr"]),
			toString(doc["StatusTicket"]),
			toString(doc["StatusFlight"]),
			toString(doc["airlines"]),
			formatTime(doc["flowndate"]),
			toString(doc["AirlinesTKT"]),
			toString(doc["OriginalTranscode"]),
			formatNumber(doc["OriginalTicketnumber"]),
			toString(doc["OriginalCurr"]),
			formatNumber(doc["OriginalFareUpdate"]),
			formatTime(doc["OriginalIssueddate"]),
			toString(doc["AgentDieOrigin"]),
			formatNumber(doc["StationnoOrigin"]),
			toString(doc["Tourcodeorigin"]),
		}

		if err := csvWriter.Write(row); err != nil {
			log.Printf("Failed to write CSV row: %v", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to write CSV row",
			})
			return
		}
		csvWriter.Flush()
	}

	if err := cursor.Err(); err != nil {
		log.Printf("Cursor error: %v", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to process data",
		})
		return
	}

	log.Println("CSV export completed successfully")
}
