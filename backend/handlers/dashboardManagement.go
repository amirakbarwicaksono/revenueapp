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
