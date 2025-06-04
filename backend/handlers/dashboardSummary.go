// package handlers

// import (
// 	"context"
// 	"log"
// 	"net/http"
// 	"time"

// 	"backend/db"

// 	"github.com/gin-gonic/gin"
// 	"go.mongodb.org/mongo-driver/bson"
// 	"go.mongodb.org/mongo-driver/mongo"
// )

// // DashboardSummary handles the dashboard data aggregation for dashboard_orc
// func DashboardSummary(c *gin.Context) {
// 	collection := db.GetCollection("dashboard_orc")
// 	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
// 	defer cancel()

// 	// Log total document count
// 	totalCount, err := collection.CountDocuments(ctx, bson.D{})
// 	if err != nil {
// 		log.Printf("Failed to count documents: %v", err)
// 	} else {
// 		log.Printf("Total documents in dashboard_orc: %d", totalCount)
// 	}

// 	// Check fareupdate type distribution
// 	typeCheckPipeline := mongo.Pipeline{
// 		{{Key: "$group", Value: bson.M{
// 			"_id":   bson.M{"$type": "$fareupdate"},
// 			"count": bson.M{"$sum": 1},
// 		}}},
// 	}
// 	typeCursor, err := collection.Aggregate(ctx, typeCheckPipeline)
// 	if err != nil {
// 		log.Printf("Failed to check fareupdate types: %v", err)
// 	} else {
// 		var typeResults []bson.M
// 		if err := typeCursor.All(ctx, &typeResults); err == nil {
// 			log.Printf("fareupdate type distribution: %v", typeResults)
// 		}
// 		typeCursor.Close(ctx)
// 	}

// 	// Count documents with empty fareupdate
// 	emptyFareCount, err := collection.CountDocuments(ctx, bson.M{
// 		"fareupdate": "",
// 	})
// 	if err != nil {
// 		log.Printf("Failed to count empty fareupdate documents: %v", err)
// 	} else {
// 		log.Printf("Documents with empty fareupdate: %d", emptyFareCount)
// 	}

// 	// Aggregation pipeline for summary data
// 	summaryPipeline := mongo.Pipeline{
// 		// Clean and convert fareupdate
// 		{{Key: "$set", Value: bson.M{
// 			"fareupdate": bson.M{
// 				"$cond": bson.M{
// 					"if": bson.M{"$eq": []interface{}{bson.M{"$type": "$fareupdate"}, "string"}},
// 					"then": bson.M{
// 						"$cond": bson.M{
// 							"if":   bson.M{"$eq": []interface{}{"$fareupdate", ""}},
// 							"then": 0,
// 							"else": bson.M{
// 								"$toDouble": bson.M{
// 									"$ifNull": []interface{}{
// 										bson.M{
// 											"$replaceAll": bson.M{
// 												"input":       "$fareupdate",
// 												"find":        ",",
// 												"replacement": "",
// 											},
// 										},
// 										"0",
// 									},
// 								},
// 							},
// 						},
// 					},
// 					"else": bson.M{
// 						"$ifNull": []interface{}{"$fareupdate", 0},
// 					},
// 				},
// 			},
// 			// Combine MonthFlown and YearFlown
// 			"monthYear": bson.M{
// 				"$concat": []interface{}{"$MonthFlown", " ", "$YearFlown"},
// 			},
// 			// Map MonthFlown to numeric for sorting
// 			"monthNumber": bson.M{
// 				"$switch": bson.M{
// 					"branches": []bson.M{
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "January"}}, "then": 1},
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "February"}}, "then": 2},
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "March"}}, "then": 3},
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "April"}}, "then": 4},
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "May"}}, "then": 5},
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "June"}}, "then": 6},
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "July"}}, "then": 7},
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "August"}}, "then": 8},
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "September"}}, "then": 9},
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "October"}}, "then": 10},
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "November"}}, "then": 11},
// 						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "December"}}, "then": 12},
// 					},
// 					"default": 0,
// 				},
// 			},
// 		}}},
// 		// Match documents with valid fareupdate
// 		{{Key: "$match", Value: bson.M{
// 			"fareupdate": bson.M{"$exists": true, "$type": []string{"double", "decimal", "int", "long"}},
// 		}}},
// 		{{Key: "$group", Value: bson.M{
// 			"_id": bson.M{
// 				"month":    "$monthYear",
// 				"country":  "$countryname",
// 				"airlines": "$AirlinesTKT",
// 				"district": "$city_code",
// 				"channel":  "$Channel",
// 				"currency": "$SalesCurrency",
// 				"year":     "$YearFlown",
// 				"monthNum": "$monthNumber",
// 			},
// 			"totalFare": bson.M{"$sum": "$fareupdate"},
// 			"count":     bson.M{"$sum": 1},
// 		}}},
// 		{{Key: "$project", Value: bson.M{
// 			"_id":       0,
// 			"month":     "$_id.month",
// 			"country":   "$_id.country",
// 			"airlines":  "$_id.airlines",
// 			"district":  "$_id.district",
// 			"channel":   "$_id.channel",
// 			"currency":  "$_id.currency",
// 			"totalFare": 1,
// 			"count":     1,
// 			"year":      "$_id.year",
// 			"monthNum":  "$_id.monthNum",
// 		}}},
// 		{{Key: "$sort", Value: bson.M{
// 			"year":     1,
// 			"monthNum": 1,
// 			"country":  1,
// 			"airlines": 1,
// 		}}},
// 	}

