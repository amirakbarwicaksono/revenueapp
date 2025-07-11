// // // // package handlers

// // // // import (
// // // // 	"backend/db"
// // // // 	"backend/models"
// // // // 	"context"
// // // // 	"encoding/csv"
// // // // 	"fmt"
// // // // 	"log"
// // // // 	"net/http"
// // // // 	"runtime"
// // // // 	"strconv"
// // // // 	"time"

// // // // 	"github.com/gin-gonic/gin"
// // // // 	"go.mongodb.org/mongo-driver/bson"
// // // // 	"go.mongodb.org/mongo-driver/mongo"
// // // // 	"go.mongodb.org/mongo-driver/mongo/options"
// // // // )

// // // // func UploadData(c *gin.Context) {
// // // // 	// Log initial memory usage
// // // // 	var memStats runtime.MemStats
// // // // 	runtime.ReadMemStats(&memStats)
// // // // 	log.Printf("Initial memory usage - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)

// // // // 	// Set memory limit for multipart form parsing
// // // // 	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB
// // // // 		respondWithJSONError(c, http.StatusBadRequest, "Failed to parse multipart form: "+err.Error())
// // // // 		return
// // // // 	}

// // // // 	// Extract query parameters
// // // // 	collectionName := c.Query("collection")
// // // // 	username := c.Query("username")
// // // // 	month := c.PostForm("month")

// // // // 	if collectionName == "" || username == "" || month == "" {
// // // // 		respondWithJSONError(c, http.StatusBadRequest, "Collection name, username, and month are required")
// // // // 		return
// // // // 	}

// // // // 	// Validate collection name
// // // // 	structType, exists := collectionStructs[collectionName]
// // // // 	if !exists {
// // // // 		respondWithJSONError(c, http.StatusBadRequest, fmt.Sprintf("Unknown collection: %s", collectionName))
// // // // 		return
// // // // 	}

// // // // 	// Parse CSV file
// // // // 	file, _, err := c.Request.FormFile("file")
// // // // 	if err != nil {
// // // // 		respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV file: "+err.Error())
// // // // 		return
// // // // 	}
// // // // 	defer file.Close()

// // // // 	reader := csv.NewReader(file)

// // // // 	// Read CSV headers
// // // // 	csvHeaders, err := reader.Read()
// // // // 	if err != nil {
// // // // 		respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV headers: "+err.Error())
// // // // 		return
// // // // 	}

// // // // 	// Get expected headers
// // // // 	expectedHeaders := getStructHeaders(structType)

// // // // 	// Log headers for debugging
// // // // 	log.Printf("Collection: %s, CSV Headers: %v, Expected Headers: %v", collectionName, csvHeaders, expectedHeaders)

// // // // 	if err := validateHeaders(csvHeaders, expectedHeaders); err != nil {
// // // // 		respondWithJSONError(c, http.StatusBadRequest, "Header validation failed: "+err.Error())
// // // // 		return
// // // // 	}

// // // // 	// Create context with timeout
// // // // 	timeoutDuration := 30 * time.Minute
// // // // 	if collectionName == "dataFmr" {
// // // // 		timeoutDuration = 45 * time.Minute // Longer timeout for dataFmr
// // // // 	}
// // // // 	ctx, cancel := context.WithTimeout(context.Background(), timeoutDuration)
// // // // 	defer cancel()

// // // // 	// Get MongoDB collection
// // // // 	collection := db.GetCollection(collectionName)

// // // // 	// Fetch before count
// // // // 	beforeCount, err := collection.EstimatedDocumentCount(ctx)
// // // // 	if err != nil {
// // // // 		log.Printf("Failed to get before count for collection %s: %v", collectionName, err)
// // // // 		respondWithJSONError(c, http.StatusInternalServerError, "Failed to get collection count: "+err.Error())
// // // // 		return
// // // // 	}

// // // // 	// Clear data if necessary
// // // // 	if shouldClear, ok := collectionsToClear[collectionName]; ok && shouldClear {
// // // // 		if _, err := collection.DeleteMany(ctx, bson.D{}); err != nil {
// // // // 			log.Printf("Failed to clear data in collection %s: %v", collectionName, err)
// // // // 			respondWithJSONError(c, http.StatusInternalServerError, "Failed to clear data in collection: "+err.Error())
// // // // 			return
// // // // 		}
// // // // 		log.Printf("Data in collection %s cleared successfully", collectionName)
// // // // 	}

// // // // 	// Process CSV records in batches
// // // // 	batchSize := 100
// // // // 	if collectionName == "dataFmr" {
// // // // 		batchSize = 50 // Smaller batch size for dataFmr
// // // // 	}
// // // // 	var batch []interface{}
// // // // 	seenRecords := make(map[string]struct{}, batchSize) // Pre-allocate map
// // // // 	var totalInserted, csvTotalCount, duplicateCount int
// // // // 	batchCounter := 0

// // // // 	for {
// // // // 		record, err := reader.Read()
// // // // 		if err != nil {
// // // // 			if err.Error() == "EOF" {
// // // // 				break
// // // // 			}
// // // // 			respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV data: "+err.Error())
// // // // 			return
// // // // 		}

// // // // 		csvTotalCount++

// // // // 		// Process record
// // // // 		row := make(map[string]interface{})
// // // // 		for i, value := range record {
// // // // 			row[csvHeaders[i]] = TrimSpacesAndRemoveChar160(value)
// // // // 		}
// // // // 		row["month"] = month
// // // // 		uniqueKey := GenerateUniqueKey(row)
// // // // 		if _, exists := seenRecords[uniqueKey]; exists {
// // // // 			duplicateCount++
// // // // 			continue
// // // // 		}
// // // // 		seenRecords[uniqueKey] = struct{}{}
// // // // 		batch = append(batch, row)

// // // // 		// Process batch
// // // // 		if len(batch) >= batchSize {
// // // // 			startTime := time.Now()
// // // // 			if err := processBatch(ctx, collection, collectionName, batch, &totalInserted); err != nil {
// // // // 				log.Printf("Batch processing failed for collection %s after %v: %v", collectionName, time.Since(startTime), err)
// // // // 				insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, duplicateCount, username, month)
// // // // 				respondWithJSONError(c, http.StatusInternalServerError, "Failed to process batch: "+err.Error())
// // // // 				return
// // // // 			}
// // // // 			log.Printf("Processed batch %d of %d records for collection %s in %v", batchCounter+1, len(batch), collectionName, time.Since(startTime))
// // // // 			runtime.ReadMemStats(&memStats)
// // // // 			log.Printf("Memory after batch %d - Alloc: %v, TotalAlloc: %v, Sys: %v", batchCounter+1, memStats.Alloc, memStats.TotalAlloc, memStats.Sys)
// // // // 			batch = nil
// // // // 			seenRecords = make(map[string]struct{}, batchSize)
// // // // 			batchCounter++
// // // // 			if batchCounter%10 == 0 {
// // // // 				runtime.GC() // Force GC every 10 batches
// // // // 			}
// // // // 		}
// // // // 	}

// // // // 	// Process remaining records
// // // // 	if len(batch) > 0 {
// // // // 		startTime := time.Now()
// // // // 		if err := processBatch(ctx, collection, collectionName, batch, &totalInserted); err != nil {
// // // // 			log.Printf("Final batch processing failed for collection %s after %v: %v", collectionName, time.Since(startTime), err)
// // // // 			insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, duplicateCount, username, month)
// // // // 			respondWithJSONError(c, http.StatusInternalServerError, "Failed to process final batch: "+err.Error())
// // // // 			return
// // // // 		}
// // // // 		log.Printf("Processed final batch of %d records in %v", len(batch), time.Since(startTime))
// // // // 		runtime.ReadMemStats(&memStats)
// // // // 		log.Printf("Memory after final batch - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)
// // // // 	}

// // // // 	// Fetch after count
// // // // 	afterCount, err := collection.EstimatedDocumentCount(ctx)
// // // // 	if err != nil {
// // // // 		log.Printf("Failed to get after count for collection %s: %v", collectionName, err)
// // // // 		respondWithJSONError(c, http.StatusInternalServerError, "Failed to get collection count: "+err.Error())
// // // // 		return
// // // // 	}

