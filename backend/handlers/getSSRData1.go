package handlers

import (
	"context"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"backend/db"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetSSRData1(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 200*time.Second)
	defer cancel()

	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.Query("pageSize"))
	if pageSize < 1 {
		pageSize = 15
	}
	issuedDate := c.Query("issuedDate")
	year := c.Query("year")
	month := c.Query("month")
	country := c.Query("country")
	airline := c.Query("airline")
	searchTerm := c.Query("searchTerm") // Added searchTerm

	// Determine date field
	dateField := "issuedDate"
	if count, _ := db.GetCollection("dashboard_ssr").CountDocuments(ctx, bson.M{"IssuedDate": bson.M{"$exists": true}}); count > 0 {
		dateField = "IssuedDate"
		log.Printf("Using IssuedDate field for filtering")
	}
	log.Printf("Date field: %s", dateField)

	// Build filter
	filter := bson.M{}
	if issuedDate != "" {
		parsedDate, err := time.Parse("Jan-2006", issuedDate)
		if err == nil {
			monthAbbrev := parsedDate.Format("Jan")
			year := parsedDate.Format("2006")
			patterns := []string{
				monthAbbrev + ".*" + year,
				monthAbbrev + "[ -]" + year,
				"[0-3][0-9]-" + monthAbbrev + "-" + year[2:],
				year + "-04",
			}
			filter[dateField] = bson.M{"$regex": strings.Join(patterns, "|"), "$options": "i"}
		} else {
			log.Printf("Error parsing issuedDate %s: %v", issuedDate, err)
		}
	} else if year != "" || month != "" {
		monthAbbrev := ""
		if month != "" {
			monthMap := map[string]string{
				"January": "Jan", "February": "Feb", "March": "Mar", "April": "Apr",
				"May": "May", "June": "Jun", "July": "Jul", "August": "Aug",
				"September": "Sep", "October": "Oct", "November": "Nov", "December": "Dec",
				"Jan": "Jan", "Feb": "Feb", "Mar": "Mar", "Apr": "Apr",
				"Sep": "Sep", "Oct": "Oct", "Nov": "Nov", "Dec": "Dec",
			}
			if abbr, ok := monthMap[strings.Title(strings.ToLower(month))]; ok {
				monthAbbrev = abbr
			}
		}
		if monthAbbrev != "" && year != "" {
			filter[dateField] = bson.M{"$regex": monthAbbrev + ".*" + year, "$options": "i"}
		} else if monthAbbrev != "" {
			filter[dateField] = bson.M{"$regex": monthAbbrev, "$options": "i"}
		} else if year != "" {
			filter[dateField] = bson.M{"$regex": year, "$options": "i"}
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
			{"PNRR": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"TicketNumber": bson.M{"$regex": searchTerm, "$options": "i"}},
		}
		log.Printf("Applying search term: %s", searchTerm)
	}

	log.Printf("Applying filter: %v", filter)

	dashboardSsrCollection := db.GetCollection("dashboard_ssr")

	// Count total documents
	totalDocs, err := dashboardSsrCollection.CountDocuments(ctx, filter)
	if err != nil {
		log.Printf("Error counting documents: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count documents"})
		return
	}
	log.Printf("Total matching documents: %d", totalDocs)

	// If no documents, log distinct values for debugging
	if totalDocs == 0 {
		if issuedDate != "" {
			for _, field := range []string{"issuedDate", "IssuedDate"} {
				values, err := dashboardSsrCollection.Distinct(ctx, field, bson.M{})
				if err == nil && len(values) > 0 {
					log.Printf("Distinct %s values: %v", field, values)
				}
			}
		}
		if searchTerm != "" {
			for _, field := range []string{"PNRR", "TicketNumber"} {
				values, err := dashboardSsrCollection.Distinct(ctx, field, bson.M{})
				if err == nil && len(values) > 0 {
					log.Printf("Distinct %s values: %v", field, values)
				}
			}
		}
	}

	// Fetch paginated data
	skip := int64((page - 1) * pageSize)
	limit := int64(pageSize)
	cursor, err := dashboardSsrCollection.Find(ctx, filter, &options.FindOptions{
		Skip:  &skip,
		Limit: &limit,
	})
	if err != nil {
		log.Printf("Error fetching data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}
	defer cursor.Close(ctx)

	var data []map[string]interface{}
	for cursor.Next(ctx) {
		var doc bson.M
		if err := cursor.Decode(&doc); err != nil {
			log.Printf("Error decoding document: %v", err)
			continue
		}
		// Convert fields to strings for frontend compatibility
		formattedDoc := make(map[string]interface{})
		for key, value := range doc {
			switch v := value.(type) {
			case time.Time:
				formattedDoc[key] = v.Format("2-Jan-06")
			case int64:
				formattedDoc[key] = strconv.FormatInt(v, 10)
			case float64:
				formattedDoc[key] = strconv.FormatFloat(v, 'f', 2, 64)
			case nil:
				formattedDoc[key] = ""
			default:
				formattedDoc[key] = toString(value)
			}
		}
		data = append(data, formattedDoc)
	}
	if err := cursor.Err(); err != nil {
		log.Printf("Cursor error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process data"})
		return
	}

	log.Printf("Fetched %d records for page %d", len(data), page)

	c.JSON(http.StatusOK, gin.H{
		"data":      data,
		"totalDocs": totalDocs,
	})
}

// // Helper function to convert values to string
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
