// package handlers

// import (
// 	"context"
// 	"fmt"
// 	"log"
// 	"net/http"
// 	"strconv"
// 	"strings"
// 	"time"

// 	"backend/db"

// 	"github.com/gin-gonic/gin"
// 	"go.mongodb.org/mongo-driver/bson"
// 	"go.mongodb.org/mongo-driver/mongo"
// )

// // monthNameToNumber maps month names to numbers (1-12)
// var monthNameToNumber = map[string]int{
// 	"january":   1,
// 	"february":  2,
// 	"march":     3,
// 	"april":     4,
// 	"may":       5,
// 	"june":      6,
// 	"july":      7,
// 	"august":    8,
// 	"september": 9,
// 	"october":   10,
// 	"november":  11,
// 	"december":  12,
// }

// // DashboardManagement handles queries for the management dashboard
// func DashboardManagement(c *gin.Context) {
// 	collection := db.GetCollection("dashboard_orc")
// 	ctx, cancel := context.WithTimeout(context.Background(), 130*time.Second)
// 	defer cancel()

// 	// Parse query parameters
// 	year := c.Query("year")
// 	month := c.Query("month")
// 	country := c.Query("country")
// 	transcode := c.Query("transcode")

// 	// Build match filter
// 	matchFilter := bson.M{}
// 	if year != "" {
// 		matchFilter["YearFlown"] = year
// 	}
// 	if month != "" {
// 		month = strings.ToLower(month)
// 		if monthInt, err := strconv.Atoi(month); err == nil {
// 			monthVariants := []interface{}{
// 				strconv.Itoa(monthInt),
// 				getMonthName(monthInt),
// 				fmt.Sprintf("%02d", monthInt),  // e.g., "06"
// 				getMonthAbbreviation(monthInt), // e.g., "Jun"
// 			}
// 			matchFilter["MonthFlown"] = bson.M{
// 				"$in": monthVariants,
// 			}
// 		} else {
// 			monthVariants := []interface{}{month}
// 			if monthNum, ok := monthNameToNumber[month]; ok {
// 				monthVariants = append(monthVariants,
// 					strconv.Itoa(monthNum),
// 					fmt.Sprintf("%02d", monthNum),
// 					getMonthAbbreviation(monthNum),
// 				)
// 			}
// 			matchFilter["MonthFlown"] = bson.M{
// 				"$in": monthVariants,
// 			}
// 		}
// 	}
// 	if transcode != "" {
// 		matchFilter["transcode"] = bson.M{"$regex": transcode, "$options": "i"} // Case-insensitive
// 	}

// 	log.Printf("matchFilter: %+v", matchFilter)

// 	// 1. Get available years
// 	yearCursor, err := collection.Distinct(ctx, "YearFlown", bson.M{})
// 	if err != nil {
// 		log.Printf("Failed to fetch years: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch years"})
// 		return
// 	}
// 	years := make([]int, 0, len(yearCursor))
// 	for _, y := range yearCursor {
// 		var yearInt int
// 		switch v := y.(type) {
// 		case string:
// 			yearInt, err = strconv.Atoi(v)
// 			if err != nil {
// 				log.Printf("Invalid year format: %v", v)
// 				continue
// 			}
// 		case int32:
// 			yearInt = int(v)
// 		case int64:
// 			yearInt = int(v)
// 		default:
// 			log.Printf("Unsupported year type: %T", v)
// 			continue
// 		}
// 		years = append(years, yearInt)
// 	}

