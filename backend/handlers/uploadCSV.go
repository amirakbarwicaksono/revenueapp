package handlers

import (
	"backend/db"
	"backend/models"
	"context"
	"encoding/csv"
	"fmt"
	"log"
	"net/http"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func UploadData(c *gin.Context) {
	// Log initial memory usage
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)
	log.Printf("Initial memory usage - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)

	// Set memory limit for multipart form parsing
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB
		respondWithJSONError(c, http.StatusBadRequest, "Failed to parse multipart form: "+err.Error())
		return
	}

	// Extract query parameters
	collectionName := c.Query("collection")
	username := c.Query("username")
	month := c.PostForm("month")

	if collectionName == "" || username == "" || month == "" {
		respondWithJSONError(c, http.StatusBadRequest, "Collection name, username, and month are required")
		return
	}

	// Validate collection name
	structType, exists := collectionStructs[collectionName]
	if !exists {
		respondWithJSONError(c, http.StatusBadRequest, fmt.Sprintf("Unknown collection: %s", collectionName))
		return
	}

	// Parse CSV file
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV file: "+err.Error())
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)

	// Read CSV headers
	csvHeaders, err := reader.Read()
	if err != nil {
		respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV headers: "+err.Error())
		return
	}

	// Get expected headers
	expectedHeaders := getStructHeaders(structType)

	// Log headers for debugging
	log.Printf("Collection: %s, CSV Headers: %v, Expected Headers: %v", collectionName, csvHeaders, expectedHeaders)

	if err := validateHeaders(csvHeaders, expectedHeaders); err != nil {
		respondWithJSONError(c, http.StatusBadRequest, "Header validation failed: "+err.Error())
		return
	}

	// Create context with timeout
	timeoutDuration := 30 * time.Minute
	if collectionName == "dataFmr" {
		timeoutDuration = 35 * time.Minute // Longer timeout for dataFmr
	}
	ctx, cancel := context.WithTimeout(context.Background(), timeoutDuration)
	defer cancel()

	// Get MongoDB collection
	collection := db.GetCollection(collectionName)

	// Fetch before count
	beforeCount, err := collection.EstimatedDocumentCount(ctx)
	if err != nil {
		log.Printf("Failed to get before count for collection %s: %v", collectionName, err)
		respondWithJSONError(c, http.StatusInternalServerError, "Failed to get collection count: "+err.Error())
		return
	}

	// Clear data if necessary
	if shouldClear, ok := collectionsToClear[collectionName]; ok && shouldClear {
		if _, err := collection.DeleteMany(ctx, bson.D{}); err != nil {
			log.Printf("Failed to clear data in collection %s: %v", collectionName, err)
			respondWithJSONError(c, http.StatusInternalServerError, "Failed to clear data in collection: "+err.Error())
			return
		}
		log.Printf("Data in collection %s cleared successfully", collectionName)
	}

	// Process CSV records in batches
	batchSize := 100
	if collectionName == "dataFmr" {
		batchSize = 50 // Smaller batch size for dataFmr
	}
	var batch []interface{}
	seenRecords := make(map[string]struct{})
	var totalInserted, csvTotalCount, duplicateCount int

	for {
		record, err := reader.Read()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV data: "+err.Error())
			return
		}

		csvTotalCount++

		// Process record
		row := make(map[string]interface{})
		for i, value := range record {
			row[csvHeaders[i]] = TrimSpacesAndRemoveChar160(value)
		}
		row["month"] = month
		uniqueKey := GenerateUniqueKey(row)
		if _, exists := seenRecords[uniqueKey]; exists {
			duplicateCount++
			continue
		}
		seenRecords[uniqueKey] = struct{}{}
		batch = append(batch, row)

		// Process batch
		if len(batch) >= batchSize {
			startTime := time.Now()
			if err := processBatch(ctx, collection, collectionName, batch, &totalInserted); err != nil {
				log.Printf("Batch processing failed for collection %s after %v: %v", collectionName, time.Since(startTime), err)
				insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, duplicateCount, username, month)
				respondWithJSONError(c, http.StatusInternalServerError, "Failed to process batch: "+err.Error())
				return
			}
			log.Printf("Processed batch of %d records for collection %s in %v", len(batch), collectionName, time.Since(startTime))
			batch = nil
			seenRecords = make(map[string]struct{})
			runtime.GC()
		}
	}

	// Process remaining records
	if len(batch) > 0 {
		startTime := time.Now()
		if err := processBatch(ctx, collection, collectionName, batch, &totalInserted); err != nil {
			log.Printf("Final batch processing failed for collection %s after %v: %v", collectionName, time.Since(startTime), err)
			insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, duplicateCount, username, month)
			respondWithJSONError(c, http.StatusInternalServerError, "Failed to process final batch: "+err.Error())
			return
		}
		log.Printf("Processed final batch of %d records in %v", len(batch), time.Since(startTime))
	}

	// Fetch after count
	afterCount, err := collection.EstimatedDocumentCount(ctx)
	if err != nil {
		log.Printf("Failed to get after count for collection %s: %v", collectionName, err)
		respondWithJSONError(c, http.StatusInternalServerError, "Failed to get collection count: "+err.Error())
		return
	}

	// Insert log
	insertUploadLog(collectionName, csvTotalCount, totalInserted, "Success", "", beforeCount, afterCount, duplicateCount, username, month)

	// Log final memory usage
	runtime.ReadMemStats(&memStats)
	log.Printf("Final memory usage - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)

	// Success response
	log.Printf("Successfully inserted %d records into collection %s", totalInserted, collectionName)
	c.JSON(http.StatusOK, gin.H{
		"message":        "Data uploaded successfully",
		"recordsAdded":   totalInserted,
		"csvTotalCount":  csvTotalCount,
		"beforeCount":    beforeCount,
		"afterCount":     afterCount,
		"duplicateCount": duplicateCount,
	})
}