// // // // 	// Insert log
// // // // 	insertUploadLog(collectionName, csvTotalCount, totalInserted, "Success", "", beforeCount, afterCount, duplicateCount, username, month)

// // // // 	// Log final memory usage
// // // // 	runtime.ReadMemStats(&memStats)
// // // // 	log.Printf("Final memory usage - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)

// // // // 	// Success response
// // // // 	log.Printf("Successfully inserted %d records into collection %s", totalInserted, collectionName)
// // // // 	c.JSON(http.StatusOK, gin.H{
// // // // 		"message":        "Data uploaded successfully",
// // // // 		"recordsAdded":   totalInserted,
// // // // 		"csvTotalCount":  csvTotalCount,
// // // // 		"beforeCount":    beforeCount,
// // // // 		"afterCount":     afterCount,
// // // // 		"duplicateCount": duplicateCount,
// // // // 	})
// // // // }

// // // // func processBatch(ctx context.Context, collection *mongo.Collection, collectionName string, batch []interface{}, totalInserted *int) error {
// // // // 	if len(batch) == 0 {
// // // // 		return nil
// // // // 	}

// // // // 	if collectionName == "masterls_2" || collectionName == "mastermn_1" {
// // // // 		res, err := collection.InsertMany(ctx, batch)
// // // // 		if err != nil {
// // // // 			return fmt.Errorf("failed to insert batch: %v", err)
// // // // 		}
// // // // 		*totalInserted += len(res.InsertedIDs)
// // // // 		log.Printf("Inserted batch of %d records into collection %s", len(res.InsertedIDs), collectionName)
// // // // 	} else if collectionName == "dataFpr" {
// // // // 		var bulkOps []mongo.WriteModel
// // // // 		for _, record := range batch {
// // // // 			doc := record.(map[string]interface{})
// // // // 			f := bson.M{
// // // // 				"ticketnumber":  doc["ticketnumber"],
// // // // 				"PartitionCode": doc["PartitionCode"],
// // // // 				"city_code":     doc["city_code"],
// // // // 				"Paxname":       doc["Paxname"],
// // // // 				"routeawal":     doc["routeawal"],
// // // // 				"routeakhir":    doc["routeakhir"],
// // // // 				"dateofflight":  doc["dateofflight"],
// // // // 				"airlines":      doc["airlines"],
// // // // 				"Flightnumber":  doc["Flightnumber"],
// // // // 				"airlinesTKT":   doc["airlinestkt"],
// // // // 			}
// // // // 			u := bson.M{"$set": doc}
// // // // 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// // // // 		}
// // // // 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// // // // 		if err != nil {
// // // // 			return fmt.Errorf("failed to bulk write: %v", err)
// // // // 		}
// // // // 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// // // // 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// // // // 	} else if collectionName == "masterTP_1" {
// // // // 		var bulkOps []mongo.WriteModel
// // // // 		for _, record := range batch {
// // // // 			doc := record.(map[string]interface{})
// // // // 			f := bson.M{
// // // // 				"StationNo":   doc["StationNo"],
// // // // 				"StationCode": doc["StationCode"],
// // // // 				"AgentDie":    doc["AgentDie"],
// // // // 				"Portal":      doc["Portal"],
// // // // 				"PARTICY":     doc["PARTICY"],
// // // // 				"DATA":        doc["DATA"],
// // // // 			}
// // // // 			u := bson.M{"$set": doc}
// // // // 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// // // // 		}
// // // // 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// // // // 		if err != nil {
// // // // 			return fmt.Errorf("failed to bulk write: %v", err)
// // // // 		}
// // // // 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// // // // 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// // // // 		// } else if collectionName == "dataFmr" {
// // // // 		// 	var bulkOps []mongo.WriteModel
// // // // 		// 	for _, record := range batch {
// // // // 		// 		doc := record.(map[string]interface{})
// // // // 		// 		f := bson.M{
// // // // 		// 			"StationNo":    doc["StationNo"],
// // // // 		// 			"StationCode":  doc["StationCode"],
// // // // 		// 			"StationCurr":  doc["StationCurr"],
// // // // 		// 			"TicketNumber": doc["TicketNumber"],
// // // // 		// 			"PaxName":      doc["PaxName"],
// // // // 		// 			"PNRR":         doc["PNRR"],
// // // // 		// 			"AgentDie":     doc["AgentDie"],
// // // // 		// 			"TourCode":     doc["TourCode"],
// // // // 		// 			"FOP":          doc["FOP"],
// // // // 		// 		}
// // // // 		// 		u := bson.M{"$set": doc}
// // // // 		// 		bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// // // // 		// 	}
// // // // 		// 	res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// // // // 		// 	if err != nil {
// // // // 		// 		return fmt.Errorf("failed to bulk write: %v", err)
// // // // 		// 	}
// // // // 		// 	*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// // // // 		// 	log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// // // // 	} else if collectionName == "dataFmr" {
// // // // 		var bulkOps []mongo.WriteModel
// // // // 		for _, record := range batch {
// // // // 			doc := record.(map[string]interface{})

// // // // 			// Convert TicketNumber to int64
// // // // 			ticketNumberStr, ok := doc["TicketNumber"].(string)
// // // // 			if !ok {
// // // // 				return fmt.Errorf("TicketNumber is not a string: %v", doc["TicketNumber"])
// // // // 			}

// // // // 			// Handle scientific notation
// // // // 			ticketNumberFloat, err := strconv.ParseFloat(ticketNumberStr, 64)
// // // // 			if err != nil {
// // // // 				return fmt.Errorf("failed to parse TicketNumber '%s': %v", ticketNumberStr, err)
// // // // 			}

// // // // 			// Convert to int64
// // // // 			ticketNumber := int64(ticketNumberFloat)
// // // // 			if ticketNumber <= 0 {
// // // // 				return fmt.Errorf("invalid TicketNumber '%s': must be a positive integer", ticketNumberStr)
// // // // 			}

// // // // 			// Update doc with converted TicketNumber
// // // // 			doc["TicketNumber"] = ticketNumber

// // // // 			f := bson.M{
// // // // 				"StationNo":    doc["StationNo"],
// // // // 				"StationCode":  doc["StationCode"],
// // // // 				"StationCurr":  doc["StationCurr"],
// // // // 				"TicketNumber": ticketNumber, // Use converted int64
// // // // 				"PaxName":      doc["PaxName"],
// // // // 				"PNRR":         doc["PNRR"],
// // // // 				"AgentDie":     doc["AgentDie"],
// // // // 				"TourCode":     doc["TourCode"],
// // // // 				"FOP":          doc["FOP"],
// // // // 			}
// // // // 			u := bson.M{"$set": doc}
// // // // 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// // // // 		}
// // // // 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// // // // 		if err != nil {
// // // // 			return fmt.Errorf("failed to bulk write: %v", err)
// // // // 		}
// // // // 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// // // // 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// // // // 	} else {
// // // // 		var bulkOps []mongo.WriteModel
// // // // 		for _, record := range batch {
// // // // 			doc := record.(map[string]interface{})
// // // // 			uniqueKeyField := getUniqueKeyField(collectionName)
// // // // 			f := bson.M{uniqueKeyField: doc[uniqueKeyField]}
// // // // 			u := bson.M{"$set": doc}
// // // // 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// // // // 		}
// // // // 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// // // // 		if err != nil {
// // // // 			return fmt.Errorf("failed to bulk write: %v", err)
// // // // 		}
// // // // 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// // // // 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// // // // 	}
// // // // 	return nil
// // // // }

// // // // func getUniqueKeyField(collectionName string) string {
// // // // 	switch collectionName {
// // // // 	case "masteric_2":
// // // // 		return "STT No"
// // // // 	case "mastertbs_4":
// // // // 		return "Kode"
// // // // 	case "masterrg_6":
// // // // 		return "Productroute"
// // // // 	case "masterdl_9":
// // // // 		return "STT No"
// // // // 	default:
// // // // 		return "_id"
// // // // 	}
// // // // }

// // // // func GenerateUniqueKeyForMasterrt(record map[string]interface{}) string {
// // // // 	rute := fmt.Sprintf("%v", record["Rute"])
// // // // 	truckRate := fmt.Sprintf("%v", record["Truck Rate"])
// // // // 	return fmt.Sprintf("%s|%s", rute, truckRate)
// // // // }