// 	// 2. Get available months
// 	monthFilter := bson.M{}
// 	if year != "" && month != "" { // Only filter by year if both year and month are selected
// 		monthFilter["YearFlown"] = year
// 	}
// 	monthCursor, err := collection.Distinct(ctx, "MonthFlown", monthFilter)
// 	if err != nil {
// 		log.Printf("Failed to fetch months: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch months"})
// 		return
// 	}
// 	months := make([]int, 0, len(monthCursor))
// 	for _, m := range monthCursor {
// 		var monthInt int
// 		switch v := m.(type) {
// 		case string:
// 			if n, err := strconv.Atoi(v); err == nil {
// 				monthInt = n
// 			} else {
// 				vLower := strings.ToLower(v)
// 				if n, ok := monthNameToNumber[vLower]; ok {
// 					monthInt = n
// 				} else {
// 					log.Printf("Invalid month format: %v", v)
// 					continue
// 				}
// 			}
// 		case int32:
// 			monthInt = int(v)
// 		case int64:
// 			monthInt = int(v)
// 		default:
// 			log.Printf("Unsupported month type: %T", v)
// 			continue
// 		}
// 		if monthInt >= 1 && monthInt <= 12 {
// 			months = append(months, monthInt)
// 		}
// 	}

// 	// 3. Get available countries
// 	countriesCursor, err := collection.Distinct(ctx, "countryname", matchFilter)
// 	if err != nil {
// 		log.Printf("Failed to fetch countries: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch countries"})
// 		return
// 	}
// 	countries := make([]string, 0, len(countriesCursor))
// 	for _, c := range countriesCursor {
// 		if countryStr, ok := c.(string); ok && countryStr != "" {
// 			countries = append(countries, countryStr)
// 		}
// 	}

// 	// 4. Get available airlines
// 	airlinesCursor, err := collection.Distinct(ctx, "airlines", matchFilter)
// 	if err != nil {
// 		log.Printf("Failed to fetch airlines: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch airlines"})
// 		return
// 	}
// 	airlines := make([]string, 0, len(airlinesCursor))
// 	for _, a := range airlinesCursor {
// 		if airlineStr, ok := a.(string); ok && airlineStr != "" {
// 			airlines = append(airlines, airlineStr)
// 		}
// 	}

// 	// 5. Top 10 countries by total ticket count
// 	topCountriesPipeline := mongo.Pipeline{
// 		{{Key: "$match", Value: matchFilter}},
// 		{{Key: "$group", Value: bson.M{
// 			"_id": bson.M{
// 				"$ifNull": []interface{}{"$countryname", "Unknown"},
// 			},
// 			"totalFare": bson.M{
// 				"$sum": bson.M{
// 					"$convert": bson.M{
// 						"input":   "$fareupdate",
// 						"to":      "double",
// 						"onError": 0,
// 						"onNull":  0,
// 					},
// 				},
// 			},
// 			"ticketCount": bson.M{"$sum": 1},
// 		}}},
// 		{{Key: "$sort", Value: bson.M{"ticketCount": -1}}},
// 		{{Key: "$limit", Value: 10}},
// 	}
// 	topCountriesCursor, err := collection.Aggregate(ctx, topCountriesPipeline)
// 	if err != nil {
// 		log.Printf("Failed to fetch top countries: %v, matchFilter: %v", err, matchFilter)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch top countries"})
// 		return
// 	}
// 	var topCountries []bson.M
// 	if err := topCountriesCursor.All(ctx, &topCountries); err != nil {
// 		log.Printf("Failed to decode top countries: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode top countries"})
// 		return
// 	}

// 	// 6. Partition codes by ticket count
// 	partitionPipeline := mongo.Pipeline{
// 		{{Key: "$match", Value: matchFilter}},
// 		{{Key: "$group", Value: bson.M{
// 			"_id": bson.M{
// 				"$ifNull": []interface{}{"$PartitionCode", "Unknown"},
// 			},
// 			"ticketCount": bson.M{"$sum": 1},
// 		}}},
// 		{{Key: "$sort", Value: bson.M{"ticketCount": -1}}},
// 	}
// 	partitionCursor, err := collection.Aggregate(ctx, partitionPipeline)
// 	if err != nil {
// 		log.Printf("Failed to fetch partition codes: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch partition codes"})
// 		return
// 	}
// 	var partitions []bson.M
// 	if err := partitionCursor.All(ctx, &partitions); err != nil {
// 		log.Printf("Failed to decode partition codes: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode partition codes"})
// 		return
// 	}