// 	// Fetch summary data
// 	cursor, err := collection.Aggregate(ctx, summaryPipeline)
// 	if err != nil {
// 		log.Printf("Failed to aggregate dashboard summary: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"success": false,
// 			"message": "Failed to fetch dashboard summary",
// 		})
// 		return
// 	}
// 	defer cursor.Close(ctx)

// 	var summaryData []bson.M
// 	if err := cursor.All(ctx, &summaryData); err != nil {
// 		log.Printf("Failed to decode summary data: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"success": false,
// 			"message": "Failed to process dashboard summary",
// 		})
// 		return
// 	}
// 	log.Printf("Aggregated Summary Data: %v", summaryData)

// 	// Ensure data is always an array
// 	if summaryData == nil {
// 		summaryData = []bson.M{}
// 	}

// 	// Fetch distinct filter values
// 	filterFields := []string{"countryname", "AirlinesTKT", "Channel", "SalesCurrency"}
// 	filters := make(map[string]interface{})
// 	for _, field := range filterFields {
// 		values, err := collection.Distinct(ctx, field, bson.D{})
// 		if err != nil {
// 			log.Printf("Failed to fetch distinct %s: %v", field, err)
// 			c.JSON(http.StatusInternalServerError, gin.H{
// 				"success": false,
// 				"message": "Failed to fetch filter options",
// 			})
// 			return
// 		}
// 		strValues := make([]string, len(values))
// 		for i, v := range values {
// 			if v != nil {
// 				strValues[i] = v.(string)
// 			} else {
// 				strValues[i] = "UNKNOWN"
// 			}
// 		}
// 		filters[field] = strValues
// 	}

// 	// Fetch country to district mapping
// 	countryDistrictPipeline := mongo.Pipeline{
// 		{{Key: "$match", Value: bson.M{
// 			"countryname": bson.M{"$ne": "", "$exists": true},
// 			"city_code":   bson.M{"$ne": "", "$exists": true},
// 		}}},
// 		{{Key: "$group", Value: bson.M{
// 			"_id":       "$countryname",
// 			"districts": bson.M{"$addToSet": "$city_code"},
// 		}}},
// 		{{Key: "$project", Value: bson.M{
// 			"_id":       0,
// 			"country":   "$_id",
// 			"districts": 1,
// 		}}},
// 		{{Key: "$sort", Value: bson.M{
// 			"country": 1,
// 		}}},
// 	}
// 	countryDistrictCursor, err := collection.Aggregate(ctx, countryDistrictPipeline)
// 	if err != nil {
// 		log.Printf("Failed to fetch country-district mapping: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"success": false,
// 			"message": "Failed to fetch filter options",
// 		})
// 		return
// 	}
// 	var countryDistrictResults []bson.M
// 	if err := countryDistrictCursor.All(ctx, &countryDistrictResults); err != nil {
// 		log.Printf("Failed to decode country-district data: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"success": false,
// 			"message": "Failed to process filter options",
// 		})
// 		return
// 	}
// 	countryDistrictCursor.Close(ctx)