func processBatch(ctx context.Context, collection *mongo.Collection, collectionName string, batch []interface{}, totalInserted *int) error {
	if len(batch) == 0 {
		return nil
	}

	if collectionName == "masterls_2" || collectionName == "mastermn_1" {
		res, err := collection.InsertMany(ctx, batch)
		if err != nil {
			return fmt.Errorf("failed to insert batch: %v", err)
		}
		*totalInserted += len(res.InsertedIDs)
		log.Printf("Inserted batch of %d records into collection %s", len(res.InsertedIDs), collectionName)
	} else if collectionName == "dataFpr" {
		var bulkOps []mongo.WriteModel
		for _, record := range batch {
			doc := record.(map[string]interface{})
			f := bson.M{
				"ticketnumber":  doc["ticketnumber"],
				"PartitionCode": doc["PartitionCode"],
				"city_code":     doc["city_code"],
				"Paxname":       doc["Paxname"],
				"routeawal":     doc["routeawal"],
				"routeakhir":    doc["routeakhir"],
				"dateofflight":  doc["dateofflight"],
				"airlines":      doc["airlines"],
				"Flightnumber":  doc["Flightnumber"],
				"airlinesTKT":   doc["airlinestkt"],
			}
			u := bson.M{"$set": doc}
			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
		}
		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
		if err != nil {
			return fmt.Errorf("failed to bulk write: %v", err)
		}
		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
	} else if collectionName == "masterTP_1" {
		var bulkOps []mongo.WriteModel
		for _, record := range batch {
			doc := record.(map[string]interface{})
			f := bson.M{
				"StationNo":   doc["StationNo"],
				"StationCode": doc["StationCode"],
				"AgentDie":    doc["AgentDie"],
				"Portal":      doc["Portal"],
				"PARTICY":     doc["PARTICY"],
				"DATA":        doc["DATA"],
			}
			u := bson.M{"$set": doc}
			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
		}
		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
		if err != nil {
			return fmt.Errorf("failed to bulk write: %v", err)
		}
		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
	} else if collectionName == "dataFmr" {
		var bulkOps []mongo.WriteModel
		for _, record := range batch {
			doc := record.(map[string]interface{})
			f := bson.M{
				"StationNo":    doc["StationNo"],
				"StationCode":  doc["StationCode"],
				"StationCurr":  doc["StationCurr"],
				"TicketNumber": doc["TicketNumber"],
				"PaxName":      doc["PaxName"],
				"PNRR":         doc["PNRR"],
				"AgentDie":     doc["AgentDie"],
				"TourCode":     doc["TourCode"],
				"FOP":          doc["FOP"],
			}
			u := bson.M{"$set": doc}
			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
		}
		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
		if err != nil {
			return fmt.Errorf("failed to bulk write: %v", err)
		}
		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
	} else {
		var bulkOps []mongo.WriteModel
		for _, record := range batch {
			doc := record.(map[string]interface{})
			uniqueKeyField := getUniqueKeyField(collectionName)
			f := bson.M{uniqueKeyField: doc[uniqueKeyField]}
			u := bson.M{"$set": doc}
			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
		}
		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
		if err != nil {
			return fmt.Errorf("failed to bulk write: %v", err)
		}
		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
	}
	runtime.GC()
	return nil
}

func getUniqueKeyField(collectionName string) string {
	switch collectionName {
	case "masteric_2":
		return "STT No"
	case "mastertbs_4":
		return "Kode"
	case "masterrg_6":
		return "Productroute"
	case "masterdl_9":
		return "STT No"
	default:
		return "_id"
	}
}

func GenerateUniqueKeyForMasterrt(record map[string]interface{}) string {
	rute := fmt.Sprintf("%v", record["Rute"])
	truckRate := fmt.Sprintf("%v", record["Truck Rate"])
	return fmt.Sprintf("%s|%s", rute, truckRate)
}

func insertUploadLog(collectionName string, csvTotalCount, recordCount int, status, errorMessage string, beforeCount, afterCount int64, duplicateCount int, username string, month string) {
	logCollection := db.GetCollection("update_logs")
	logEntry := models.UploadLog{
		CollectionName: collectionName,
		CSVTotalCount:  csvTotalCount,
		RecordCount:    recordCount,
		UploadedAt:     time.Now(),
		Status:         status,
		ErrorMessage:   errorMessage,
		DataBefore:     beforeCount,
		DataAfter:      afterCount,
		DuplicateCount: duplicateCount,
		UploadedBy:     username,
		Month:          month,
	}
	if _, err := logCollection.InsertOne(context.Background(), logEntry); err != nil {
		log.Printf("Failed to insert upload log for collection %s: %v", collectionName, err)
	}
}

func respondWithJSONError(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, gin.H{
		"error":   message,
		"message": message,
	})
}