// // // // func insertUploadLog(collectionName string, csvTotalCount, recordCount int, status, errorMessage string, beforeCount, afterCount int64, duplicateCount int, username string, month string) {
// // // // 	logCollection := db.GetCollection("update_logs")
// // // // 	logEntry := models.UploadLog{
// // // // 		CollectionName: collectionName,
// // // // 		CSVTotalCount:  csvTotalCount,
// // // // 		RecordCount:    recordCount,
// // // // 		UploadedAt:     time.Now(),
// // // // 		Status:         status,
// // // // 		ErrorMessage:   errorMessage,
// // // // 		DataBefore:     beforeCount,
// // // // 		DataAfter:      afterCount,
// // // // 		DuplicateCount: duplicateCount,
// // // // 		UploadedBy:     username,
// // // // 		Month:          month,
// // // // 	}
// // // // 	if _, err := logCollection.InsertOne(context.Background(), logEntry); err != nil {
// // // // 		log.Printf("Failed to insert upload log for collection %s: %v", collectionName, err)
// // // // 	}
// // // // }

// // // // func respondWithJSONError(c *gin.Context, statusCode int, message string) {
// // // // 	c.JSON(statusCode, gin.H{
// // // // 		"error":   message,
// // // // 		"message": message,
// // // // 	})
// // // // }

// // // // Added Handler for Handling 13digit ticket number
// package handlers

// import (
// 	"backend/db"
// 	"backend/models"
// 	"context"
// 	"encoding/csv"
// 	"fmt"
// 	"log"
// 	"net/http"
// 	"regexp"
// 	"runtime"
// 	"strconv"
// 	"time"

// 	"github.com/gin-gonic/gin"
// 	"go.mongodb.org/mongo-driver/bson"
// 	"go.mongodb.org/mongo-driver/mongo"
// 	"go.mongodb.org/mongo-driver/mongo/options"
// )

// func UploadData(c *gin.Context) {
// 	// Log initial memory usage
// 	var memStats runtime.MemStats
// 	runtime.ReadMemStats(&memStats)
// 	log.Printf("Initial memory usage - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)

// 	// Set memory limit for multipart form parsing
// 	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB
// 		respondWithJSONError(c, http.StatusBadRequest, "Failed to parse multipart form: "+err.Error())
// 		return
// 	}

// 	// Extract query parameters
// 	collectionName := c.Query("collection")
// 	username := c.Query("username")
// 	month := c.PostForm("month")

// 	if collectionName == "" || username == "" || month == "" {
// 		respondWithJSONError(c, http.StatusBadRequest, "Collection name, username, and month are required")
// 		return
// 	}

// 	// Validate collection name
// 	structType, exists := collectionStructs[collectionName]
// 	if !exists {
// 		respondWithJSONError(c, http.StatusBadRequest, fmt.Sprintf("Unknown collection: %s", collectionName))
// 		return
// 	}

// 	// Parse CSV file
// 	file, _, err := c.Request.FormFile("file")
// 	if err != nil {
// 		respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV file: "+err.Error())
// 		return
// 	}
// 	defer file.Close()

// 	reader := csv.NewReader(file)

// 	// Read CSV headers
// 	csvHeaders, err := reader.Read()
// 	if err != nil {
// 		respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV headers: "+err.Error())
// 		return
// 	}

// 	// Get expected headers
// 	expectedHeaders := getStructHeaders(structType)

// 	// Log headers for debugging
// 	log.Printf("Collection: %s, CSV Headers: %v, Expected Headers: %v", collectionName, csvHeaders, expectedHeaders)

// 	if err := validateHeaders(csvHeaders, expectedHeaders); err != nil {
// 		respondWithJSONError(c, http.StatusBadRequest, "Header validation failed: "+err.Error())
// 		return
// 	}

// 	// Pre-validate TicketNumber for dataFmr
// 	if collectionName == "dataFmr" {
// 		ticketNumberRegex := regexp.MustCompile(`^[0-9]{13}$`)
// 		rowNum := 1 // Header is row 1, data starts at row 2
// 		var ticketNumberIndex int
// 		for i, header := range csvHeaders {
// 			if header == "TicketNumber" {
// 				ticketNumberIndex = i
// 				break
// 			}
// 		}

// 		// Create a new reader to re-read the CSV from the start
// 		file.Seek(0, 0)
// 		reader = csv.NewReader(file)
// 		_, err := reader.Read() // Skip headers
// 		if err != nil {
// 			respondWithJSONError(c, http.StatusBadRequest, "Failed to re-read CSV headers: "+err.Error())
// 			return
// 		}

// 		for {
// 			record, err := reader.Read()
// 			if err != nil {
// 				if err.Error() == "EOF" {
// 					break
// 				}
// 				respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV data: "+err.Error())
// 				return
// 			}
// 			rowNum++
// 			ticketNumber := TrimSpacesAndRemoveChar160(record[ticketNumberIndex])
// 			if !ticketNumberRegex.MatchString(ticketNumber) {
// 				errMsg := fmt.Sprintf("Upload failed: TicketNumber '%s' in row %d is not 13 digits", ticketNumber, rowNum)
// 				log.Printf("Validation failed for collection %s: %s", collectionName, errMsg)
// 				respondWithJSONError(c, http.StatusBadRequest, errMsg)
// 				return
// 			}
// 		}

// 		// Reset file pointer and reader for batch processing
// 		file.Seek(0, 0)
// 		reader = csv.NewReader(file)
// 		_, err = reader.Read() // Skip headers again
// 		if err != nil {
// 			respondWithJSONError(c, http.StatusBadRequest, "Failed to reset CSV reader: "+err.Error())
// 			return
// 		}
// 	}

// 	// Create context with timeout
// 	timeoutDuration := 30 * time.Minute
// 	if collectionName == "dataFmr" {
// 		timeoutDuration = 45 * time.Minute // Longer timeout for dataFmr
// 	}
// 	ctx, cancel := context.WithTimeout(context.Background(), timeoutDuration)
// 	defer cancel()

// 	// Get MongoDB collection
// 	collection := db.GetCollection(collectionName)

// 	// Fetch before count
// 	beforeCount, err := collection.EstimatedDocumentCount(ctx)
// 	if err != nil {
// 		log.Printf("Failed to get before count for collection %s: %v", collectionName, err)
// 		respondWithJSONError(c, http.StatusInternalServerError, "Failed to get collection count: "+err.Error())
// 		return
// 	}

// 	// Clear data if necessary
// 	if shouldClear, ok := collectionsToClear[collectionName]; ok && shouldClear {
// 		if _, err := collection.DeleteMany(ctx, bson.D{}); err != nil {
// 			log.Printf("Failed to clear data in collection %s: %v", collectionName, err)
// 			respondWithJSONError(c, http.StatusInternalServerError, "Failed to clear data in collection: "+err.Error())
// 			return
// 		}
// 		log.Printf("Data in collection %s cleared successfully", collectionName)
// 	}

// 	// Process CSV records in batches
// 	batchSize := 100
// 	if collectionName == "dataFmr" {
// 		batchSize = 50 // Smaller batch size for dataFmr
// 	}
// 	var batch []interface{}
// 	seenRecords := make(map[string]struct{}, batchSize)
// 	var totalInserted, csvTotalCount, duplicateCount int
// 	batchCounter := 0

// 	for {
// 		record, err := reader.Read()
// 		if err != nil {
// 			if err.Error() == "EOF" {
// 				break
// 			}
// 			respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV data: "+err.Error())
// 			return
// 		}

// 		csvTotalCount++

// 		// Process record
// 		row := make(map[string]interface{})
// 		for i, value := range record {
// 			row[csvHeaders[i]] = TrimSpacesAndRemoveChar160(value)
// 		}
// 		row["month"] = month
// 		uniqueKey := GenerateUniqueKey(row)
// 		if _, exists := seenRecords[uniqueKey]; exists {
// 			duplicateCount++
// 			continue
// 		}
// 		seenRecords[uniqueKey] = struct{}{}
// 		batch = append(batch, row)