// 	// Build countryDistrictMap
// 	countryDistrictMap := make(map[string][]string)
// 	for _, result := range countryDistrictResults {
// 		country := result["country"].(string)
// 		districts := make([]string, len(result["districts"].(bson.A)))
// 		for i, d := range result["districts"].(bson.A) {
// 			districts[i] = d.(string)
// 		}
// 		countryDistrictMap[country] = districts
// 	}
// 	filters["countryDistrictMap"] = countryDistrictMap
// 	log.Printf("Country-District Mapping: %v", countryDistrictMap)

// 	// Fetch country to currency mapping
// 	countryCurrencyPipeline := mongo.Pipeline{
// 		{{Key: "$match", Value: bson.M{
// 			"countryname": bson.M{"$ne": "", "$exists": true},
// 		}}},
// 		{{Key: "$group", Value: bson.M{
// 			"_id":        "$countryname",
// 			"currencies": bson.M{
// 				"$addToSet": bson.M{
// 					"$ifNull": []interface{}{"$SalesCurrency", "UNKNOWN"},
// 				},
// 			},
// 		}}},
// 		{{Key: "$project", Value: bson.M{
// 			"_id":        0,
// 			"country":    "$_id",
// 			"currencies": 1,
// 		}}},
// 		{{Key: "$sort", Value: bson.M{
// 			"country": 1,
// 		}}},
// 	}
// 	countryCurrencyCursor, err := collection.Aggregate(ctx, countryCurrencyPipeline)
// 	if err != nil {
// 		log.Printf("Failed to fetch country-currency mapping: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"success": false,
// 			"message": "Failed to fetch filter options",
// 		})
// 		return
// 	}
// 	var countryCurrencyResults []bson.M
// 	if err := countryCurrencyCursor.All(ctx, &countryCurrencyResults); err != nil {
// 		log.Printf("Failed to decode country-currency data: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"success": false,
// 			"message": "Failed to process filter options",
// 		})
// 		return
// 	}
// 	countryCurrencyCursor.Close(ctx)

// 	// Build countryCurrencyMap
// 	countryCurrencyMap := make(map[string][]string)
// 	for _, result := range countryCurrencyResults {
// 		country := result["country"].(string)
// 		currencies := make([]string, len(result["currencies"].(bson.A)))
// 		for i, c := range result["currencies"].(bson.A) {
// 			currencies[i] = c.(string)
// 		}
// 		// Filter out "UNKNOWN" if not needed
// 		filteredCurrencies := []string{}
// 		for _, currency := range currencies {
// 			if currency != "UNKNOWN" {
// 				filteredCurrencies = append(filteredCurrencies, currency)
// 			}
// 		}
// 		if len(filteredCurrencies) > 0 {
// 			countryCurrencyMap[country] = filteredCurrencies
// 		}
// 	}
// 	filters["countryCurrencyMap"] = countryCurrencyMap
// 	log.Printf("Country-Currency Mapping: %v", countryCurrencyMap)