// 	// 7. Channels by ticket count
// 	channelsPipeline := mongo.Pipeline{
// 		{{Key: "$match", Value: matchFilter}},
// 		{{Key: "$group", Value: bson.M{
// 			"_id": bson.M{
// 				"$ifNull": []interface{}{"$Channel", "Unknown"},
// 			},
// 			"ticketCount": bson.M{"$sum": 1},
// 		}}},
// 		{{Key: "$sort", Value: bson.M{"ticketCount": -1}}},
// 	}
// 	channelsCursor, err := collection.Aggregate(ctx, channelsPipeline)
// 	if err != nil {
// 		log.Printf("Failed to fetch channels: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch channels"})
// 		return
// 	}
// 	var channels []bson.M
// 	if err := channelsCursor.All(ctx, &channels); err != nil {
// 		log.Printf("Failed to decode channels: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode channels"})
// 		return
// 	}

// 	// 8. Route performance statistics
// 	routePerformancePipeline := mongo.Pipeline{
// 		{{Key: "$match", Value: matchFilter}},
// 		{{Key: "$group", Value: bson.M{
// 			"_id": bson.M{
// 				"route": bson.M{
// 					"$concat": []interface{}{
// 						bson.M{"$ifNull": []interface{}{"$routeawal", "Unknown"}},
// 						"-",
// 						bson.M{"$ifNull": []interface{}{"$routeakhir", "Unknown"}},
// 					},
// 				},
// 			},
// 			"totalFare": bson.M{
// 				"$sum": bson.M{
// 					"$convert": bson.M{
// 						"input":   "$fareupdate",
// 						"to":      "double",
// 						"onError": 0,
// 						"onNull":  0,
// 					},
// 				},
// 			},
// 			"ticketCount": bson.M{"$sum": 1},
// 		}}},
// 		{{Key: "$sort", Value: bson.M{"ticketCount": -1}}},
// 		{{Key: "$limit", Value: 10}}, // Top 10 routes
// 	}
// 	routePerformanceCursor, err := collection.Aggregate(ctx, routePerformancePipeline)
// 	if err != nil {
// 		log.Printf("Failed to fetch route performance stats: %v, matchFilter: %v", err, matchFilter)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch route performance stats"})
// 		return
// 	}
// 	var routePerformanceStats []bson.M
// 	if err := routePerformanceCursor.All(ctx, &routePerformanceStats); err != nil {
// 		log.Printf("Failed to decode route performance stats: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode route performance stats"})
// 		return
// 	}

// 	// 9. Detailed country statistics (if country selected)
// 	var countryDetails bson.M
// 	if country != "" {
// 		detailPipeline := mongo.Pipeline{
// 			{{Key: "$match", Value: bson.M{
// 				"$and": []bson.M{
// 					matchFilter,
// 					{"countryname": country},
// 				},
// 			}}},
// 			{{Key: "$group", Value: bson.M{
// 				"_id": bson.M{
// 					"airline": bson.M{"$ifNull": []interface{}{"$airlines", "Unknown"}},
// 					"channel": bson.M{"$ifNull": []interface{}{"$Channel", "Unknown"}},
// 					"route": bson.M{"$concat": []interface{}{
// 						bson.M{"$ifNull": []interface{}{"$routeawal", "Unknown"}},
// 						"-",
// 						bson.M{"$ifNull": []interface{}{"$routeakhir", "Unknown"}},
// 					}},
// 				},
// 				"totalFare": bson.M{
// 					"$sum": bson.M{
// 						"$convert": bson.M{
// 							"input":   "$fareupdate",
// 							"to":      "double",
// 							"onError": 0,
// 							"onNull":  0,
// 						},
// 					},
// 				},
// 				"ticketCount": bson.M{"$sum": 1},
// 			}}},
// 			{{Key: "$sort", Value: bson.M{"totalFare": -1}}},
// 		}
// 		detailCursor, err := collection.Aggregate(ctx, detailPipeline)
// 		if err != nil {
// 			log.Printf("Failed to fetch country details: %v", err)
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch country details"})
// 			return
// 		}
// 		var details []bson.M
// 		if err := detailCursor.All(ctx, &details); err != nil {
// 			log.Printf("Failed to decode country details: %v", err)
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode country details"})
// 			return
// 		}
// 		countryDetails = bson.M{
// 			"country": country,
// 			"details": details,
// 		}
// 	}

