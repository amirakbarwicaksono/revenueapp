// package handlers

// import (
// 	"context"
// 	"log"
// 	"net/http"
// 	"sort"
// 	"time"

// 	"backend/db"

// 	"github.com/gin-gonic/gin"
// 	"go.mongodb.org/mongo-driver/bson"
// )

// func GetSSRFilterOptions(c *gin.Context) {
// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()

// 	dashboardSsrCollection := db.GetCollection("dashboard_ssr")

// 	// Log collection stats
// 	count, err := dashboardSsrCollection.CountDocuments(ctx, bson.M{})
// 	if err != nil {
// 		log.Printf("Error counting documents: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count documents"})
// 		return
// 	}
// 	log.Printf("Total documents in dashboard_ssr: %d", count)

// 	// Fetch issuedDate values
// 	issuedDates := []interface{}{}
// 	for _, field := range []string{"issuedDate", "IssuedDate"} {
// 		dates, err := dashboardSsrCollection.Distinct(ctx, field, bson.M{})
// 		if err == nil && len(dates) > 0 {
// 			issuedDates = dates
// 			log.Printf("Found %d distinct %s values", len(dates), field)
// 			break
// 		}
// 		log.Printf("No %s values found: %v", field, err)
// 	}

// 	uniqueIssuedDates := []string{}
// 	for _, d := range issuedDates {
// 		if str, ok := d.(string); ok && str != "" {
// 			log.Printf("Processing date: %s", str)
// 			var parsedDate time.Time
// 			formats := []string{"2-Jan-06", "Jan-2006", "01-2006", "2006-01-02", "Jan 2006", "2006-01"}
// 			for _, format := range formats {
// 				if p, err := time.Parse(format, str); err == nil {
// 					parsedDate = p
// 					break
// 				}
// 			}
// 			if parsedDate.IsZero() {
// 				log.Printf("Skipping unparsable date: %s", str)
// 				continue
// 			}
// 			issuedDate := parsedDate.Format("Jan-2006")
// 			if !contains(uniqueIssuedDates, issuedDate) {
// 				uniqueIssuedDates = append(uniqueIssuedDates, issuedDate)
// 			}
// 		}
// 	}
// 	log.Printf("Extracted issuedDates: %v", uniqueIssuedDates)

// 	// Sort issuedDates (newest first)
// 	sort.Slice(uniqueIssuedDates, func(i, j int) bool {
// 		dateI, _ := time.Parse("Jan-2006", uniqueIssuedDates[i])
// 		dateJ, _ := time.Parse("Jan-2006", uniqueIssuedDates[j])
// 		return dateI.After(dateJ)
// 	})

// 	// Fetch unique countries
// 	countries, err := dashboardSsrCollection.Distinct(ctx, "country", bson.M{})
// 	if err != nil {
// 		log.Printf("Error fetching countries: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch countries"})
// 		return
// 	}
// 	uniqueCountries := []string{}
// 	for _, c := range countries {
// 		if str, ok := c.(string); ok && str != "" {
// 			uniqueCountries = append(uniqueCountries, str)
// 		}
// 	}
// 	if len(uniqueCountries) == 0 {
// 		log.Printf("Warning: No countries found")
// 	}

// 	// Fetch unique airlines (stationcode)
// 	airlines, err := dashboardSsrCollection.Distinct(ctx, "stationcode", bson.M{})
// 	if err != nil {
// 		log.Printf("Error fetching airlines: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch airlines"})
// 		return
// 	}
// 	uniqueAirlines := []string{}
// 	for _, a := range airlines {
// 		if str, ok := a.(string); ok && str != "" {
// 			uniqueAirlines = append(uniqueAirlines, str)
// 		}
// 	}
// 	if len(uniqueAirlines) == 0 {
// 		log.Printf("Warning: No airlines found")
// 	}

// 	log.Printf("Returning filter options: issuedDates=%v, countries=%v, airlines=%v",
// 		uniqueIssuedDates, uniqueCountries, uniqueAirlines)