// 	// Fetch distinct MonthFlown and YearFlown combinations
// 	monthYearPipeline := mongo.Pipeline{
// 		{{Key: "$group", Value: bson.M{
// 			"_id": bson.M{
// 				"month": "$MonthFlown",
// 				"year":  "$YearFlown",
// 			},
// 			"monthYear": bson.M{
// 				"$first": bson.M{
// 					"$concat": []interface{}{"$MonthFlown", " ", "$YearFlown"},
// 				},
// 			},
// 		}}},
// 		{{Key: "$project", Value: bson.M{
// 			"_id":       0,
// 			"monthYear": 1,
// 		}}},
// 		{{Key: "$sort", Value: bson.M{
// 			"monthYear": 1,
// 		}}},
// 	}
// 	monthYearCursor, err := collection.Aggregate(ctx, monthYearPipeline)
// 	if err != nil {
// 		log.Printf("Failed to fetch distinct MonthFlown-YearFlown: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"success": false,
// 			"message": "Failed to fetch filter options",
// 		})
// 		return
// 	}
// 	var monthYearResults []bson.M
// 	if err := monthYearCursor.All(ctx, &monthYearResults); err != nil {
// 		log.Printf("Failed to decode monthYear data: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"success": false,
// 			"message": "Failed to process filter options",
// 		})
// 		return
// 	}
// 	monthYearCursor.Close(ctx)
// 	monthYearValues := make([]string, len(monthYearResults))
// 	for i, result := range monthYearResults {
// 		monthYearValues[i] = result["monthYear"].(string)
// 	}
// 	filters["MonthFlown"] = monthYearValues
// 	log.Printf("Distinct MonthFlown-YearFlown: %v", monthYearValues)

// 	// Return response
// 	c.JSON(http.StatusOK, gin.H{
// 		"success": true,
// 		"data":    summaryData,
// 		"filters": filters,
// 	})
// }

package handlers