// 		// Process batch
// 		if len(batch) >= batchSize {
// 			startTime := time.Now()
// 			if err := processBatch(ctx, collection, collectionName, batch, &totalInserted); err != nil {
// 				log.Printf("Batch processing failed for collection %s after %v: %v", collectionName, time.Since(startTime), err)
// 				insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, duplicateCount, username, month)
// 				respondWithJSONError(c, http.StatusInternalServerError, "Failed to process batch: "+err.Error())
// 				return
// 			}
// 			log.Printf("Processed batch %d of %d records for collection %s in %v", batchCounter+1, len(batch), collectionName, time.Since(startTime))
// 			runtime.ReadMemStats(&memStats)
// 			log.Printf("Memory after batch %d - Alloc: %v, TotalAlloc: %v, Sys: %v", batchCounter+1, memStats.Alloc, memStats.TotalAlloc, memStats.Sys)
// 			batch = nil
// 			seenRecords = make(map[string]struct{}, batchSize)
// 			batchCounter++
// 			if batchCounter%10 == 0 {
// 				runtime.GC() // Force GC every 10 batches
// 			}
// 		}
// 	}

// 	// Process remaining records
// 	if len(batch) > 0 {
// 		startTime := time.Now()
// 		if err := processBatch(ctx, collection, collectionName, batch, &totalInserted); err != nil {
// 			log.Printf("Final batch processing failed for collection %s after %v: %v", collectionName, time.Since(startTime), err)
// 			insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, duplicateCount, username, month)
// 			respondWithJSONError(c, http.StatusInternalServerError, "Failed to process final batch: "+err.Error())
// 			return
// 		}
// 		log.Printf("Processed final batch of %d records in %v", len(batch), time.Since(startTime))
// 		runtime.ReadMemStats(&memStats)
// 		log.Printf("Memory after final batch - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)
// 	}

// 	// Fetch after count
// 	afterCount, err := collection.EstimatedDocumentCount(ctx)
// 	if err != nil {
// 		log.Printf("Failed to get after count for collection %s: %v", collectionName, err)
// 		respondWithJSONError(c, http.StatusInternalServerError, "Failed to get collection count: "+err.Error())
// 		return
// 	}

// 	// Insert log
// 	insertUploadLog(collectionName, csvTotalCount, totalInserted, "Success", "", beforeCount, afterCount, duplicateCount, username, month)

// 	// Log final memory usage
// 	runtime.ReadMemStats(&memStats)
// 	log.Printf("Final memory usage - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)

// 	// Success response
// 	log.Printf("Successfully inserted %d records into collection %s", totalInserted, collectionName)
// 	c.JSON(http.StatusOK, gin.H{
// 		"message":        "Data uploaded successfully",
// 		"recordsAdded":   totalInserted,
// 		"csvTotalCount":  csvTotalCount,
// 		"beforeCount":    beforeCount,
// 		"afterCount":     afterCount,
// 		"duplicateCount": duplicateCount,
// 	})
// }

// func processBatch(ctx context.Context, collection *mongo.Collection, collectionName string, batch []interface{}, totalInserted *int) error {
// 	if len(batch) == 0 {
// 		return nil
// 	}

// 	if collectionName == "masterls_2" || collectionName == "mastermn_1" {
// 		res, err := collection.InsertMany(ctx, batch)
// 		if err != nil {
// 			return fmt.Errorf("failed to insert batch: %v", err)
// 		}
// 		*totalInserted += len(res.InsertedIDs)
// 		log.Printf("Inserted batch of %d records into collection %s", len(res.InsertedIDs), collectionName)
// 	} else if collectionName == "dataFpr" {
// 		var bulkOps []mongo.WriteModel
// 		for _, record := range batch {
// 			doc := record.(map[string]interface{})
// 			f := bson.M{
// 				"ticketnumber":  doc["ticketnumber"],
// 				"PartitionCode": doc["PartitionCode"],
// 				"city_code":     doc["city_code"],
// 				"Paxname":       doc["Paxname"],
// 				"routeawal":     doc["routeawal"],
// 				"routeakhir":    doc["routeakhir"],
// 				"dateofflight":  doc["dateofflight"],
// 				"airlines":      doc["airlines"],
// 				"Flightnumber":  doc["Flightnumber"],
// 				"airlinesTKT":   doc["airlinestkt"],
// 			}
// 			u := bson.M{"$set": doc}
// 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// 		}
// 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// 		if err != nil {
// 			return fmt.Errorf("failed to bulk write: %v", err)
// 		}
// 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// 	} else if collectionName == "masterTP_1" {
// 		var bulkOps []mongo.WriteModel
// 		for _, record := range batch {
// 			doc := record.(map[string]interface{})
// 			f := bson.M{
// 				"StationNo":   doc["StationNo"],
// 				"StationCode": doc["StationCode"],
// 				"AgentDie":    doc["AgentDie"],
// 				"Portal":      doc["Portal"],
// 				"PARTICY":     doc["PARTICY"],
// 				"DATA":        doc["DATA"],
// 			}
// 			u := bson.M{"$set": doc}
// 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// 		}
// 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// 		if err != nil {
// 			return fmt.Errorf("failed to bulk write: %v", err)
// 		}
// 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.MatchedCount, res.UpsertedCount, collectionName)
// 	} else if collectionName == "dataFmr" {
// 		var bulkOps []mongo.WriteModel
// 		for _, record := range batch {
// 			doc := record.(map[string]interface{})

// 			// Convert TicketNumber to int64
// 			ticketNumberStr, ok := doc["TicketNumber"].(string)
// 			if !ok {
// 				return fmt.Errorf("TicketNumber is not a string: %v", doc["TicketNumber"])
// 			}

// 			// Convert to int64 (pre-validation ensures it's 13 digits)
// 			ticketNumber, err := strconv.ParseInt(ticketNumberStr, 10, 64)
// 			if err != nil {
// 				return fmt.Errorf("failed to parse TicketNumber '%s': %v", ticketNumberStr, err)
// 			}

// 			// Update doc with converted TicketNumber
// 			doc["TicketNumber"] = ticketNumber

// 			f := bson.M{
// 				"StationNo":    doc["StationNo"],
// 				"StationCode":  doc["StationCode"],
// 				"StationCurr":  doc["StationCurr"],
// 				"TicketNumber": ticketNumber,
// 				"PaxName":      doc["PaxName"],
// 				"PNRR":         doc["PNRR"],
// 				"AgentDie":     doc["AgentDie"],
// 				"TourCode":     doc["TourCode"],
// 				"FOP":          doc["FOP"],
// 			}
// 			u := bson.M{"$set": doc}
// 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// 		}
// 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// 		if err != nil {
// 			return fmt.Errorf("failed to bulk write: %v", err)
// 		}
// 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// 	} else {
// 		var bulkOps []mongo.WriteModel
// 		for _, record := range batch {
// 			doc := record.(map[string]interface{})
// 			uniqueKeyField := getUniqueKeyField(collectionName)
// 			f := bson.M{uniqueKeyField: doc[uniqueKeyField]}
// 			u := bson.M{"$set": doc}
// 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// 		}
// 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// 		if err != nil {
// 			return fmt.Errorf("failed to bulk write: %v", err)
// 		}
// 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// 	}
// 	return nil
// }

// func getUniqueKeyField(collectionName string) string {
// 	switch collectionName {
// 	case "masteric_2":
// 		return "STT No"
// 	case "mastertbs_4":
// 		return "Kode"
// 	case "masterrg_6":
// 		return "Productroute"
// 	case "masterdl_9":
// 		return "STT No"
// 	default:
// 		return "_id"
// 	}
// }

// func GenerateUniqueKeyForMasterrt(record map[string]interface{}) string {
// 	rute := fmt.Sprintf("%v", record["Rute"])
// 	truckRate := fmt.Sprintf("%v", record["Truck Rate"])
// 	return fmt.Sprintf("%s|%s", rute, truckRate)
// }

