// addedd new function for handling web to b2b so team gsa didnt need to treatment the data anymore
package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"backend/db"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// LookupAndSave handles the SSE-based lookup and save process for dataFpr
func LookupAndSave(c *gin.Context) {
	// Check if the writer supports flushing for SSE
	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Streaming unsupported",
		})
		return
	}

	// Set SSE headers
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")

	// Notify client about clearing the lookup_process collection
	fmt.Fprintf(c.Writer, "data: {\"message\": \"Clearing data in lookup_process collection...\"}\n\n")
	flusher.Flush()
	log.Println("Clearing data in lookup_process collection.")

	lookupProcessCollection := db.GetCollection("lookup_process")
	ctx, cancel := context.WithTimeout(context.Background(), 600*time.Second)
	defer cancel()
	if _, err := lookupProcessCollection.DeleteMany(ctx, bson.D{}); err != nil {
		log.Printf("Failed to clear data in lookup_process: %v", err)
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"message\": \"Failed to clear data in lookup_process\"}\n\n")
		flusher.Flush()
		return
	}

	log.Println("Cleared data in lookup_process collection successfully.")
	fmt.Fprintf(c.Writer, "data: {\"message\": \"Data cleared in lookup_process collection successfully.\"}\n\n")
	flusher.Flush()

	// Check total documents in dataFpr
	collection := db.GetCollection("dataFpr")
	countCtx, countCancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer countCancel()
	totalDocs, err := collection.CountDocuments(countCtx, bson.D{})
	if err != nil {
		log.Printf("Failed to count documents in dataFpr: %v", err)
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"message\": \"Failed to count documents in dataFpr\"}\n\n")
		flusher.Flush()
		return
	}
	log.Printf("Total documents in dataFpr: %d", totalDocs)
	fmt.Fprintf(c.Writer, "data: {\"message\": \"Total documents in dataFpr: %d\"}\n\n", totalDocs)
	flusher.Flush()

	// Notify about pipeline execution
	fmt.Fprintf(c.Writer, "data: {\"message\": \"Executing aggregation pipeline with PartitionCode/airlines/AirlinesTKT filtering...\"}\n\n")
	flusher.Flush()
	log.Println("Executing Aggregation Pipeline with PartitionCode/airlines/AirlinesTKT filtering.")

	// Define the initial match pipeline for Step 0
	step0Pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"$or": []bson.M{
				{
					"PartitionCode": "OD",
					"airlines":      "OD",
					"AirlinesTKT":   "OD",
				},
				{
					"PartitionCode": "ID",
					"airlines":      "ID",
					"AirlinesTKT":   "ID",
				},
				{
					"PartitionCode": "SL",
					"airlines":      "SL",
					"AirlinesTKT":   "SL",
				},
			},
		}}},
	}

	// Count documents after Step 0
	countCtx, countCancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer countCancel()
	step0Cursor, err := collection.Aggregate(countCtx, mongo.Pipeline{
		step0Pipeline[0],
		{{Key: "$count", Value: "count"}},
	})
	if err != nil {
		log.Printf("Failed to count documents after Step 0: %v", err)
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"message\": \"Failed to count documents after Step 0\"}\n\n")
		flusher.Flush()
		return
	}
	var step0Result struct{ Count int }
	if step0Cursor.Next(countCtx) {
		step0Cursor.Decode(&step0Result)
	}
	step0Cursor.Close(countCtx)
	log.Printf("Documents after Step 0 (PartitionCode/airlines/AirlinesTKT): %d", step0Result.Count)
	fmt.Fprintf(c.Writer, "data: {\"message\": \"Documents after Step 0 (PartitionCode/airlines/AirlinesTKT): %d\"}\n\n", step0Result.Count)
	flusher.Flush()

	// If no documents pass Step 0, try a relaxed filter
	matchCondition := step0Pipeline[0]
	if step0Result.Count == 0 {
		log.Println("No documents matched strict PartitionCode/airlines/AirlinesTKT filter. Applying relaxed filter.")
		fmt.Fprintf(c.Writer, "data: {\"message\": \"No documents matched strict PartitionCode/airlines/AirlinesTKT filter. Applying relaxed filter.\"}\n\n")
		flusher.Flush()
		matchCondition = bson.D{{Key: "$match", Value: bson.M{
			"PartitionCode": bson.M{"$exists": true},
			"airlines":      bson.M{"$exists": true},
			"AirlinesTKT":   bson.M{"$exists": true},
		}}}
	}

	// Count documents after Step 1 (transcode exists)
	countCtx, countCancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer countCancel()
	step1Cursor, err := collection.Aggregate(countCtx, mongo.Pipeline{
		matchCondition,
		{{Key: "$match", Value: bson.M{
			"transcode": bson.M{"$exists": true},
		}}},
		{{Key: "$count", Value: "count"}},
	})
	if err != nil {
		log.Printf("Failed to count documents after Step 1: %v", err)
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"message\": \"Failed to count documents after Step 1\"}\n\n")
		flusher.Flush()
		return
	}
	var step1Result struct{ Count int }
	if step1Cursor.Next(countCtx) {
		step1Cursor.Decode(&step1Result)
	}
	step1Cursor.Close(countCtx)
	log.Printf("Documents after Step 1 (transcode exists): %d", step1Result.Count)
	fmt.Fprintf(c.Writer, "data: {\"message\": \"Documents after Step 1 (transcode exists): %d\"}\n\n", step1Result.Count)
	flusher.Flush()

	// Count documents with Channel: WEB for logging
	countCtx, countCancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer countCancel()
	webChannelCursor, err := collection.Aggregate(countCtx, mongo.Pipeline{
		matchCondition,
		{{Key: "$match", Value: bson.M{
			"transcode": bson.M{"$exists": true},
			"Channel":   "WEB",
		}}},
		{{Key: "$count", Value: "count"}},
	})
	if err != nil {
		log.Printf("Failed to count documents with Channel: WEB: %v", err)
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"message\": \"Failed to count documents with Channel: WEB\"}\n\n")
		flusher.Flush()
		return
	}
	var webChannelResult struct{ Count int }
	if webChannelCursor.Next(countCtx) {
		webChannelCursor.Decode(&webChannelResult)
	}
	webChannelCursor.Close(countCtx)
	log.Printf("Documents with Channel: WEB in dataFpr: %d", webChannelResult.Count)
	fmt.Fprintf(c.Writer, "data: {\"message\": \"Documents with Channel: WEB in dataFpr: %d\"}\n\n", webChannelResult.Count)
	flusher.Flush()

	// Define the full aggregation pipeline
	pipeline := mongo.Pipeline{
		// Step 0: Apply the match condition (strict or relaxed)
		matchCondition,

		// Step 1: Filter and transform data in dataFpr
		{{Key: "$match", Value: bson.M{
			"transcode": bson.M{"$exists": true},
		}}},
		{{Key: "$set", Value: bson.M{
			"fareupdate": bson.M{
				"$cond": bson.M{
					"if": bson.M{
						"$and": []interface{}{
							bson.M{"$eq": []interface{}{"$transcode", "EXCH"}},
							bson.M{"$ne": []interface{}{"$OriginalFareUpdate", nil}},
							bson.M{"$ne": []interface{}{"$OriginalFareUpdate", ""}}, //added check for empty string (req 13/06/2025)
							bson.M{"$ne": []interface{}{"$OriginalFareUpdate", 0}},  //blank or 0.
						},
					},
					"then": "$OriginalFareUpdate",
					"else": "$fareupdate",
				},
			},
			"SalesCurrency": bson.M{
				"$cond": bson.M{
					"if":   bson.M{"$eq": []interface{}{"$transcode", "EXCH"}},
					"then": "$OriginalCurr",
					"else": "$SalesCurrency",
				},
			},
		}}},

		// Step 2: Add concatenated StationCode and AgentDie
		{{Key: "$set", Value: bson.M{
			"concatStationAgent": bson.M{
				"$concat": []interface{}{"$Stationcode", "$Agentdie"},
			},
		}}},

		// Step 3: Lookup from masterTP_1 with concatenated StationCode and AgentDie
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "masterTP_1"},
			{Key: "let", Value: bson.M{"concatStationAgent": "$concatStationAgent"}},
			{Key: "pipeline", Value: mongo.Pipeline{
				{{Key: "$set", Value: bson.M{
					"concatStationAgent": bson.M{
						"$concat": []interface{}{"$StationCode", "$AgentDie"},
					},
				}}},
				{{Key: "$match", Value: bson.D{
					{Key: "$expr", Value: bson.D{
						{Key: "$eq", Value: bson.A{"$concatStationAgent", "$$concatStationAgent"}},
					}},
				}}},
				{{Key: "$project", Value: bson.D{
					{Key: "StationCode", Value: 1},
					{Key: "AgentDie", Value: 1},
				}}},
			}},
			{Key: "as", Value: "masterTP"},
		}}},

		// Step 4: Unwind masterTP, preserving unmatched documents
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$masterTP"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},

		// Step 5: Filter based on Channel
		{{Key: "$match", Value: bson.M{
			"$or": []bson.M{
				{"Channel": bson.M{"$in": []string{"TO", "GDS"}}},
				{"masterTP": bson.M{"$ne": nil}},
			},
		}}},

		// Step 6: Project the final structure matching DataFpr
		{{Key: "$project", Value: bson.D{
			{Key: "YearFlown", Value: 1},
			{Key: "MonthFlown", Value: 1},
			{Key: "PartitionCode", Value: 1},
			{Key: "stationopendate", Value: 1},
			{Key: "stationno", Value: 1},
			{Key: "countryname", Value: 1},
			{Key: "city_code", Value: 1},
			{Key: "SalesCurrency", Value: 1},
			{Key: "ticketnumber", Value: 1},
			{Key: "PNRR", Value: 1},
			{Key: "Paxname", Value: 1},
			{Key: "Issueddate", Value: 1},
			{Key: "RefundTicket", Value: 1},
			{Key: "Exchticket", Value: 1},
			{Key: "PreconjTicket", Value: 1},
			{Key: "transcode", Value: 1},
			{Key: "doctype", Value: 1},
			{Key: "Agentdie", Value: 1},
			{Key: "Stationcode", Value: 1},
			{Key: "Channel", Value: 1},
			{Key: "AgencyName", Value: 1},
			{Key: "tourcode", Value: 1},
			{Key: "Flightnumber", Value: 1},
			{Key: "fc", Value: 1},
			{Key: "routeawal", Value: 1},
			{Key: "routeakhir", Value: 1},
			{Key: "dateofflight", Value: 1},
			{Key: "fareupdate", Value: 1},
			{Key: "QSfare", Value: 1},
			{Key: "descr", Value: 1},
			{Key: "StatusTicket", Value: 1},
			{Key: "StatusFlight", Value: 1},
			{Key: "airlines", Value: 1},
			{Key: "flowndate", Value: 1},
			{Key: "AirlinesTKT", Value: 1},
			{Key: "OriginalTranscode", Value: 1},
			{Key: "OriginalTicketnumber", Value: 1},
			{Key: "OriginalCurr", Value: 1},
			{Key: "OriginalFareUpdate", Value: 1},
			{Key: "OriginalIssueddate", Value: 1},
			{Key: "AgentDieOrigin", Value: 1},
			{Key: "StationnoOrigin", Value: 1},
			{Key: "Tourcodeorigin", Value: 1},
		}}},

		// Step 6.5: Change Channel from WEB to B2B
		{{Key: "$set", Value: bson.M{
			"Channel": bson.M{
				"$cond": bson.M{
					"if":   bson.M{"$eq": []interface{}{"$Channel", "WEB"}},
					"then": "B2B",
					"else": "$Channel",
				},
			},
		}}},

		// Step 7: Merge the results into lookup_process
		{{Key: "$merge", Value: bson.D{
			{Key: "into", Value: "lookup_process"},
			{Key: "whenMatched", Value: "merge"},
			{Key: "whenNotMatched", Value: "insert"},
		}}},
	}

	// Count documents with Channel: WEB after Step 5 for logging
	countCtx, countCancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer countCancel()
	webFinalCursor, err := collection.Aggregate(countCtx, mongo.Pipeline{
		matchCondition,
		{{Key: "$match", Value: bson.M{
			"transcode": bson.M{"$exists": true},
			"Channel":   "WEB", // Only count documents with Channel: WEB
		}}},
		{{Key: "$set", Value: bson.M{
			"fareupdate": bson.M{
				"$cond": bson.M{
					"if":   bson.M{"$eq": []interface{}{"$transcode", "EXCH"}},
					"then": "$OriginalFareUpdate",
					"else": "$fareupdate",
				},
			},
			"SalesCurrency": bson.M{
				"$cond": bson.M{
					"if":   bson.M{"$eq": []interface{}{"$transcode", "EXCH"}},
					"then": "$OriginalCurr",
					"else": "$SalesCurrency",
				},
			},
		}}},
		{{Key: "$set", Value: bson.M{
			"concatStationAgent": bson.M{
				"$concat": []interface{}{"$Stationcode", "$Agentdie"},
			},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "masterTP_1"},
			{Key: "let", Value: bson.M{"concatStationAgent": "$concatStationAgent"}},
			{Key: "pipeline", Value: mongo.Pipeline{
				{{Key: "$set", Value: bson.M{
					"concatStationAgent": bson.M{
						"$concat": []interface{}{"$StationCode", "$AgentDie"},
					},
				}}},
				{{Key: "$match", Value: bson.D{
					{Key: "$expr", Value: bson.D{
						{Key: "$eq", Value: bson.A{"$concatStationAgent", "$$concatStationAgent"}},
					}},
				}}},
				{{Key: "$project", Value: bson.D{
					{Key: "StationCode", Value: 1},
					{Key: "AgentDie", Value: 1},
				}}},
			}},
			{Key: "as", Value: "masterTP"},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$masterTP"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},
		{{Key: "$match", Value: bson.M{
			"$or": []bson.M{
				{"Channel": bson.M{"$in": []string{"TO", "GDS"}}},
				{"masterTP": bson.M{"$ne": nil}},
			},
		}}},
		{{Key: "$match", Value: bson.M{
			"Channel": "WEB",
		}}},
		{{Key: "$count", Value: "count"}},
	})
	if err != nil {
		log.Printf("Failed to count documents with Channel: WEB after Step 5: %v", err)
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"message\": \"Failed to count documents with Channel: WEB after Step 5\"}\n\n")
		flusher.Flush()
		return
	}
	var webFinalResult struct{ Count int }
	if webFinalCursor.Next(countCtx) {
		webFinalCursor.Decode(&webFinalResult)
	}
	webFinalCursor.Close(countCtx)
	log.Printf("Documents with Channel: WEB to be changed to B2B in lookup_process: %d", webFinalResult.Count)
	fmt.Fprintf(c.Writer, "data: {\"message\": \"Documents with Channel: WEB to be changed to B2B in lookup_process: %d\"}\n\n", webFinalResult.Count)
	flusher.Flush()

	// Execute the pipeline
	ctx, cancel = context.WithTimeout(context.Background(), 600*time.Second)
	defer cancel()
	_, err = collection.Aggregate(ctx, pipeline)
	if err != nil {
		log.Printf("Aggregation pipeline failed: %v", err)
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"message\": \"Aggregation failed: %v\"}\n\n", err)
		flusher.Flush()
		return
	}

	log.Println("Aggregation pipeline completed successfully.")
	fmt.Fprintf(c.Writer, "data: {\"message\": \"Aggregation pipeline completed successfully.\"}\n\n")
	flusher.Flush()

	// Notify client about merging data to dashboard_orc
	fmt.Fprintf(c.Writer, "data: {\"message\": \"Checking for duplicates and merging data to dashboard_orc collection...\"}\n\n")
	flusher.Flush()
	log.Println("Checking for duplicates and merging data to dashboard_orc collection.")

	// Merge data from lookup_process to dashboard_orc, excluding duplicates
	copyPipeline := mongo.Pipeline{
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "dashboard_orc"},
			{Key: "let", Value: bson.M{
				"ticketnumber":  "$ticketnumber",
				"partitionCode": "$PartitionCode",
				"city_code":     "$city_code",
				"paxname":       "$Paxname",
				"routeawal":     "$routeawal",
				"routeakhir":    "$routeakhir",
				"dateofflight":  "$dateofflight",
				"airlines":      "$airlines",
				"flightnumber":  "$Flightnumber",
				"airlinesTkt":   "$AirlinesTKT",
				"flownDate":     "$flowndate",
			}},
			{Key: "pipeline", Value: mongo.Pipeline{
				{{Key: "$match", Value: bson.M{
					"$expr": bson.M{
						"$and": bson.A{
							bson.D{{Key: "$eq", Value: bson.A{"$ticketnumber", "$$ticketnumber"}}},
							bson.D{{Key: "$eq", Value: bson.A{"$PartitionCode", "$$partitionCode"}}},
							bson.D{{Key: "$eq", Value: bson.A{"$city_code", "$$city_code"}}},
							bson.D{{Key: "$eq", Value: bson.A{"$Paxname", "$$paxname"}}},
							bson.D{{Key: "$eq", Value: bson.A{"$routeawal", "$$routeawal"}}},
							bson.D{{Key: "$eq", Value: bson.A{"$routeakhir", "$$routeakhir"}}},
							bson.D{{Key: "$eq", Value: bson.A{"$dateofflight", "$$dateofflight"}}},
							bson.D{{Key: "$eq", Value: bson.A{"$airlines", "$$airlines"}}},
							bson.D{{Key: "$eq", Value: bson.A{"$Flightnumber", "$$flightnumber"}}},
							bson.D{{Key: "$eq", Value: bson.A{"$AirlinesTKT", "$$airlinesTkt"}}},
							bson.D{{Key: "$eq", Value: bson.A{"$flowndate", "$$flownDate"}}},
						},
					},
				}}},
			}},
			{Key: "as", Value: "existing"},
		}}},

		{{Key: "$match", Value: bson.M{
			"existing": bson.M{"$eq": []interface{}{}},
		}}},

		{{Key: "$merge", Value: bson.D{
			{Key: "into", Value: "dashboard_orc"},
			{Key: "whenNotMatched", Value: "insert"},
			{Key: "whenMatched", Value: "fail"},
		}}},
	}

	// Count documents in lookup_process before merging
	countCtx, countCancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer countCancel()
	totalDocs, err = lookupProcessCollection.CountDocuments(countCtx, bson.D{})
	if err != nil {
		log.Printf("Failed to count documents in lookup_process: %v", err)
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"message\": \"Failed to count documents in lookup_process\"}\n\n")
		flusher.Flush()
		return
	}

	// Execute the copy pipeline
	ctx, cancel = context.WithTimeout(context.Background(), 300*time.Second)
	defer cancel()
	_, err = lookupProcessCollection.Aggregate(ctx, copyPipeline)
	if err != nil {
		log.Printf("Failed to merge data to dashboard_orc: %v", err)
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"message\": \"Failed to merge data to dashboard_orc: %v\"}\n\n", err)
		flusher.Flush()
		return
	}

	// Count documents merged into dashboard_orc
	countCtx, countCancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer countCancel()
	mergedDocs, err := db.GetCollection("dashboard_orc").CountDocuments(countCtx, bson.D{})
	if err != nil {
		log.Printf("Failed to count documents in dashboard_orc: %v", err)
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"message\": \"Failed to count documents in dashboard_orc\"}\n\n")
		flusher.Flush()
		return
	}

	// Estimate duplicates skipped
	log.Printf("Data merged to dashboard_orc collection successfully. Total processed: %d, Duplicates skipped (approx): %d", totalDocs, totalDocs-mergedDocs)
	fmt.Fprintf(c.Writer, "data: {\"message\": \"Data merged to dashboard_orc collection successfully. Total processed: %d, Duplicates skipped (approx): %d\"}\n\n", totalDocs, totalDocs-mergedDocs)
	flusher.Flush()

	// Send completion event
	fmt.Fprintf(c.Writer, "event: complete\ndata: {\"message\": \"Lookup and Save process completed successfully!\"}\n\n")
	flusher.Flush()
	log.Println("LookupAndSave process completed successfully.")
}