// 	// Return response
// 	c.JSON(http.StatusOK, gin.H{
// 		"years":                 years,
// 		"months":                months,
// 		"countries":             countries,
// 		"airlines":              airlines,
// 		"topCountries":          topCountries,
// 		"partitions":            partitions,
// 		"channels":              channels,
// 		"routePerformanceStats": routePerformanceStats,
// 		"countryDetails":        countryDetails,
// 	})
// }

// // getMonthName returns the month name for a given month number (1-12)
// func getMonthName(month int) string {
// 	monthNames := []string{
// 		"January", "February", "March", "April", "May", "June",
// 		"July", "August", "September", "October", "November", "December",
// 	}
// 	if month >= 1 && month <= 12 {
// 		return monthNames[month-1]
// 	}
// 	return ""
// }

// // getMonthAbbreviation returns the 3-letter month abbreviation (e.g., "Jan")
//
//	func getMonthAbbreviation(month int) string {
//		monthAbbrevs := []string{
//			"Jan", "Feb", "Mar", "Apr", "May", "Jun",
//			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//		}
//		if month >= 1 && month <= 12 {
//			return monthAbbrevs[month-1]
//		}
//		return ""
//	}
//
// iterasi (added route using two statement route awal dan akhir)
package handlers

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"strings"
	"sync"
	"time"

	"backend/db"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type CountryDetail struct {
	ID struct {
		Airline string `bson:"airline" json:"airline"`
		Channel string `bson:"channel" json:"channel"`
		Route   string `bson:"route" json:"route"`
	} `bson:"_id" json:"_id"`
	TotalFare   float64 `bson:"totalFare" json:"totalFare"`
	TicketCount int     `bson:"ticketCount" json:"ticketCount"`
}

type TopCountry struct {
	ID          string  `bson:"_id" json:"_id"`
	TotalFare   float64 `bson:"totalFare" json:"totalFare"`
	TicketCount int     `bson:"ticketCount" json:"ticketCount"`
}

type Partition struct {
	ID          string `bson:"_id" json:"_id"`
	TicketCount int    `bson:"ticketCount" json:"ticketCount"`
}

type Channel struct {
	ID          string `bson:"_id" json:"_id"`
	TicketCount int    `bson:"ticketCount" json:"ticketCount"`
}

type RoutePerformance struct {
	ID struct {
		Route string `bson:"route" json:"route"`
	} `bson:"_id" json:"_id"`
	TotalFare   float64 `bson:"totalFare" json:"totalFare"`
	TicketCount int     `bson:"ticketCount" json:"ticketCount"`
}

type DashboardResponse struct {
	Years                 []int              `json:"years"`
	Months                []int              `json:"months"`
	Airlines              []string           `json:"airlines"`
	TopCountries          []TopCountry       `json:"topCountries"`
	Partitions            []Partition        `json:"partitions"`
	Channels              []Channel          `json:"channels"`
	RoutePerformanceStats []RoutePerformance `json:"routePerformanceStats"`
	TotalCountryCount     int                `json:"totalCountryCount"`
	TotalPaxCount         int                `json:"totalPaxCount"`
	TotalAgentCount       int                `json:"totalAgentCount"`
}

var cache = make(map[string]DashboardResponse)
var cacheMutex sync.RWMutex

const cacheTTL = 5 * time.Minute