// func insertUploadLog(collectionName string, csvTotalCount, recordCount int, status, errorMessage string, beforeCount, afterCount int64, duplicateCount int, username string, month string) {
// 	logCollection := db.GetCollection("update_logs")
// 	logEntry := models.UploadLog{
// 		CollectionName: collectionName,
// 		CSVTotalCount:  csvTotalCount,
// 		RecordCount:    recordCount,
// 		UploadedAt:     time.Now(),
// 		Status:         status,
// 		ErrorMessage:   errorMessage,
// 		DataBefore:     beforeCount,
// 		DataAfter:      afterCount,
// 		DuplicateCount: duplicateCount,
// 		UploadedBy:     username,
// 		Month:          month,
// 	}
// 	if _, err := logCollection.InsertOne(context.Background(), logEntry); err != nil {
// 		log.Printf("Failed to insert upload log for collection %s: %v", collectionName, err)
// 	}
// }

// func respondWithJSONError(c *gin.Context, statusCode int, message string) {
// 	c.JSON(statusCode, gin.H{
// 		"error":   message,
// 		"message": message,
// 	})
// }

// added counting duplicate
// package handlers

// import (
// 	"backend/db"
// 	"backend/models"
// 	"context"
// 	"encoding/csv"
// 	"fmt"
// 	"log"
// 	"net/http"
// 	"regexp"
// 	"runtime"
// 	"strconv"
// 	"strings"
// 	"time"

// 	"github.com/gin-gonic/gin"
// 	"go.mongodb.org/mongo-driver/bson"
// 	"go.mongodb.org/mongo-driver/mongo"
// 	"go.mongodb.org/mongo-driver/mongo/options"
// )

// func UploadData(c *gin.Context) {
// 	// Log initial memory usage
// 	var memStats runtime.MemStats
// 	runtime.ReadMemStats(&memStats)
// 	log.Printf("Initial memory usage - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)

// 	// Set memory limit for multipart form parsing
// 	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB
// 		respondWithJSONError(c, http.StatusBadRequest, "Failed to parse multipart form: "+err.Error())
// 		return
// 	}

// 	// Extract query parameters
// 	collectionName := c.Query("collection")
// 	username := c.Query("username")
// 	month := c.PostForm("month")

// 	if collectionName == "" || username == "" || month == "" {
// 		respondWithJSONError(c, http.StatusBadRequest, "Collection name, username, and month are required")
// 		return
// 	}

// 	// Validate collection name
// 	structType, exists := collectionStructs[collectionName]
// 	if !exists {
// 		respondWithJSONError(c, http.StatusBadRequest, fmt.Sprintf("Unknown collection: %s", collectionName))
// 		return
// 	}

// 	// Parse CSV file
// 	file, _, err := c.Request.FormFile("file")
// 	if err != nil {
// 		respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV file: "+err.Error())
// 		return
// 	}
// 	defer file.Close()

// 	reader := csv.NewReader(file)

// 	// Read CSV headers
// 	csvHeaders, err := reader.Read()
// 	if err != nil {
// 		respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV headers: "+err.Error())
// 		return
// 	}

// 	// Get expected headers
// 	expectedHeaders := getStructHeaders(structType)

// 	// Log headers for debugging
// 	log.Printf("Collection: %s, CSV Headers: %v, Expected Headers: %v", collectionName, csvHeaders, expectedHeaders)

// 	if err := validateHeaders(csvHeaders, expectedHeaders); err != nil {
// 		respondWithJSONError(c, http.StatusBadRequest, "Header validation failed: "+err.Error())
// 		return
// 	}

// 	// Pre-validate TicketNumber and check duplicates for dataFmr
// 	var seenRecords map[string]struct{}
// 	var ticketNumberIndex int
// 	if collectionName == "dataFmr" {
// 		ticketNumberRegex := regexp.MustCompile(`^[0-9]{13}$`)
// 		seenRecords = make(map[string]struct{}, 1000) // Initialize once for entire CSV
// 		rowNum := 1                                   // Header is row 1, data starts at row 2
// 		for i, header := range csvHeaders {
// 			if header == "TicketNumber" {
// 				ticketNumberIndex = i
// 				break
// 			}
// 		}

// 		// Create a new reader to re-read the CSV from the start
// 		file.Seek(0, 0)
// 		reader = csv.NewReader(file)
// 		_, err := reader.Read() // Skip headers
// 		if err != nil {
// 			respondWithJSONError(c, http.StatusBadRequest, "Failed to re-read CSV headers: "+err.Error())
// 			return
// 		}

// 		for {
// 			record, err := reader.Read()
// 			if err != nil {
// 				if err.Error() == "EOF" {
// 					break
// 				}
// 				respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV data: "+err.Error())
// 				return
// 			}
// 			rowNum++
// 			ticketNumber := TrimSpacesAndRemoveChar160(record[ticketNumberIndex])
// 			if !ticketNumberRegex.MatchString(ticketNumber) {
// 				errMsg := fmt.Sprintf("Upload failed: TicketNumber '%s' in row %d is not 13 digits", ticketNumber, rowNum)
// 				log.Printf("Validation failed for collection %s: %s", collectionName, errMsg)
// 				respondWithJSONError(c, http.StatusBadRequest, errMsg)
// 				return
// 			}
// 			// Generate unique key for duplicate detection
// 			uniqueKey := generateDataFmrUniqueKey(record, csvHeaders)
// 			if _, exists := seenRecords[uniqueKey]; exists {
// 				// Duplicates handled later in batch processing
// 			} else {
// 				seenRecords[uniqueKey] = struct{}{}
// 			}
// 		}

// 		// Reset file pointer and reader for batch processing
// 		file.Seek(0, 0)
// 		reader = csv.NewReader(file)
// 		_, err = reader.Read() // Skip headers again
// 		if err != nil {
// 			respondWithJSONError(c, http.StatusBadRequest, "Failed to reset CSV reader: "+err.Error())
// 			return
// 		}
// 	} else {
// 		seenRecords = make(map[string]struct{}, 100) // Default for other collections
// 	}

// 	// Create context with timeout
// 	timeoutDuration := 30 * time.Minute
// 	if collectionName == "dataFmr" {
// 		timeoutDuration = 45 * time.Minute // Longer timeout for dataFmr
// 	}
// 	ctx, cancel := context.WithTimeout(context.Background(), timeoutDuration)
// 	defer cancel()

// 	// Get MongoDB collection
// 	collection := db.GetCollection(collectionName)

// 	// Fetch before count
// 	beforeCount, err := collection.EstimatedDocumentCount(ctx)
// 	if err != nil {
// 		log.Printf("Failed to get before count for collection %s: %v", collectionName, err)
// 		respondWithJSONError(c, http.StatusInternalServerError, "Failed to get collection count: "+err.Error())
// 		return
// 	}

// 	// Clear data if necessary
// 	if shouldClear, ok := collectionsToClear[collectionName]; ok && shouldClear {
// 		if _, err := collection.DeleteMany(ctx, bson.D{}); err != nil {
// 			log.Printf("Failed to clear data in collection %s: %v", collectionName, err)
// 			respondWithJSONError(c, http.StatusInternalServerError, "Failed to clear data in collection: "+err.Error())
// 			return
// 		}
// 		log.Printf("Data in collection %s cleared successfully", collectionName)
// 	}

// 	// Process CSV records in batches
// 	batchSize := 100
// 	if collectionName == "dataFmr" {
// 		batchSize = 50 // Smaller batch size for dataFmr
// 	}
// 	var batch []interface{}
// 	var totalInserted, csvTotalCount, duplicateCount int
// 	batchCounter := 0

// 	for {
// 		record, err := reader.Read()
// 		if err != nil {
// 			if err.Error() == "EOF" {
// 				break
// 			}
// 			respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV data: "+err.Error())
// 			return
// 		}

// 		csvTotalCount++

// 		// Process record
// 		row := make(map[string]interface{})
// 		for i, value := range record {
// 			row[csvHeaders[i]] = TrimSpacesAndRemoveChar160(value)
// 		}
// 		row["month"] = month
// 		uniqueKey := GenerateUniqueKey(row)
// 		if collectionName == "dataFmr" {
// 			uniqueKey = generateDataFmrUniqueKey(record, csvHeaders)
// 		}
// 		if _, exists := seenRecords[uniqueKey]; exists {
// 			duplicateCount++
// 			log.Printf("Duplicate detected in collection %s, row %d: %s", collectionName, csvTotalCount+1, uniqueKey)
// 			continue
// 		}
// 		seenRecords[uniqueKey] = struct{}{}
// 		batch = append(batch, row)