// 	c.JSON(http.StatusOK, gin.H{
// 		"issuedDates": uniqueIssuedDates,
// 		"countries":   uniqueCountries,
// 		"airlines":    uniqueAirlines,
// 	})
// }

// // Helper function to check if slice contains a string
// func contains(slice []string, item string) bool {
// 	for _, s := range slice {
// 		if s == item {
// 			return true
// 		}
// 	}
// 	return false
// }

package handlers

import (
	"context"
	"log"
	"net/http"
	"sort"
	"time"

	"backend/db"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetSSRFilterOptions(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dashboardSsrCollection := db.GetCollection("dashboard_ssr")

	count, err := dashboardSsrCollection.CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Printf("Error counting documents: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count documents"})
		return
	}
	log.Printf("Total documents in dashboard_ssr: %d", count)

	// Fetch issuedDate values
	issuedDates := []interface{}{}
	for _, field := range []string{"IssuedDate", "issuedDate"} {
		dates, err := dashboardSsrCollection.Distinct(ctx, field, bson.M{})
		if err == nil && len(dates) > 0 {
			issuedDates = dates
			log.Printf("Found %d distinct %s values", len(dates), field)
			break
		}
		log.Printf("No %s values found: %v", field, err)
	}

	uniqueIssuedDates := []string{}
	for _, d := range issuedDates {
		if str, ok := d.(string); ok && str != "" {
			log.Printf("Processing date: %s", str)
			var parsedDate time.Time
			formats := []string{"2-Jan-06", "Jan-2006", "01-2006", "2006-01-02", "Jan 2006", "2006-01"}
			for _, format := range formats {
				if p, err := time.Parse(format, str); err == nil {
					parsedDate = p
					break
				}
			}
			if parsedDate.IsZero() {
				log.Printf("Skipping unparsable date: %s", str)
				continue
			}
			issuedDate := parsedDate.Format("Jan-2006")
			if !contains(uniqueIssuedDates, issuedDate) {
				uniqueIssuedDates = append(uniqueIssuedDates, issuedDate)
			}
		}
	}
	log.Printf("Extracted issuedDates: %v", uniqueIssuedDates)

	// Sort issuedDates (newest first)
	sort.Slice(uniqueIssuedDates, func(i, j int) bool {
		dateI, _ := time.Parse("Jan-2006", uniqueIssuedDates[i])
		dateJ, _ := time.Parse("Jan-2006", uniqueIssuedDates[j])
		return dateI.After(dateJ)
	})

	// Fetch unique countries
	countries, err := dashboardSsrCollection.Distinct(ctx, "country", bson.M{})
	if err != nil {
		log.Printf("Error fetching countries: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch countries"})
		return
	}
	uniqueCountries := []string{}
	for _, c := range countries {
		if str, ok := c.(string); ok && str != "" {
			uniqueCountries = append(uniqueCountries, str)
		}
	}
	if len(uniqueCountries) == 0 {
		log.Printf("Warning: No countries found")
	}

	// Fetch unique airlines (stationcode)
	airlines, err := dashboardSsrCollection.Distinct(ctx, "Airlines", bson.M{})
	if err != nil {
		log.Printf("Error fetching airlines: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch airlines"})
		return
	}
	uniqueAirlines := []string{}
	for _, a := range airlines {
		if str, ok := a.(string); ok && str != "" {
			uniqueAirlines = append(uniqueAirlines, str)
		}
	}
	if len(uniqueAirlines) == 0 {
		log.Printf("Warning: No airlines found")
	}

	log.Printf("Returning filter options: issuedDates=%v, countries=%v, airlines=%v",
		uniqueIssuedDates, uniqueCountries, uniqueAirlines)

	c.JSON(http.StatusOK, gin.H{
		"issuedDates": uniqueIssuedDates,
		"countries":   uniqueCountries,
		"airlines":    uniqueAirlines,
	})
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