func DashboardManagement(c *gin.Context) {
	collection := db.GetCollection("dashboard_orc")
	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	year := c.Query("year")
	month := c.Query("month")
	airlines := c.Query("AirlinesTKT")
	channel := c.Query("Channel")
	route := c.Query("route")
	transcode := c.Query("transcode")

	cacheKey := fmt.Sprintf("%s:%s:%s:%s:%s", year, month, airlines, channel, transcode)
	cacheMutex.RLock()
	if cached, exists := cache[cacheKey]; exists {
		cacheMutex.RUnlock()
		c.JSON(200, cached)
		return
	}
	cacheMutex.RUnlock()

	matchFilter := bson.M{}
	if year != "" {
		matchFilter["YearFlown"] = year
	}
	if month != "" {
		if year == "" {
			c.JSON(400, gin.H{"error": "Year must be specified when filtering by month"})
			return
		}
		monthNum, err := strconv.Atoi(month)
		if err != nil || monthNum < 1 || monthNum > 12 {
			c.JSON(400, gin.H{"error": "Invalid month value; must be 1-12"})
			return
		}
		monthNames := []string{}
		for name, num := range monthNameToNumber {
			if num == monthNum {
				monthNames = append(monthNames, name, strings.Title(name), strings.ToUpper(name), strings.ToLower(name))
			}
		}
		monthValues := []interface{}{strconv.Itoa(monthNum), fmt.Sprintf("%02d", monthNum)}
		for _, name := range monthNames {
			monthValues = append(monthValues, name)
		}
		matchFilter["$and"] = []bson.M{
			{"YearFlown": year},
			{"MonthFlown": bson.M{"$in": monthValues}},
		}
	}
	if transcode != "" {
		matchFilter["transcode"] = strings.ToUpper(transcode)
	}
	if airlines != "" {
		matchFilter["AirlinesTKT"] = bson.M{"$in": strings.Split(airlines, ",")}
	}
	if channel != "" {
		matchFilter["Channel"] = bson.M{"$in": strings.Split(channel, ",")}
	}
	if route != "" {
		matchFilter["routeawal"] = route
	}

	var wg sync.WaitGroup
	var mu sync.Mutex
	response := DashboardResponse{}

	// Fetch years
	wg.Add(1)
	go func() {
		defer wg.Done()
		years, err := collection.Distinct(ctx, "YearFlown", bson.M{})
		if err != nil {
			log.Printf("Failed to get years: %v", err)
			return
		}
		yearInts := make([]int, 0, len(years))
		for _, y := range years {
			if yStr, ok := y.(string); ok {
				if yInt, err := strconv.Atoi(yStr); err == nil {
					yearInts = append(yearInts, yInt)
				}
			}
		}
		mu.Lock()
		response.Years = yearInts
		mu.Unlock()
	}()

	// Fetch months for selected year
	wg.Add(1)
	go func() {
		defer wg.Done()
		monthFilter := bson.M{}
		if year != "" {
			monthFilter["YearFlown"] = year
		}
		months, err := collection.Aggregate(ctx, mongo.Pipeline{
			bson.D{{Key: "$match", Value: monthFilter}},
			bson.D{{Key: "$group", Value: bson.D{
				bson.E{Key: "_id", Value: "$MonthFlown"},
			}}},
			bson.D{{Key: "$sort", Value: bson.D{{Key: "_id", Value: 1}}}},
		})
		if err != nil {
			log.Printf("Failed to get months: %v", err)
			return
		}
		var monthDocs []struct {
			ID interface{} `bson:"_id"`
		}
		if err := months.All(ctx, &monthDocs); err != nil {
			log.Printf("Failed to decode months: %v", err)
			return
		}
		monthInts := make([]int, 0, len(monthDocs))
		for _, m := range monthDocs {
			var mInt int
			switch v := m.ID.(type) {
			case string:
				if n, err := strconv.Atoi(v); err == nil && n >= 1 && n <= 12 {
					mInt = n
				} else {
					for name, num := range monthNameToNumber {
						if strings.EqualFold(v, name) || strings.EqualFold(v, strings.Title(name)) {
							mInt = num
							break
						}
					}
				}
			case int32:
				if n := int(v); n >= 1 && n <= 12 {
					mInt = n
				}
			case int64:
				if n := int(v); n >= 1 && n <= 12 {
					mInt = n
				}
			}
			if mInt > 0 && !containsInt(monthInts, mInt) {
				monthInts = append(monthInts, mInt)
			}
		}
		mu.Lock()
		response.Months = monthInts
		mu.Unlock()
	}()

	// Fetch airlines
	wg.Add(1)
	go func() {
		defer wg.Done()
		airlines, err := collection.Distinct(ctx, "AirlinesTKT", matchFilter)
		if err != nil {
			log.Printf("Failed to get airlines: %v", err)
			return
		}
		airlineStrs := make([]string, 0, len(airlines))
		for _, a := range airlines {
			if aStr, ok := a.(string); ok {
				airlineStrs = append(airlineStrs, aStr)
			}
		}
		mu.Lock()
		response.Airlines = airlineStrs
		mu.Unlock()
	}()

	// Fetch top countries
	wg.Add(1)
	go func() {
		defer wg.Done()
		pipeline := mongo.Pipeline{
			bson.D{{Key: "$match", Value: matchFilter}},
			bson.D{{Key: "$group", Value: bson.D{
				bson.E{Key: "_id", Value: "$countryname"},
				bson.E{Key: "totalFare", Value: bson.D{{Key: "$sum", Value: "$fareupdate"}}},
				bson.E{Key: "ticketCount", Value: bson.D{{Key: "$sum", Value: 1}}},
			}}},
			bson.D{{Key: "$sort", Value: bson.D{{Key: "ticketCount", Value: -1}}}},
			bson.D{{Key: "$limit", Value: 10}},
		}
		cursor, err := collection.Aggregate(ctx, pipeline)
		if err != nil {
			log.Printf("Failed to get top countries: %v", err)
			return
		}
		var topCountries []TopCountry
		if err := cursor.All(ctx, &topCountries); err != nil {
			log.Printf("Failed to decode top countries: %v", err)
			return
		}
		mu.Lock()
		response.TopCountries = topCountries
		mu.Unlock()
	}()

	// Fetch total country count
	wg.Add(1)
	go func() {
		defer wg.Done()
		pipeline := mongo.Pipeline{
			bson.D{{Key: "$match", Value: matchFilter}},
			bson.D{{Key: "$group", Value: bson.D{
				bson.E{Key: "_id", Value: "$countryname"},
			}}},
			bson.D{{Key: "$count", Value: "totalCountryCount"}},
		}
		cursor, err := collection.Aggregate(ctx, pipeline)
		if err != nil {
			log.Printf("Failed to get total country count: %v", err)
			return
		}
		var result []struct {
			TotalCountryCount int `bson:"totalCountryCount"`
		}
		if err := cursor.All(ctx, &result); err != nil {
			log.Printf("Failed to decode total country count: %v", err)
			return
		}
		count := 0
		if len(result) > 0 {
			count = result[0].TotalCountryCount
		}
		mu.Lock()
		response.TotalCountryCount = count
		mu.Unlock()
	}()

	// Fetch total pax count
	wg.Add(1)
	go func() {
		defer wg.Done()
		pipeline := mongo.Pipeline{
			bson.D{{Key: "$match", Value: matchFilter}},
			bson.D{{Key: "$group", Value: bson.D{
				bson.E{Key: "_id", Value: "$Paxname"},
			}}},
			bson.D{{Key: "$count", Value: "totalPaxCount"}},
		}
		cursor, err := collection.Aggregate(ctx, pipeline)
		if err != nil {
			log.Printf("Failed to get total pax count: %v", err)
			return
		}
		var result []struct {
			TotalPaxCount int `bson:"totalPaxCount"`
		}
		if err := cursor.All(ctx, &result); err != nil {
			log.Printf("Failed to decode total pax count: %v", err)
			return
		}
		count := 0
		if len(result) > 0 {
			count = result[0].TotalPaxCount
		}
		mu.Lock()
		response.TotalPaxCount = count
		mu.Unlock()
	}()

	// Fetch total agent count
	wg.Add(1)
	go func() {
		defer wg.Done()
		pipeline := mongo.Pipeline{
			bson.D{{Key: "$match", Value: matchFilter}},
			bson.D{{Key: "$group", Value: bson.D{
				bson.E{Key: "_id", Value: "$AgencyName"},
			}}},
			bson.D{{Key: "$count", Value: "totalAgentCount"}},
		}
		cursor, err := collection.Aggregate(ctx, pipeline)
		if err != nil {
			log.Printf("Failed to get total agent count: %v", err)
			return
		}
		var result []struct {
			TotalAgentCount int `bson:"totalAgentCount"`
		}
		if err := cursor.All(ctx, &result); err != nil {
			log.Printf("Failed to decode total agent count: %v", err)
			return
		}
		count := 0
		if len(result) > 0 {
			count = result[0].TotalAgentCount
		}
		mu.Lock()
		response.TotalAgentCount = count
		mu.Unlock()
	}()

	// Fetch partitions
	wg.Add(1)
	go func() {
		defer wg.Done()
		pipeline := mongo.Pipeline{
			bson.D{{Key: "$match", Value: matchFilter}},
			bson.D{{Key: "$group", Value: bson.D{
				bson.E{Key: "_id", Value: "$PartitionCode"},
				bson.E{Key: "ticketCount", Value: bson.D{{Key: "$sum", Value: 1}}},
			}}},
			bson.D{{Key: "$sort", Value: bson.D{{Key: "ticketCount", Value: -1}}}},
		}
		cursor, err := collection.Aggregate(ctx, pipeline)
		if err != nil {
			log.Printf("Failed to get partitions: %v", err)
			return
		}
		var partitions []Partition
		if err := cursor.All(ctx, &partitions); err != nil {
			log.Printf("Failed to decode partitions: %v", err)
			return
		}
		mu.Lock()
		response.Partitions = partitions
		mu.Unlock()
	}()

	// Fetch channels
	wg.Add(1)
	go func() {
		defer wg.Done()
		pipeline := mongo.Pipeline{
			bson.D{{Key: "$match", Value: matchFilter}},
			bson.D{{Key: "$group", Value: bson.D{
				bson.E{Key: "_id", Value: "$Channel"},
				bson.E{Key: "ticketCount", Value: bson.D{{Key: "$sum", Value: 1}}},
			}}},
			bson.D{{Key: "$sort", Value: bson.D{{Key: "ticketCount", Value: -1}}}},
		}
		cursor, err := collection.Aggregate(ctx, pipeline)
		if err != nil {
			log.Printf("Failed to get channels: %v", err)
			return
		}
		var channels []Channel
		if err := cursor.All(ctx, &channels); err != nil {
			log.Printf("Failed to decode channels: %v", err)
			return
		}
		mu.Lock()
		response.Channels = channels
		mu.Unlock()
	}()

	// Fetch route performance
	wg.Add(1)
	go func() {
		defer wg.Done()
		pipeline := mongo.Pipeline{
			bson.D{{Key: "$match", Value: matchFilter}},
			bson.D{{Key: "$group", Value: bson.D{
				bson.E{Key: "_id", Value: bson.D{
					bson.E{Key: "route", Value: bson.M{
						"$concat": []string{"$routeawal", "-", "$routeakhir"},
					}},
				}},
				bson.E{Key: "totalFare", Value: bson.D{{Key: "$sum", Value: "$fareupdate"}}},
				bson.E{Key: "ticketCount", Value: bson.D{{Key: "$sum", Value: 1}}},
			}}},
			bson.D{{Key: "$sort", Value: bson.D{{Key: "ticketCount", Value: -1}}}},
			bson.D{{Key: "$limit", Value: 10}},
		}
		cursor, err := collection.Aggregate(ctx, pipeline)
		if err != nil {
			log.Printf("Failed to get route performance: %v", err)
			return
		}
		var routes []RoutePerformance
		if err := cursor.All(ctx, &routes); err != nil {
			log.Printf("Failed to decode route performance: %v", err)
			return
		}
		mu.Lock()
		response.RoutePerformanceStats = routes
		mu.Unlock()
	}()

	wg.Wait()

	cacheMutex.Lock()
	cache[cacheKey] = response
	cacheMutex.Unlock()

	go func() {
		time.Sleep(cacheTTL)
		cacheMutex.Lock()
		delete(cache, cacheKey)
		cacheMutex.Unlock()
	}()

	c.JSON(200, response)
}

func containsInt(slice []int, val int) bool {
	for _, item := range slice {
		if item == val {
			return true
		}
	}
	return false
}

var monthNameToNumber = map[string]int{
	"january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
	"july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
	"jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6, "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}