// 		// Process batch
// 		if len(batch) >= batchSize {
// 			startTime := time.Now()
// 			if err := processBatch(ctx, collection, collectionName, batch, &totalInserted); err != nil {
// 				log.Printf("Batch processing failed for collection %s after %v: %v", collectionName, time.Since(startTime), err)
// 				insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, duplicateCount, username, month)
// 				respondWithJSONError(c, http.StatusInternalServerError, "Failed to process batch: "+err.Error())
// 				return
// 			}
// 			log.Printf("Processed batch %d of %d records for collection %s in %v", batchCounter+1, len(batch), collectionName, time.Since(startTime))
// 			runtime.ReadMemStats(&memStats)
// 			log.Printf("Memory after batch %d - Alloc: %v, TotalAlloc: %v, Sys: %v", batchCounter+1, memStats.Alloc, memStats.TotalAlloc, memStats.Sys)
// 			batch = nil
// 			batchCounter++
// 			if batchCounter%10 == 0 {
// 				runtime.GC() // Force GC every 10 batches
// 			}
// 		}
// 	}

// 	// Process remaining records
// 	if len(batch) > 0 {
// 		startTime := time.Now()
// 		if err := processBatch(ctx, collection, collectionName, batch, &totalInserted); err != nil {
// 			log.Printf("Final batch processing failed for collection %s after %v: %v", collectionName, time.Since(startTime), err)
// 			insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, duplicateCount, username, month)
// 			respondWithJSONError(c, http.StatusInternalServerError, "Failed to process final batch: "+err.Error())
// 			return
// 		}
// 		log.Printf("Processed final batch of %d records in %v", len(batch), time.Since(startTime))
// 		runtime.ReadMemStats(&memStats)
// 		log.Printf("Memory after final batch - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)
// 	}

// 	// Fetch after count
// 	afterCount, err := collection.EstimatedDocumentCount(ctx)
// 	if err != nil {
// 		log.Printf("Failed to get after count for collection %s: %v", collectionName, err)
// 		respondWithJSONError(c, http.StatusInternalServerError, "Failed to get collection count: "+err.Error())
// 		return
// 	}

// 	// Insert log
// 	insertUploadLog(collectionName, csvTotalCount, totalInserted, "Success", "", beforeCount, afterCount, duplicateCount, username, month)

// 	// Log final memory usage
// 	runtime.ReadMemStats(&memStats)
// 	log.Printf("Final memory usage - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)

// 	// Success response
// 	log.Printf("Successfully inserted %d records into collection %s", totalInserted, collectionName)
// 	c.JSON(http.StatusOK, gin.H{
// 		"message":        "Data uploaded successfully",
// 		"recordsAdded":   totalInserted,
// 		"csvTotalCount":  csvTotalCount,
// 		"beforeCount":    beforeCount,
// 		"afterCount":     afterCount,
// 		"duplicateCount": duplicateCount,
// 	})
// }

// // generateDataFmrUniqueKey generates a unique key for dataFmr rows based on key fields
// func generateDataFmrUniqueKey(record []string, headers []string) string {
// 	var ticketNumber, stationNo, stationCode, paxName string
// 	for i, header := range headers {
// 		if header == "TicketNumber" {
// 			ticketNumber = TrimSpacesAndRemoveChar160(record[i])
// 		} else if header == "StationNo" {
// 			stationNo = TrimSpacesAndRemoveChar160(record[i])
// 		} else if header == "StationCode" {
// 			stationCode = TrimSpacesAndRemoveChar160(record[i])
// 		} else if header == "PaxName" {
// 			paxName = TrimSpacesAndRemoveChar160(record[i])
// 		}
// 	}
// 	return strings.Join([]string{ticketNumber, stationNo, stationCode, paxName}, "|")
// }

// func processBatch(ctx context.Context, collection *mongo.Collection, collectionName string, batch []interface{}, totalInserted *int) error {
// 	if len(batch) == 0 {
// 		return nil
// 	}

// 	if collectionName == "masterls_2" || collectionName == "mastermn_1" {
// 		res, err := collection.InsertMany(ctx, batch)
// 		if err != nil {
// 			return fmt.Errorf("failed to insert batch: %v", err)
// 		}
// 		*totalInserted += len(res.InsertedIDs)
// 		log.Printf("Inserted batch of %d records into collection %s", len(res.InsertedIDs), collectionName)
// 	} else if collectionName == "dataFpr" {
// 		var bulkOps []mongo.WriteModel
// 		for _, record := range batch {
// 			doc := record.(map[string]interface{})
// 			f := bson.M{
// 				"ticketnumber":  doc["ticketnumber"],
// 				"PartitionCode": doc["PartitionCode"],
// 				"city_code":     doc["city_code"],
// 				"Paxname":       doc["Paxname"],
// 				"routeawal":     doc["routeawal"],
// 				"routeakhir":    doc["routeakhir"],
// 				"dateofflight":  doc["dateofflight"],
// 				"airlines":      doc["airlines"],
// 				"Flightnumber":  doc["Flightnumber"],
// 				"airlinesTKT":   doc["airlinestkt"],
// 			}
// 			u := bson.M{"$set": doc}
// 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// 		}
// 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// 		if err != nil {
// 			return fmt.Errorf("failed to bulk write: %v", err)
// 		}
// 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// 	} else if collectionName == "masterTP_1" {
// 		var bulkOps []mongo.WriteModel
// 		for _, record := range batch {
// 			doc := record.(map[string]interface{})
// 			f := bson.M{
// 				"StationNo":   doc["StationNo"],
// 				"StationCode": doc["StationCode"],
// 				"AgentDie":    doc["AgentDie"],
// 				"Portal":      doc["Portal"],
// 				"PARTICY":     doc["PARTICY"],
// 				"DATA":        doc["DATA"],
// 			}
// 			u := bson.M{"$set": doc}
// 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// 		}
// 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// 		if err != nil {
// 			return fmt.Errorf("failed to bulk write: %v", err)
// 		}
// 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// 	} else if collectionName == "dataFmr" {
// 		var bulkOps []mongo.WriteModel
// 		for _, record := range batch {
// 			doc := record.(map[string]interface{})

// 			// Convert TicketNumber to int64
// 			ticketNumberStr, ok := doc["TicketNumber"].(string)
// 			if !ok {
// 				return fmt.Errorf("TicketNumber is not a string: %v", doc["TicketNumber"])
// 			}

// 			// Convert to int64 (pre-validation ensures it's 13 digits)
// 			ticketNumber, err := strconv.ParseInt(ticketNumberStr, 10, 64)
// 			if err != nil {
// 				return fmt.Errorf("failed to parse TicketNumber '%s': %v", ticketNumberStr, err)
// 			}

// 			// Update doc with converted TicketNumber
// 			doc["TicketNumber"] = ticketNumber

// 			f := bson.M{
// 				"StationNo":    doc["StationNo"],
// 				"StationCode":  doc["StationCode"],
// 				"StationCurr":  doc["StationCurr"],
// 				"TicketNumber": ticketNumber,
// 				"PaxName":      doc["PaxName"],
// 				"PNRR":         doc["PNRR"],
// 				"AgentDie":     doc["AgentDie"],
// 				"TourCode":     doc["TourCode"],
// 				"FOP":          doc["FOP"],
// 			}
// 			u := bson.M{"$set": doc}
// 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// 		}
// 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// 		if err != nil {
// 			return fmt.Errorf("failed to bulk write: %v", err)
// 		}
// 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// 	} else {
// 		var bulkOps []mongo.WriteModel
// 		for _, record := range batch {
// 			doc := record.(map[string]interface{})
// 			uniqueKeyField := getUniqueKeyField(collectionName)
// 			f := bson.M{uniqueKeyField: doc[uniqueKeyField]}
// 			u := bson.M{"$set": doc}
// 			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
// 		}
// 		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
// 		if err != nil {
// 			return fmt.Errorf("failed to bulk write: %v", err)
// 		}
// 		*totalInserted += int(res.UpsertedCount) + int(res.ModifiedCount)
// 		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
// 	}
// 	return nil
// }