import (
	"context"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"backend/db"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// DashboardSummary handles the dashboard data aggregation for dashboard_orc
func DashboardSummary(c *gin.Context) {
	collection := db.GetCollection("dashboard_orc")
	ctx, cancel := context.WithTimeout(context.Background(), 1200*time.Second)
	defer cancel()

	// Log total document count
	totalCount, err := collection.CountDocuments(ctx, bson.D{})
	if err != nil {
		log.Printf("Failed to count documents: %v", err)
	} else {
		log.Printf("Total documents in dashboard_orc: %d", totalCount)
	}

	// Check fareupdate type distribution
	typeCheckPipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.M{
			"_id":   bson.M{"$type": "$fareupdate"},
			"count": bson.M{"$sum": 1},
		}}},
	}
	typeCursor, err := collection.Aggregate(ctx, typeCheckPipeline)
	if err != nil {
		log.Printf("Failed to check fareupdate types: %v", err)
	} else {
		var typeResults []bson.M
		if err := typeCursor.All(ctx, &typeResults); err == nil {
			log.Printf("fareupdate type distribution: %v", typeResults)
		}
		typeCursor.Close(ctx)
	}

	// Count documents with empty fareupdate
	emptyFareCount, err := collection.CountDocuments(ctx, bson.M{
		"fareupdate": "",
	})
	if err != nil {
		log.Printf("Failed to count empty fareupdate documents: %v", err)
	} else {
		log.Printf("Documents with empty fareupdate: %d", emptyFareCount)
	}

	// Aggregation pipeline for summary data
	summaryPipeline := mongo.Pipeline{
		// Clean and convert fareupdate
		{{Key: "$set", Value: bson.M{
			"fareupdate": bson.M{
				"$cond": bson.M{
					"if": bson.M{"$eq": []interface{}{bson.M{"$type": "$fareupdate"}, "string"}},
					"then": bson.M{
						"$cond": bson.M{
							"if":   bson.M{"$eq": []interface{}{"$fareupdate", ""}},
							"then": 0,
							"else": bson.M{
								"$toDouble": bson.M{
									"$ifNull": []interface{}{
										bson.M{
											"$replaceAll": bson.M{
												"input":       "$fareupdate",
												"find":        ",",
												"replacement": "",
											},
										},
										"0",
									},
								},
							},
						},
					},
					"else": bson.M{
						"$ifNull": []interface{}{"$fareupdate", 0},
					},
				},
			},
			// Combine MonthFlown and YearFlown
			"monthYear": bson.M{
				"$concat": []interface{}{"$MonthFlown", " ", "$YearFlown"},
			},
			// Map MonthFlown to numeric for sorting
			"monthNumber": bson.M{
				"$switch": bson.M{
					"branches": []bson.M{
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "January"}}, "then": 1},
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "February"}}, "then": 2},
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "March"}}, "then": 3},
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "April"}}, "then": 4},
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "May"}}, "then": 5},
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "June"}}, "then": 6},
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "July"}}, "then": 7},
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "August"}}, "then": 8},
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "September"}}, "then": 9},
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "October"}}, "then": 10},
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "November"}}, "then": 11},
						{"case": bson.M{"$eq": []interface{}{"$MonthFlown", "December"}}, "then": 12},
					},
					"default": 0,
				},
			},
		}}},
		// Match documents with valid fareupdate
		{{Key: "$match", Value: bson.M{
			"fareupdate": bson.M{"$exists": true, "$type": []string{"double", "decimal", "int", "long"}},
		}}},
		{{Key: "$group", Value: bson.M{
			"_id": bson.M{
				"month":    "$monthYear",
				"country":  "$countryname",
				"airlines": "$AirlinesTKT",
				"district": "$city_code",
				"channel":  "$Channel",
				"currency": "$SalesCurrency",
				"year":     "$YearFlown",
				"monthNum": "$monthNumber",
			},
			"totalFare": bson.M{"$sum": "$fareupdate"},
			"count":     bson.M{"$sum": 1},
		}}},
		{{Key: "$project", Value: bson.M{
			"_id":       0,
			"month":     "$_id.month",
			"country":   "$_id.country",
			"airlines":  "$_id.airlines",
			"district":  "$_id.district",
			"channel":   "$_id.channel",
			"currency":  "$_id.currency",
			"totalFare": 1,
			"count":     1,
			"year":      "$_id.year",
			"monthNum":  "$_id.monthNum",
		}}},
		{{Key: "$sort", Value: bson.M{
			"year":     1,
			"monthNum": 1,
			"country":  1,
			"airlines": 1,
		}}},
	}

	// Fetch summary data
	cursor, err := collection.Aggregate(ctx, summaryPipeline)
	if err != nil {
		log.Printf("Failed to aggregate dashboard summary: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch dashboard summary",
		})
		return
	}
	defer cursor.Close(ctx)

	var summaryData []bson.M
	if err := cursor.All(ctx, &summaryData); err != nil {
		log.Printf("Failed to decode summary data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to process dashboard summary",
		})
		return
	}
	log.Printf("Aggregated Summary Data: %v", summaryData)

	// Ensure data is always an array
	if summaryData == nil {
		summaryData = []bson.M{}
	}

	// Fetch distinct filter values
	filterFields := []string{"countryname", "AirlinesTKT", "Channel", "SalesCurrency"}
	filters := make(map[string]interface{})
	for _, field := range filterFields {
		values, err := collection.Distinct(ctx, field, bson.D{})
		if err != nil {
			log.Printf("Failed to fetch distinct %s: %v", field, err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to fetch filter options",
			})
			return
		}
		strValues := make([]string, len(values))
		for i, v := range values {
			if v != nil {
				strValues[i] = v.(string)
			} else {
				strValues[i] = "UNKNOWN"
			}
		}
		filters[field] = strValues
	}

	// Fetch country to district mapping
	countryDistrictPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"countryname": bson.M{"$ne": "", "$exists": true},
			"city_code":   bson.M{"$ne": "", "$exists": true},
		}}},
		{{Key: "$group", Value: bson.M{
			"_id":       "$countryname",
			"districts": bson.M{"$addToSet": "$city_code"},
		}}},
		{{Key: "$project", Value: bson.M{
			"_id":       0,
			"country":   "$_id",
			"districts": 1,
		}}},
		{{Key: "$sort", Value: bson.M{
			"country": 1,
		}}},
	}
	countryDistrictCursor, err := collection.Aggregate(ctx, countryDistrictPipeline)
	if err != nil {
		log.Printf("Failed to fetch country-district mapping: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch filter options",
		})
		return
	}
	var countryDistrictResults []bson.M
	if err := countryDistrictCursor.All(ctx, &countryDistrictResults); err != nil {
		log.Printf("Failed to decode country-district data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to process filter options",
		})
		return
	}
	countryDistrictCursor.Close(ctx)

	// Build countryDistrictMap
	countryDistrictMap := make(map[string][]string)
	for _, result := range countryDistrictResults {
		country := result["country"].(string)
		districts := make([]string, len(result["districts"].(bson.A)))
		for i, d := range result["districts"].(bson.A) {
			districts[i] = d.(string)
		}
		countryDistrictMap[country] = districts
	}
	filters["countryDistrictMap"] = countryDistrictMap
	log.Printf("Country-District Mapping: %v", countryDistrictMap)

	// Fetch country to currency mapping
	countryCurrencyPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"countryname": bson.M{"$ne": "", "$exists": true},
		}}},
		{{Key: "$group", Value: bson.M{
			"_id": "$countryname",
			"currencies": bson.M{
				"$addToSet": bson.M{
					"$ifNull": []interface{}{"$SalesCurrency", "UNKNOWN"},
				},
			},
		}}},
		{{Key: "$project", Value: bson.M{
			"_id":        0,
			"country":    "$_id",
			"currencies": 1,
		}}},
		{{Key: "$sort", Value: bson.M{
			"country": 1,
		}}},
	}
	countryCurrencyCursor, err := collection.Aggregate(ctx, countryCurrencyPipeline)
	if err != nil {
		log.Printf("Failed to fetch country-currency mapping: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch filter options",
		})
		return
	}
	var countryCurrencyResults []bson.M
	if err := countryCurrencyCursor.All(ctx, &countryCurrencyResults); err != nil {
		log.Printf("Failed to decode country-currency data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to process filter options",
		})
		return
	}
	countryCurrencyCursor.Close(ctx)

	// Build countryCurrencyMap
	countryCurrencyMap := make(map[string][]string)
	for _, result := range countryCurrencyResults {
		country := result["country"].(string)
		currencies := make([]string, len(result["currencies"].(bson.A)))
		for i, c := range result["currencies"].(bson.A) {
			currencies[i] = c.(string)
		}
		// Filter out "UNKNOWN" if not needed
		filteredCurrencies := []string{}
		for _, currency := range currencies {
			if currency != "UNKNOWN" {
				filteredCurrencies = append(filteredCurrencies, currency)
			}
		}
		if len(filteredCurrencies) > 0 {
			countryCurrencyMap[country] = filteredCurrencies
		}
	}
	filters["countryCurrencyMap"] = countryCurrencyMap
	log.Printf("Country-Currency Mapping: %v", countryCurrencyMap)

	// Fetch distinct MonthFlown and YearFlown combinations
	monthYearPipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.M{
			"_id": bson.M{
				"month": "$MonthFlown",
				"year":  "$YearFlown",
			},
			"monthYear": bson.M{
				"$first": bson.M{
					"$concat": []interface{}{"$MonthFlown", " ", "$YearFlown"},
				},
			},
		}}},
		{{Key: "$project", Value: bson.M{
			"_id":       0,
			"monthYear": 1,
		}}},
		{{Key: "$sort", Value: bson.M{
			"monthYear": 1,
		}}},
	}
	monthYearCursor, err := collection.Aggregate(ctx, monthYearPipeline)
	if err != nil {
		log.Printf("Failed to fetch distinct MonthFlown-YearFlown: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch filter options",
		})
		return
	}
	var monthYearResults []bson.M
	if err := monthYearCursor.All(ctx, &monthYearResults); err != nil {
		log.Printf("Failed to decode monthYear data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to process filter options",
		})
		return
	}
	monthYearCursor.Close(ctx)
	monthYearValues := make([]string, len(monthYearResults))
	for i, result := range monthYearResults {
		monthYearValues[i] = result["monthYear"].(string)
	}
	filters["MonthFlown"] = monthYearValues
	log.Printf("Distinct MonthFlown-YearFlown: %v", monthYearValues)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    summaryData,
		"filters": filters,
	})
}

