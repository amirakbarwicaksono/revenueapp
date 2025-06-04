package handlers

import (
	"backend/db"
	"backend/models"
	"context"
	"encoding/csv"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func UploadData(c *gin.Context) {
	// Extract query parameters
	collectionName := c.Query("collection")
	username := c.Query("username") // Username of the uploader
	month := c.PostForm("month")    // Month of the data aktifkan ini nanti

	if collectionName == "" || username == "" || month == "" {
		respondWithJSONError(c, http.StatusBadRequest, "Collection name, username, and month are required")
		return
	}

	// Validate the collection name
	structType, exists := collectionStructs[collectionName]
	if !exists {
		respondWithJSONError(c, http.StatusBadRequest, fmt.Sprintf("Unknown collection: %s", collectionName))
		return
	}

	// Parse the CSV file
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

	// Get expected headers from the struct
	expectedHeaders := getStructHeaders(structType)

	// Log headers for debugging
	log.Printf("Collection: %s, CSV Headers: %v, Expected Headers: %v", collectionName, csvHeaders, expectedHeaders)

	if err := validateHeaders(csvHeaders, expectedHeaders); err != nil {
		respondWithJSONError(c, http.StatusBadRequest, "Header validation failed: "+err.Error())
		return
	}

	// Read CSV records
	records, err := reader.ReadAll()
	if err != nil {
		respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV data: "+err.Error())
		return
	}

	// Total records from the CSV
	csvTotalCount := len(records)

	// Prepare data and handle duplicates (dimatikan sementara)
	var data []interface{}
	seenRecords := make(map[string]struct{})
	for _, record := range records {
		row := make(map[string]interface{})
		for i, value := range record {
			row[csvHeaders[i]] = TrimSpacesAndRemoveChar160(value)
		}
		row["month"] = month // Add the month to each record aktifkan ini nanti
		uniqueKey := GenerateUniqueKey(row)
		if _, exists := seenRecords[uniqueKey]; exists {
			continue // Skip duplicates
		}
		seenRecords[uniqueKey] = struct{}{}
		data = append(data, row)
	}
	// Di dalam UploadData, sebelum loop batch processing

	// var data []interface{}
	// // In UploadData, before batch processing
	// seenRecords := make(map[string]struct{})
	// var duplicates []map[string]interface{} // To store duplicate rows
	// for _, record := range records {
	// 	row := make(map[string]interface{})
	// 	for i, value := range record {
	// 		row[csvHeaders[i]] = TrimSpacesAndRemoveChar160(value)
	// 	}
	// 	row["month"] = month
	// 	uniqueKey := GenerateUniqueKey(row) // Remove collectionName
	// 	if _, exists := seenRecords[uniqueKey]; exists {
	// 		duplicates = append(duplicates, row) // Store duplicate row
	// 		log.Printf("Duplicate record found for collection %s: %v", collectionName, row)
	// 		continue
	// 	}
	// 	seenRecords[uniqueKey] = struct{}{}
	// 	data = append(data, row)
	// }

	// // (Optional) Log duplicates to MongoDB
	// if len(duplicates) > 0 {
	// 	logCollection := db.GetCollection("duplicate_logs")
	// 	for _, dup := range duplicates {
	// 		logEntry := bson.M{
	// 			"collectionName": collectionName,
	// 			"duplicateData":  dup,
	// 			"uniqueKey":      GenerateUniqueKey(dup), // Remove collectionName
	// 			"username":       username,
	// 			"month":          month,
	// 			"timestamp":      time.Now(),
	// 		}
	// 		if _, err := logCollection.InsertOne(context.Background(), logEntry); err != nil {
	// 			log.Printf("Failed to log duplicate for collection %s: %v", collectionName, err)
	// 		}
	// 	}
	// 	log.Printf("Found %d duplicate records for collection %s", len(duplicates), collectionName)
	// }
	// Lanjutkan dengan kode batch processing untuk "dataFpr" seperti sebelumnya

	// Get the MongoDB collection
	collection := db.GetCollection(collectionName)

	// Fetch "before" record count
	beforeCount, _ := collection.EstimatedDocumentCount(context.Background())

	// Remove existing data if necessary
	if shouldClear, ok := collectionsToClear[collectionName]; ok && shouldClear {
		if _, err := collection.DeleteMany(context.Background(), bson.D{}); err != nil {
			log.Printf("Failed to clear data in collection %s: %v", collectionName, err)
			respondWithJSONError(c, http.StatusInternalServerError, "Failed to clear data in collection")
			return
		}
		log.Printf("Data in collection %s cleared successfully", collectionName)
	}

	// Different handling for specific collections
	const batchSize = 1000
	var totalInserted int

	if collectionName == "masterls_2" || collectionName == "mastermn_1" {
		// InsertMany for collections datakof, datakif, mastermn_1
		for i := 0; i < len(data); i += batchSize {
			end := i + batchSize
			if end > len(data) {
				end = len(data)
			}
			batch := data[i:end]
			if _, err := collection.InsertMany(context.Background(), batch); err != nil {
				insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, 0, username, month)
				respondWithJSONError(c, http.StatusInternalServerError, "Failed to insert data into database")
				return
			}
			totalInserted += len(batch)
			log.Printf("Inserted batch of %d records into collection %s", len(batch), collectionName)
		}
	} else if collectionName == "dataFpr" {
		// Special handling for dataFpr: Upsert using composite key of 5 columns
		for i := 0; i < len(data); i += batchSize {
			end := i + batchSize
			if end > len(data) {
				end = len(data)
			}
			batch := data[i:end]
			var bulkOps []mongo.WriteModel
			for _, record := range batch {
				doc := record.(map[string]interface{})
				filter := bson.M{
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
				update := bson.M{"$set": doc}
				bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(filter).SetUpdate(update).SetUpsert(true))
			}

			res, err := collection.BulkWrite(context.Background(), bulkOps, options.BulkWrite().SetOrdered(false))
			if err != nil {
				insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, 0, username, month)
				respondWithJSONError(c, http.StatusInternalServerError, "Failed to insert or update data in database")
				return
			}

			totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
			log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in collection %s",
				res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
		}
	} else if collectionName == "masterTP_1" {
		// Special handling for masterTP_1: Upsert using composite key of all columns
		for i := 0; i < len(data); i += batchSize {
			end := i + batchSize
			if end > len(data) {
				end = len(data)
			}
			batch := data[i:end]
			var bulkOps []mongo.WriteModel
			for _, record := range batch {
				doc := record.(map[string]interface{})
				filter := bson.M{
					"StationNo":   doc["StationNo"],
					"StationCode": doc["StationCode"],
					"AgentDie":    doc["AgentDie"],
					"Portal":      doc["Portal"],
					"PARTICY":     doc["PARTICY"],
					"DATA":        doc["DATA"],
				}
				update := bson.M{"$set": doc}
				bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(filter).SetUpdate(update).SetUpsert(true))
			}

			res, err := collection.BulkWrite(context.Background(), bulkOps, options.BulkWrite().SetOrdered(false))
			if err != nil {
				insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, 0, username, month)
				respondWithJSONError(c, http.StatusInternalServerError, "Failed to insert or update data in database")
				return
			}

			totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
			log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in collection %s",
				res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
		}
	} else if collectionName == "dataFmr" {
		// Special handling for dataFpr: Upsert using composite key of 5 columns
		for i := 0; i < len(data); i += batchSize {
			end := i + batchSize
			if end > len(data) {
				end = len(data)
			}
			batch := data[i:end]
			var bulkOps []mongo.WriteModel
			for _, record := range batch {
				doc := record.(map[string]interface{})
				filter := bson.M{
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
				update := bson.M{"$set": doc}
				bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(filter).SetUpdate(update).SetUpsert(true))
			}

			res, err := collection.BulkWrite(context.Background(), bulkOps, options.BulkWrite().SetOrdered(false))
			if err != nil {
				insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, 0, username, month)
				respondWithJSONError(c, http.StatusInternalServerError, "Failed to insert or update data in database")
				return
			}

			totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
			log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in collection %s",
				res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
		}
	} else {
		// Default handling for other collections
		for i := 0; i < len(data); i += batchSize {
			end := i + batchSize
			if end > len(data) {
				end = len(data)
			}
			batch := data[i:end]
			var bulkOps []mongo.WriteModel
			for _, record := range batch {
				doc := record.(map[string]interface{})
				uniqueKeyField := getUniqueKeyField(collectionName)
				filter := bson.M{uniqueKeyField: doc[uniqueKeyField]}
				update := bson.M{"$set": doc}
				bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(filter).SetUpdate(update).SetUpsert(true))
			}

			res, err := collection.BulkWrite(context.Background(), bulkOps, options.BulkWrite().SetOrdered(false))
			if err != nil {
				insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, 0, username, month)
				respondWithJSONError(c, http.StatusInternalServerError, "Failed to insert or update data in database")
				return
			}

			totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
			log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in collection %s",
				res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
		}
	}

	// Fetch "after" record count
	afterCount, _ := collection.EstimatedDocumentCount(context.Background())

	// Calculate duplicate count
	duplicateCount := csvTotalCount - (int(afterCount) - int(beforeCount))

	// Insert upload log
	insertUploadLog(collectionName, csvTotalCount /*tambahan*/, totalInserted, "Success", "", beforeCount, afterCount, duplicateCount, username, month)

	// Success response
	log.Printf("Successfully inserted %d records into collection %s", totalInserted, collectionName)
	c.JSON(http.StatusOK, gin.H{
		"message":        "Data uploaded successfully",
		"recordsAdded":   totalInserted,
		"csvTotalCount":  csvTotalCount, // tambahan
		"beforeCount":    beforeCount,
		"afterCount":     afterCount,
		"duplicateCount": duplicateCount, // Ensure this is included
	})
}