// func getUniqueKeyField(collectionName string) string {
// 	switch collectionName {
// 	case "masteric_2":
// 		return "STT No"
// 	case "mastertbs_4":
// 		return "Kode"
// 	case "masterrg_6":
// 		return "Productroute"
// 	case "masterdl_9":
// 		return "STT No"
// 	default:
// 		return "_id"
// 	}
// }

// func GenerateUniqueKeyForMasterrt(record map[string]interface{}) string {
// 	rute := fmt.Sprintf("%v", record["Rute"])
// 	truckRate := fmt.Sprintf("%v", record["Truck Rate"])
// 	return fmt.Sprintf("%s|%s", rute, truckRate)
// }

// func insertUploadLog(collectionName string, csvTotalCount, recordCount int, status, errorMessage string, beforeCount, afterCount int64, duplicateCount int, username string, month string) {
// 	logCollection := db.GetCollection("update_logs")
// 	logEntry := models.UploadLog{
// 		CollectionName: collectionName,
// 		CSVTotalCount:  csvTotalCount,
// 		RecordCount:    recordCount,
// 		UploadedAt:     time.Now(),
// 		Status:         status,
// 		ErrorMessage:   errorMessage,
// 		DataBefore:     beforeCount,
// 		DataAfter:      afterCount,
// 		DuplicateCount: duplicateCount,
// 		UploadedBy:     username,
// 		Month:          month,
// 	}
// 	if _, err := logCollection.InsertOne(context.Background(), logEntry); err != nil {
// 		log.Printf("Failed to insert upload log for collection %s: %v", collectionName, err)
// 	}
// }

//	func respondWithJSONError(c *gin.Context, statusCode int, message string) {
//		c.JSON(statusCode, gin.H{
//			"error":   message,
//			"message": message,
//		})
//	}
package handlers

import (
	"backend/db"
	"backend/models"
	"context"
	"encoding/csv"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"runtime"
	"strconv"
	"strings"
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

	// Initialize seenRecords for duplicate detection
	var seenRecords map[string]struct{}
	var ticketNumberIndex int
	var csvTotalCount, duplicateCount int

	if collectionName == "dataFmr" || collectionName == "dataFpr" {
		ticketNumberRegex := regexp.MustCompile(`^[0-9]{12,13}$`) // Updated to allow 12 or 13 digits
		seenRecords = make(map[string]struct{}, 1000)             // For entire CSV
		rowNum := 1                                               // Header is row 1, data starts at row 2

		// Find ticketnumber index
		ticketHeader := "TicketNumber"
		if collectionName == "dataFpr" {
			ticketHeader = "ticketnumber"
		}
		for i, header := range csvHeaders {
			if header == ticketHeader {
				ticketNumberIndex = i
				break
			}
		}

		// Pre-validate ticketnumber and count duplicates
		file.Seek(0, 0)
		reader = csv.NewReader(file)
		_, err := reader.Read() // Skip headers
		if err != nil {
			respondWithJSONError(c, http.StatusBadRequest, "Failed to re-read CSV headers: "+err.Error())
			return
		}

		for {
			record, err := reader.Read()
			if err != nil {
				if err.Error() == "EOF" {
					break
				}
				respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV data: "+err.Error())
				return
			}
			rowNum++
			csvTotalCount++

			// Validate ticketnumber
			ticketNumber := TrimSpacesAndRemoveChar160(record[ticketNumberIndex])
			if !ticketNumberRegex.MatchString(ticketNumber) {
				errMsg := fmt.Sprintf("Upload failed: %s '%s' in row %d is not is not 12 or 13 digits", ticketHeader, ticketNumber, rowNum)
				log.Printf("Validation failed for collection %s: %s", collectionName, errMsg)
				respondWithJSONError(c, http.StatusBadRequest, errMsg)
				return
			}

			// Count duplicates
			var uniqueKey string
			if collectionName == "dataFmr" {
				uniqueKey = generateDataFmrUniqueKey(record, csvHeaders)
			} else {
				uniqueKey = generateDataFprUniqueKey(record, csvHeaders)
			}
			if _, exists := seenRecords[uniqueKey]; exists {
				duplicateCount++
				log.Printf("Duplicate detected duplicate detected in %s: row %d: %s", collectionName, rowNum, uniqueKey)
			}
			seenRecords[uniqueKey] = struct{}{}
		}

		// Reset file pointer for batch processing
		file.Seek(0, 0)
		reader = csv.NewReader(file)
		_, err = reader.Read() // Skip headers again
		if err != nil {
			respondWithJSONError(c, http.StatusBadRequest, "Failed to reset CSV: "+err.Error())
			return
		}
	} else {
		seenRecords = make(map[string]struct{}, 100)
	}

	// Create context with timeout
	timeoutDuration := 30 * time.Minute
	if collectionName == "dataFmr" || collectionName == "dataFpr" {
		timeoutDuration = 45 * time.Minute
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
			log.Printf("Failed to clear data in %s: %v", collectionName, err)
			respondWithJSONError(c, http.StatusInternalServerError, "Failed to clear data: "+err.Error())
			return
		}
		log.Printf("Collection %s cleared successfully", collectionName)
	}

	// Process CSV records
	batchSize := 100
	if collectionName == "dataFmr" || collectionName == "dataFpr" {
		batchSize = 50
	}
	var batch []interface{}
	var totalInserted int64
	batchCounter := 0

	for {
		record, err := reader.Read()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			respondWithJSONError(c, http.StatusBadRequest, "Failed to read CSV data: "+err.Error())
			return
		}

		if collectionName != "dataFmr" && collectionName != "dataFpr" {
			csvTotalCount++
			// Use a proper row map for GenerateUniqueKey
			row := make(map[string]interface{})
			for i, value := range record {
				row[csvHeaders[i]] = TrimSpacesAndRemoveChar160(value)
			}
			uniqueKey := GenerateUniqueKey(row)
			if _, exists := seenRecords[uniqueKey]; exists {
				duplicateCount++
				log.Printf("Duplicate detected in collection %s, row %d: %s", collectionName, csvTotalCount+1, uniqueKey)
			}
			seenRecords[uniqueKey] = struct{}{}
		}

		// Process record
		row := make(map[string]interface{})
		for i, value := range record {
			row[csvHeaders[i]] = TrimSpacesAndRemoveChar160(value)
		}
		row["month"] = month
		batch = append(batch, row)

		// Process batch
		if len(batch) >= batchSize {
			startTime := time.Now()
			if err := processBatch(ctx, collection, collectionName, batch, &totalInserted); err != nil {
				log.Printf("Batch processing failed for %s after %v: %v", collectionName, time.Since(startTime), err)
				insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, duplicateCount, username, month)
				respondWithJSONError(c, http.StatusInternalServerError, "Failed to process batch: "+err.Error())
				return
			}
			log.Printf("Processed batch %d of %d records for %s in %v", batchCounter+1, len(batch), collectionName, time.Since(startTime))
			runtime.ReadMemStats(&memStats)
			log.Printf("Memory after batch %d - Alloc: %v, TotalAlloc: %v, Sys: %v", batchCounter+1, memStats.Alloc, memStats.TotalAlloc, memStats.Sys)
			batch = nil
			if collectionName != "dataFmr" && collectionName != "dataFpr" {
				seenRecords = make(map[string]struct{}, batchSize)
			}
			batchCounter++
			if batchCounter%10 == 0 {
				runtime.GC()
			}
		}
	}

	// Process remaining records
	if len(batch) > 0 {
		startTime := time.Now()
		if err := processBatch(ctx, collection, collectionName, batch, &totalInserted); err != nil {
			log.Printf("Final batch processing failed for %s after %v: %v", collectionName, time.Since(startTime), err)
			insertUploadLog(collectionName, csvTotalCount, totalInserted, "Failed", err.Error(), beforeCount, -1, duplicateCount, username, month)
			respondWithJSONError(c, http.StatusInternalServerError, "Failed to process final batch: "+err.Error())
			return
		}
		log.Printf("Processed final batch of %d records in %v", len(batch), time.Since(startTime))
		runtime.ReadMemStats(&memStats)
		log.Printf("Memory after final batch - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)
	}

	// Fetch after count
	afterCount, err := collection.EstimatedDocumentCount(ctx)
	if err != nil {
		log.Printf("Failed to get after count for %s: %v", collectionName, err)
		respondWithJSONError(c, http.StatusInternalServerError, "Failed to get collection count: "+err.Error())
		return
	}

	// Insert log
	insertUploadLog(collectionName, csvTotalCount, totalInserted, "Success", "", beforeCount, afterCount, duplicateCount, username, month)

	// Log final memory usage
	runtime.ReadMemStats(&memStats)
	log.Printf("Final memory usage - Alloc: %v, TotalAlloc: %v, Sys: %v", memStats.Alloc, memStats.TotalAlloc, memStats.Sys)

	// Success response
	log.Printf("Successfully processed %d records for %s", totalInserted, collectionName)
	c.JSON(http.StatusOK, gin.H{
		"message":        "Data uploaded successfully",
		"csvTotalCount":  csvTotalCount,
		"recordsAdded":   totalInserted,
		"beforeCount":    beforeCount,
		"afterCount":     afterCount,
		"duplicateCount": duplicateCount,
	})
}

