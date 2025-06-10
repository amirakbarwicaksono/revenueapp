package handlers

import (
	"context"
	"fmt"
	"log"
	"time"

	"backend/db"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func LookupAndSave1(c *gin.Context) {
	requestID := uuid.New().String()
	log.Printf("[%s] Starting LookupAndSave1 process", requestID)

	// Set SSE headers
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // Adjust to your frontend origin
	c.Writer.Header().Set("X-Accel-Buffering", "no")
	c.Writer.Flush()

	ctx, cancel := context.WithTimeout(context.Background(), 2000*time.Second)
	defer cancel()

	// Initialize collections
	dataFmrCollection := db.GetCollection("dataFmr")
	lookupProcessCollection := db.GetCollection("lookup_process1")
	dashboardSsrCollection := db.GetCollection("dashboard_ssr")
	processesCollection := db.GetCollection("processes")

	// Check for concurrent process
	var existingProcess bson.M
	err := processesCollection.FindOne(ctx, bson.M{"status": "running", "type": "lookup"}).Decode(&existingProcess)
	if err == nil {
		log.Printf("[%s] Another process is already running", requestID)
		sendSSE(c, requestID, `{"message": "Another process is already running. Please wait."}`)
		// Keep connection open briefly to ensure message is received
		time.Sleep(1 * time.Second)
		sendSSE(c, requestID, `{"message": "Process aborted due to existing running process."}`)
		return
	} else if err != mongo.ErrNoDocuments {
		log.Printf("[%s] Error checking process status: %v", requestID, err)
		sendSSE(c, requestID, `{"message": "Error checking process status"}`)
		return
	}

	// Lock the process
	_, err = processesCollection.InsertOne(ctx, bson.M{
		"requestID":   requestID,
		"status":      "running",
		"type":        "lookup",
		"startTime":   time.Now(),
		"lastUpdated": time.Now(),
	})
	if err != nil {
		log.Printf("[%s] Failed to lock process: %v", requestID, err)
		sendSSE(c, requestID, `{"message": "Failed to start process"}`)
		return
	}
	defer func() {
		if _, err := processesCollection.DeleteOne(ctx, bson.M{"requestID": requestID}); err != nil {
			log.Printf("[%s] Failed to unlock process: %v", requestID, err)
		}
	}()

	// Heartbeat to prevent stuck locks
	go func() {
		ticker := time.NewTicker(60 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				_, err := processesCollection.UpdateOne(ctx, bson.M{"requestID": requestID}, bson.M{
					"$set": bson.M{"lastUpdated": time.Now()},
				})
				if err != nil {
					log.Printf("[%s] Failed to update heartbeat: %v", requestID, err)
				}
			}
		}
	}()

	// Step 1: Clear lookup_process1 collection
	log.Printf("[%s] Clearing data in lookup_process1 collection.", requestID)
	sendSSE(c, requestID, `{"message": "Clearing lookup_process1 collection"}`)
	if ctx.Err() != nil {
		log.Printf("[%s] Process canceled or timed out: %v", requestID, ctx.Err())
		sendSSE(c, requestID, `{"message": "Process canceled or timed out"}`)
		return
	}
	if _, err := lookupProcessCollection.DeleteMany(ctx, bson.D{}); err != nil {
		log.Printf("[%s] Failed to clear lookup_process1: %v", requestID, err)
		sendSSE(c, requestID, `{"message": "Failed to clear lookup_process1 collection"}`)
		return
	}
	log.Printf("[%s] Cleared lookup_process1 collection successfully.", requestID)
	sendSSE(c, requestID, `{"message": "Cleared lookup_process1 collection successfully"}`)

	// Step 2: Count total documents in dataFmr
	totalDocs, err := dataFmrCollection.CountDocuments(ctx, bson.D{})
	if err != nil {
		log.Printf("[%s] Failed to count documents in dataFmr: %v", requestID, err)
		sendSSE(c, requestID, `{"message": "Failed to count documents in dataFmr"}`)
		return
	}
	log.Printf("[%s] Total documents in dataFmr: %d", requestID, totalDocs)
	sendSSE(c, requestID, fmt.Sprintf(`{"message": "Total documents in dataFmr: %d"}`, totalDocs))

	// Step 3: Aggregate dataFmr in batches
	batchSize := int64(1000)
	skip := int64(0)
	for skip < totalDocs {
		if ctx.Err() != nil {
			log.Printf("[%s] Process canceled or timed out: %v", requestID, ctx.Err())
			sendSSE(c, requestID, `{"message": "Process canceled or timed out"}`)
			return
		}
		pipeline := mongo.Pipeline{
			{{Key: "$match", Value: bson.M{"TicketNumber": bson.M{"$exists": true}}}},
			{{Key: "$skip", Value: skip}},
			{{Key: "$limit", Value: batchSize}},
			{{Key: "$project", Value: bson.D{
				{Key: "TicketNumber", Value: "$TicketNumber"},
				{Key: "PaxName", Value: "$PaxName"},
				{Key: "TransCode", Value: "$TransCode"},
				{Key: "DocType", Value: "$DocType"},
				{Key: "StationCode", Value: "$StationCode"},
				{Key: "StationNo", Value: "$StationNo"},
				{Key: "StationOpenDate", Value: "$StationOpenDate"},
				{Key: "StationCloseDate", Value: "$StationCloseDate"},
				{Key: "StationCurr", Value: "$StationCurr"},
				{Key: "StationCurrDec", Value: "$StationCurrDec"},
				{Key: "CloseEmpNumber", Value: "$CloseEmpNumber"},
				{Key: "PNRR", Value: "$PNRR"},
				{Key: "AgentDie", Value: "$AgentDie"},
				{Key: "TourCode", Value: "$TourCode"},
				{Key: "FOP", Value: "$FOP"},
				{Key: "intlcode", Value: "$intlcode"},
				{Key: "Route1", Value: "$Route1"},
				{Key: "Route2", Value: "$Route2"},
				{Key: "Route3", Value: "$Route3"},
				{Key: "Route4", Value: "$Route4"},
				{Key: "Route5", Value: "$Route5"},
				{Key: "dateofFlight1", Value: "$dateofFlight1"},
				{Key: "dateofFlight2", Value: "$dateofFlight2"},
				{Key: "dateofFlight3", Value: "$dateofFlight3"},
				{Key: "dateofFlight4", Value: "$dateofFlight4"},
				{Key: "code1", Value: "$code1"},
				{Key: "code2", Value: "$code2"},
				{Key: "code3", Value: "$code3"},
				{Key: "code4", Value: "$code4"},
				{Key: "EMDRemark1", Value: "$EMDRemark1"},
				{Key: "EMDRemark2", Value: "$EMDRemark2"},
				{Key: "EMDRemark3", Value: "$EMDRemark3"},
				{Key: "EMDRemark4", Value: "$EMDRemark4"},
				{Key: "TktBaseFare", Value: "$TktBaseFare"},
				{Key: "TktPPN", Value: "$TktPPN"},
				{Key: "D8", Value: "$D8"},
				{Key: "T6", Value: "$T6"},
				{Key: "TktFSurcharge", Value: "$TktFSurcharge"},
				{Key: "YR", Value: "$YR"},
				{Key: "tktadm", Value: "$tktadm"},
				{Key: "TktApoTax", Value: "$TktApoTax"},
				{Key: "CalcTotal", Value: "$CalcTotal"},
				{Key: "exbprasdesc", Value: "$exbprasdesc"},
				{Key: "country", Value: "$country"},
				{Key: "Airlines", Value: "$Airlines"},
				// Additional fields for lookup_process1
				{Key: "IssuedDate", Value: "$IssuedDate"},
				{Key: "RefundTicket", Value: "$RefundTicket"},
				{Key: "exchTicket", Value: "$exchTicket"},
				{Key: "PreConjTicket", Value: "$PreConjTicket"},
				{Key: "TktInd", Value: "$TktInd"},
				{Key: "CCNo", Value: "$CCNo"},
				{Key: "ApprovalCode", Value: "$ApprovalCode"},
			}}},
			{{Key: "$merge", Value: bson.D{
				{Key: "into", Value: "lookup_process1"},
				{Key: "whenMatched", Value: "merge"},
				{Key: "whenNotMatched", Value: "insert"},
			}}},
		}

		log.Printf("[%s] Processing batch of %d documents (skip: %d)", requestID, batchSize, skip)
		sendSSE(c, requestID, fmt.Sprintf(`{"message": "Processing batch of %d documents (skip: %d)"}`, batchSize, skip))
		_, err := dataFmrCollection.Aggregate(ctx, pipeline)
		if err != nil {
			log.Printf("[%s] Aggregation pipeline failed: %v", requestID, err)
			sendSSE(c, requestID, `{"message": "Aggregation pipeline failed"}`)
			return
		}
		log.Printf("[%s] Processed batch (skip: %d)", requestID, skip)
		sendSSE(c, requestID, fmt.Sprintf(`{"message": "Processed batch of %d documents (skip: %d)"}`, batchSize, skip))
		skip += batchSize
	}
	log.Printf("[%s] Aggregation pipeline to lookup_process1 completed successfully", requestID)
	sendSSE(c, requestID, `{"message": "Aggregation pipeline completed successfully"}`)

	// Step 4: Count documents in lookup_process1
	processedDocs, err := lookupProcessCollection.CountDocuments(ctx, bson.D{})
	if err != nil {
		log.Printf("[%s] Failed to count documents in lookup_process1: %v", requestID, err)
		sendSSE(c, requestID, `{"message": "Failed to count documents in lookup_process1"}`)
		return
	}
	log.Printf("[%s] Documents processed in lookup_process1: %d", requestID, processedDocs)
	sendSSE(c, requestID, fmt.Sprintf(`{"message": "Documents processed in lookup_process1: %d"}`, processedDocs))

	// Step 5: Merge into dashboard_ssr in batches
	skip = 0
	for skip < processedDocs {
		if ctx.Err() != nil {
			log.Printf("[%s] Process canceled or timed out: %v", requestID, ctx.Err())
			sendSSE(c, requestID, `{"message": "Process canceled or timed out"}`)
			return
		}

		copyPipeline := mongo.Pipeline{
			{{Key: "$skip", Value: skip}},
			{{Key: "$limit", Value: batchSize}},
			{{Key: "$merge", Value: bson.D{
				{Key: "into", Value: "dashboard_ssr"},
				{Key: "whenMatched", Value: mongo.Pipeline{
					{{Key: "$set", Value: bson.M{
						"TicketNumber":     "$$ROOT.TicketNumber",
						"PaxName":          "$$ROOT.PaxName",
						"TransCode":        "$$ROOT.TransCode",
						"DocType":          "$$ROOT.DocType",
						"StationCode":      "$$ROOT.StationCode",
						"StationNo":        "$$ROOT.StationNo",
						"StationOpenDate":  "$$ROOT.StationOpenDate",
						"StationCloseDate": "$$ROOT.StationCloseDate",
						"StationCurr":      "$$ROOT.StationCurr",
						"StationCurrDec":   "$$ROOT.StationCurrDec",
						"CloseEmpNumber":   "$$ROOT.CloseEmpNumber",
						"PNRR":             "$$ROOT.PNRR",
						"AgentDie":         "$$ROOT.AgentDie",
						"TourCode":         "$$ROOT.TourCode",
						"FOP":              "$$ROOT.FOP",
						"intlcode":         "$$ROOT.intlcode",
						"Route1":           "$$ROOT.Route1",
						"Route2":           "$$ROOT.Route2",
						"Route3":           "$$ROOT.Route3",
						"Route4":           "$$ROOT.Route4",
						"Route5":           "$$ROOT.Route5",
						"dateofFlight1":    "$$ROOT.dateofFlight1",
						"dateofFlight2":    "$$ROOT.dateofFlight2",
						"dateofFlight3":    "$$ROOT.dateofFlight3",
						"dateofFlight4":    "$$ROOT.dateofFlight4",
						"code1":            "$$ROOT.code1",
						"code2":            "$$ROOT.code2",
						"code3":            "$$ROOT.code3",
						"code4":            "$$ROOT.code4",
						"EMDRemark1":       "$$ROOT.EMDRemark1",
						"EMDRemark2":       "$$ROOT.EMDRemark2",
						"EMDRemark3":       "$$ROOT.EMDRemark3",
						"EMDRemark4":       "$$ROOT.EMDRemark4",
						"TktBaseFare":      "$$ROOT.TktBaseFare",
						"TktPPN":           "$$ROOT.TktPPN",
						"D8":               "$$ROOT.D8",
						"T6":               "$$ROOT.T6",
						"TktFSurcharge":    "$$ROOT.TktFSurcharge",
						"YR":               "$$ROOT.YR",
						"tktadm":           "$$ROOT.tktadm",
						"TktApoTax":        "$$ROOT.TktApoTax",
						"CalcTotal":        "$$ROOT.CalcTotal",
						"RefundTicket":     "$$ROOT.RefundTicket",
						"exchTicket":       "$$ROOT.exchTicket",
						"PreConjTicket":    "$$ROOT.PreConjTicket",
						"IssuedDate":       "$$ROOT.IssuedDate",
						"exbprasdesc":      "$$ROOT.exbprasdesc",
						"country":          "$$ROOT.country",
						"Airlines":         "$$ROOT.Airlines",
						// Additional fields for dashboard_ssr
						"TktInd":       "$$ROOT.TktInd",
						"CCNo":         "$$ROOT.CCNo",
						"ApprovalCode": "$$ROOT.ApprovalCode",
					}}},
				}},
				{Key: "whenNotMatched", Value: "insert"},
			}}},
		}

		log.Printf("[%s] Merging data from lookup_process1 to dashboard_ssr (skip: %d)", requestID, skip)
		sendSSE(c, requestID, fmt.Sprintf(`{"message": "Merging batch of %d documents to dashboard_ssr (skip: %d)"}`, batchSize, skip))

		_, err := lookupProcessCollection.Aggregate(ctx, copyPipeline)
		if err != nil {
			log.Printf("[%s] Failed to merge data to dashboard_ssr: %v", requestID, err)
			sendSSE(c, requestID, `{"message": "Failed to merge data to dashboard_ssr"}`)
			return
		}

		log.Printf("[%s] Merged batch (skip: %d)", requestID, skip)
		sendSSE(c, requestID, fmt.Sprintf(`{"message": "Merged batch of %d documents (skip: %d)"}`, batchSize, skip))

		skip += batchSize
	}

	log.Printf("[%s] Merge to dashboard_ssr completed successfully", requestID)
	sendSSE(c, requestID, `{"message": "Merge to dashboard_ssr completed successfully"}`)

	// Step 6: Count documents in dashboard_ssr
	mergedDocs, err := dashboardSsrCollection.CountDocuments(ctx, bson.D{})
	if err != nil {
		log.Printf("[%s] Failed to count documents in dashboard_ssr: %v", requestID, err)
		sendSSE(c, requestID, `{"message": "Failed to count documents in dashboard_ssr"}`)
		return
	}
	log.Printf("[%s] Documents in dashboard_ssr: %d", requestID, mergedDocs)
	sendSSE(c, requestID, fmt.Sprintf(`{"message": "Documents in dashboard_ssr: %d"}`, mergedDocs))

	// Step 7: Send completion event
	log.Printf("[%s] LookupAndSave1 process completed successfully", requestID)
	fmt.Fprintf(c.Writer, "event: complete\ndata: %s\n\n", `{"message": "Lookup and Save process completed successfully"}`)
	c.Writer.Flush()
}

func sendSSE(c *gin.Context, requestID string, message string) {
	_, err := fmt.Fprintf(c.Writer, "data: %s\n\n", message)
	if err != nil {
		log.Printf("[%s] Failed to send SSE message: %v", requestID, err)
	}
	c.Writer.Flush()
}

//1:1