// Helper to determine unique key field for collections
func getUniqueKeyField(collectionName string) string {
	switch collectionName {
	case "masteric_2":
		return "STT No"
	case "mastertbs_4":
		return "Kode"
	// case "masterbc_5":
	// 	return "Stt ID"
	case "masterrg_6":
		return "Productroute"
	// case "masterrf_7":
	// 	return "District Name"
	case "masterdl_9":
		return "STT No"
	default:
		return "_id" // Default field
	}
}

func GenerateUniqueKeyForMasterrt(record map[string]interface{}) string {
	rute := fmt.Sprintf("%v", record["Rute"])
	truckRate := fmt.Sprintf("%v", record["Truck Rate"])
	return fmt.Sprintf("%s|%s", rute, truckRate)
}

// Updated insertUploadLog function to include duplicate count
func insertUploadLog(collectionName string, csvTotalCount, recordCount int, status, errorMessage string, beforeCount, afterCount int64, duplicateCount int, username string, month string) {
	logCollection := db.GetCollection("update_logs")
	logEntry := models.UploadLog{
		CollectionName: collectionName,
		CSVTotalCount:  csvTotalCount, // New field for total CSV data count
		RecordCount:    recordCount,
		UploadedAt:     time.Now(),
		Status:         status,
		ErrorMessage:   errorMessage,
		DataBefore:     beforeCount,
		DataAfter:      afterCount,
		DuplicateCount: duplicateCount, // New field for duplicate count
		UploadedBy:     username,
		Month:          month, // New field for month
	}
	if _, err := logCollection.InsertOne(context.Background(), logEntry); err != nil {
		log.Printf("Failed to insert upload log for collection %s: %v", collectionName, err)
	}
}

// respondWithJSONError sends a JSON error response with the given status code and message.
func respondWithJSONError(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, gin.H{
		"error":   message,
		"message": message,
	})
}