// // Replace only the DashboardDetailed function in handlers/DashboardSummary.go
// func DashboardDetailed(c *gin.Context) {
// 	collection := db.GetCollection("dashboard_orc")
// 	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
// 	defer cancel()

// 	// Log incoming query parameters
// 	queryParams := c.Request.URL.Query()
// 	log.Printf("DashboardDetailed query parameters: %v", queryParams)

// 	// Build filter query from query parameters
// 	filter := bson.M{}
// 	if month := c.Query("MonthFlown"); month != "" {
// 		if month != "January" && month != "February" && month != "March" && month != "April" &&
// 			month != "May" && month != "June" && month != "July" && month != "August" &&
// 			month != "September" && month != "October" && month != "November" && month != "December" {
// 			log.Printf("Invalid MonthFlown: %s", month)
// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"success": false,
// 				"message": "Invalid MonthFlown value",
// 			})
// 			return
// 		}
// 		filter["MonthFlown"] = month
// 	}
// 	if year := c.Query("YearFlown"); year != "" {
// 		if len(year) != 4 || !regexp.MustCompile(`^[0-9]+$`).MatchString(year) {
// 			log.Printf("Invalid YearFlown: %s", year)
// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"success": false,
// 				"message": "Invalid YearFlown value",
// 			})
// 			return
// 		}
// 		filter["YearFlown"] = year
// 	}
// 	if country := c.Query("countryname"); country != "" {
// 		filter["countryname"] = country
// 	}
// 	if airlines := c.Query("AirlinesTKT"); airlines != "" {
// 		airlineList := strings.Split(airlines, ",")
// 		if len(airlineList) == 0 {
// 			log.Printf("Empty AirlinesTKT list")
// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"success": false,
// 				"message": "Invalid AirlinesTKT value",
// 			})
// 			return
// 		}
// 		filter["AirlinesTKT"] = bson.M{"$in": airlineList}
// 	}
// 	if district := c.Query("city_code"); district != "" {
// 		filter["city_code"] = district
// 	}
// 	if channel := c.Query("Channel"); channel != "" {
// 		channelList := strings.Split(channel, ",")
// 		if len(channelList) == 0 {
// 			log.Printf("Empty Channel list")
// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"success": false,
// 				"message": "Invalid Channel value",
// 			})
// 			return
// 		}
// 		filter["Channel"] = bson.M{"$in": channelList}
// 	}
// 	if currency := c.Query("SalesCurrency"); currency != "" {
// 		filter["SalesCurrency"] = currency
// 	}