func generateDataFmrUniqueKey(record []string, headers []string) string {
	var stationNo, stationCode, stationCurr, ticketNumber, paxName, pnrr, agentDie, tourCode, fop string

	for i, header := range headers {
		switch header {
		case "StationNo":
			stationNo = TrimSpacesAndRemoveChar160(record[i])
		case "StationCode":
			stationCode = TrimSpacesAndRemoveChar160(record[i])
		case "StationCurr":
			stationCurr = TrimSpacesAndRemoveChar160(record[i])
		case "TicketNumber":
			ticketNumber = TrimSpacesAndRemoveChar160(record[i])
		case "PaxName":
			paxName = TrimSpacesAndRemoveChar160(record[i])
		case "PNRR":
			pnrr = TrimSpacesAndRemoveChar160(record[i])
		case "AgentDie":
			agentDie = TrimSpacesAndRemoveChar160(record[i])
		case "TourCode":
			tourCode = TrimSpacesAndRemoveChar160(record[i])
		case "FOP":
			fop = TrimSpacesAndRemoveChar160(record[i])
		}
	}

	return strings.Join([]string{
		stationNo,
		stationCode,
		stationCurr,
		ticketNumber,
		paxName,
		pnrr,
		agentDie,
		tourCode,
		fop,
	}, "|")
}

func generateDataFprUniqueKey(record []string, headers []string) string {
	var ticketNumber, partitionCode, cityCode, paxName string
	var routeAwal, routeAkhir, dateOfFlight, airlines, flightNumber, airlinesTkt, flownDate string

	for i, header := range headers {
		switch header {
		case "ticketnumber":
			ticketNumber = TrimSpacesAndRemoveChar160(record[i])
		case "PartitionCode":
			partitionCode = TrimSpacesAndRemoveChar160(record[i])
		case "city_code":
			cityCode = TrimSpacesAndRemoveChar160(record[i])
		case "Paxname":
			paxName = TrimSpacesAndRemoveChar160(record[i])
		case "routeawal":
			routeAwal = TrimSpacesAndRemoveChar160(record[i])
		case "routeakhir":
			routeAkhir = TrimSpacesAndRemoveChar160(record[i])
		case "dateofflight":
			dateOfFlight = TrimSpacesAndRemoveChar160(record[i])
		case "airlines":
			airlines = TrimSpacesAndRemoveChar160(record[i])
		case "Flightnumber":
			flightNumber = TrimSpacesAndRemoveChar160(record[i])
		case "AirlinesTKT":
			airlinesTkt = TrimSpacesAndRemoveChar160(record[i])
		case "flowndate":
			flownDate = TrimSpacesAndRemoveChar160(record[i])
		}
	}

	return strings.Join([]string{
		ticketNumber,
		partitionCode,
		cityCode,
		paxName,
		routeAwal,
		routeAkhir,
		dateOfFlight,
		airlines,
		flightNumber,
		airlinesTkt,
		flownDate,
	}, "|")
}

func processBatch(ctx context.Context, collection *mongo.Collection, collectionName string, batch []interface{}, totalInserted *int64) error {
	if len(batch) == 0 {
		return nil
	}

	if collectionName == "masterls_2" || collectionName == "mastermn_1" {
		res, err := collection.InsertMany(ctx, batch)
		if err != nil {
			return fmt.Errorf("failed to insert batch: %v", err)
		}
		*totalInserted += int64(len(res.InsertedIDs))
		log.Printf("Inserted batch of %d records into %s", len(res.InsertedIDs), collectionName)
	} else if collectionName == "dataFpr" {
		var bulkOps []mongo.WriteModel
		for _, record := range batch {
			doc := record.(map[string]interface{})

			// Convert ticketnumber to int64
			ticketNumberStr, ok := doc["ticketnumber"].(string)
			if !ok {
				return fmt.Errorf("ticketnumber is not a string: %v", doc["ticketnumber"])
			}
			ticketNumber, err := strconv.ParseInt(ticketNumberStr, 10, 64)
			if err != nil {
				return fmt.Errorf("failed to parse ticketnumber '%s': %v", ticketNumberStr, err)
			}
			doc["ticketnumber"] = ticketNumber

			f := bson.M{
				"ticketnumber":  ticketNumber,
				"PartitionCode": doc["PartitionCode"],
				"city_code":     doc["city_code"],
				"Paxname":       doc["Paxname"],
				"routeawal":     doc["routeawal"],
				"routeakhir":    doc["routeakhir"],
				"dateofflight":  doc["dateofflight"],
				"airlines":      doc["airlines"],
				"Flightnumber":  doc["Flightnumber"],
				"airlinestkt":   doc["airlinestkt"],
				"flowndate":     doc["flowndate"],
			}
			u := bson.M{"$set": doc}
			bulkOps = append(bulkOps, mongo.NewUpdateOneModel().SetFilter(f).SetUpdate(u).SetUpsert(true))
		}
		res, err := collection.BulkWrite(ctx, bulkOps, options.BulkWrite().SetOrdered(false))
		if err != nil {
			return fmt.Errorf("failed to bulk write: %v", err)
		}
		*totalInserted += res.UpsertedCount + res.ModifiedCount
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
		*totalInserted += res.UpsertedCount + res.ModifiedCount
		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
	} else if collectionName == "dataFmr" {
		var bulkOps []mongo.WriteModel
		for _, record := range batch {
			doc := record.(map[string]interface{})

			// Convert TicketNumber to int64
			ticketNumberStr, ok := doc["TicketNumber"].(string)
			if !ok {
				return fmt.Errorf("TicketNumber is not a string: %v", doc["TicketNumber"])
			}

			// Convert to int64
			ticketNumber, err := strconv.ParseInt(ticketNumberStr, 10, 64)
			if err != nil {
				return fmt.Errorf("failed to parse TicketNumber '%s': %v", ticketNumberStr, err)
			}

			// Update doc with converted TicketNumber
			doc["TicketNumber"] = ticketNumber

			f := bson.M{
				"StationNo":    doc["StationNo"],
				"StationCode":  doc["StationCode"],
				"StationCurr":  doc["StationCurr"],
				"TicketNumber": ticketNumber,
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
		*totalInserted += res.UpsertedCount + res.ModifiedCount
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
		*totalInserted += res.UpsertedCount + res.ModifiedCount
		log.Printf("Bulk write result - Matched: %d, Modified: %d, Upserted: %d in %s", res.MatchedCount, res.ModifiedCount, res.UpsertedCount, collectionName)
	}
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

func insertUploadLog(collectionName string, csvTotalCount int, recordCount int64, status string, errorMessage string, beforeCount, afterCount int64, duplicateCount int, username, month string) {
	logCollection := db.GetCollection("update_logs")
	logEntry := models.UploadLog{
		CollectionName: collectionName,
		CSVTotalCount:  csvTotalCount,
		RecordCount:    int(recordCount),
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
		log.Printf("Failed to insert upload log for %s: %v", collectionName, err)
	}
}

func respondWithJSONError(c *gin.Context, statusCode int, message string) {
	log.Printf("Error occurred: %s", message)
	c.JSON(statusCode, gin.H{
		"error":   message,
		"message": message,
	})
}