// 	// Require at least one filter to prevent fetching all documents
// 	if len(filter) == 0 {
// 		log.Printf("No filters provided for DashboardDetailed")
// 		c.JSON(http.StatusBadRequest, gin.H{
// 			"success": false,
// 			"message": "At least one filter parameter is required",
// 		})
// 		return
// 	}

// 	// Log constructed filter
// 	log.Printf("Constructed MongoDB filter: %v", filter)

// 	// Fetch detailed data with ordered sort using bson.D
// 	findOptions := options.Find().SetSort(bson.D{
// 		{Key: "YearFlown", Value: 1},
// 		{Key: "MonthFlown", Value: 1},
// 		{Key: "countryname", Value: 1},
// 	})
// 	cursor, err := collection.Find(ctx, filter, findOptions)
// 	if err != nil {
// 		log.Printf("Failed to execute Find query: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"success": false,
// 			"message": "Failed to fetch detailed data: " + err.Error(),
// 		})
// 		return
// 	}
// 	defer cursor.Close(ctx)

// 	var detailedData []bson.M
// 	if err := cursor.All(ctx, &detailedData); err != nil {
// 		log.Printf("Failed to decode detailed data: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"success": false,
// 			"message": "Failed to process detailed data: " + err.Error(),
// 		})
// 		return
// 	}

// 	// Log fetched data count and sample
// 	log.Printf("Fetched %d detailed records", len(detailedData))
// 	if len(detailedData) > 0 {
// 		log.Printf("Sample record: %v", detailedData[0])
// 	}

// 	// Ensure data is always an array
// 	if detailedData == nil {
// 		detailedData = []bson.M{}
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"success": true,
// 		"data":    detailedData,
// 	})
// }

func DashboardDetailed(c *gin.Context) {
	collection := db.GetCollection("dashboard_orc")
	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	// Log incoming query parameters
	queryParams := c.Request.URL.Query()
	log.Printf("DashboardDetailed query parameters: %v", queryParams)

	// Build filter query from query parameters
	filter := bson.M{}
	if month := c.Query("MonthFlown"); month != "" {
		if month != "January" && month != "February" && month != "March" && month != "April" &&
			month != "May" && month != "June" && month != "July" && month != "August" &&
			month != "September" && month != "October" && month != "November" && month != "December" {
			log.Printf("Invalid MonthFlown: %s", month)
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid MonthFlown value",
			})
			return
		}
		filter["MonthFlown"] = month
	}
	if year := c.Query("YearFlown"); year != "" {
		if len(year) != 4 || !regexp.MustCompile(`^[0-9]+$`).MatchString(year) {
			log.Printf("Invalid YearFlown: %s", year)
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid YearFlown value",
			})
			return
		}
		filter["YearFlown"] = year
	}
	if country := c.Query("countryname"); country != "" {
		filter["countryname"] = country
	}
	if airlines := c.Query("AirlinesTKT"); airlines != "" {
		airlineList := strings.Split(airlines, ",")
		if len(airlineList) == 0 {
			log.Printf("Empty AirlinesTKT list")
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid AirlinesTKT value",
			})
			return
		}
		filter["AirlinesTKT"] = bson.M{"$in": airlineList}
	}
	if district := c.Query("city_code"); district != "" {
		filter["city_code"] = district
	}
	if channel := c.Query("Channel"); channel != "" {
		channelList := strings.Split(channel, ",")
		if len(channelList) == 0 {
			log.Printf("Empty Channel list")
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid Channel value",
			})
			return
		}
		filter["Channel"] = bson.M{"$in": channelList}
	}
	if currency := c.Query("SalesCurrency"); currency != "" {
		filter["SalesCurrency"] = currency
	}

	// Require at least one filter to prevent fetching all documents
	if len(filter) == 0 {
		log.Printf("No filters provided for DashboardDetailed")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "At least one filter parameter is required",
		})
		return
	}

	// Log constructed filter
	log.Printf("Constructed MongoDB filter: %v", filter)

	// Fetch detailed data with ordered sort using bson.D
	findOptions := options.Find().SetSort(bson.D{
		{Key: "YearFlown", Value: 1},
		{Key: "MonthFlown", Value: 1},
		{Key: "countryname", Value: 1},
	})
	cursor, err := collection.Find(ctx, filter, findOptions)
	if err != nil {
		log.Printf("Failed to execute Find query: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch detailed data: " + err.Error(),
		})
		return
	}
	defer cursor.Close(ctx)

	var detailedData []bson.M
	if err := cursor.All(ctx, &detailedData); err != nil {
		log.Printf("Failed to decode detailed data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to process detailed data: " + err.Error(),
		})
		return
	}

	// Log fetched data count and field names
	log.Printf("Fetched %d detailed records", len(detailedData))
	if len(detailedData) > 0 {
		keys := make([]string, 0, len(detailedData[0]))
		for k := range detailedData[0] {
			keys = append(keys, k)
		}
		log.Printf("Fields in sample record: %v", keys)
	}

	// Ensure data is always an array
	if detailedData == nil {
		detailedData = []bson.M{}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    detailedData,
	})
}
