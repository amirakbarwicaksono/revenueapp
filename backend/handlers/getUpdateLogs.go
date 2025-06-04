package handlers

import (
	"backend/db"
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetUpdateLogs retrieves the latest update logs for all specified collections
func GetUpdateLogs(c *gin.Context) {
	collectionNames := []string{
		"datakof",
		"datakif",
		"datasof",
		"datasif",
		"datapof",
		"datafro",
		"datafrd",
		"datadef",
		"datatfs", // Skip for now
		"datatft", // Skip for now
		"datakpf", // Skip for now
		"datakdf", // Skip for now
		"mastermn_1",
		"masteric_2",
		"masterls_3",
		"mastertbs_4",
		"mastertbs_41",
		"mastertbs_42",
		"mastertbs_43",
		"mastertbs_44",
		"mastertbs_45",
		"mastertbs_46",
		"mastertbs_47",
		"mastertbs_48",
		"mastertbs_49",
		"mastertbs_50",
		"mastertbs_51",
		"masterbc_5",
		"masterrg_6",
		"masterrf_7",
		"masterrt_8",
		"masterdl_9",
		"mastermt_10",
	}

	var updateLogs []struct {
		Collection  string `json:"collection"`
		LastUpdated string `json:"lastUpdated"`
		RecordCount int    `json:"recordCount"`
		Status      string `json:"status"`
	}

	// Get the update_logs collection
	updateLogsCollection := db.GetCollection("update_logs")

	for _, name := range collectionNames {
		// Find the latest log for the given collection
		var logEntry struct {
			CollectionName string    `bson:"collection_name"`
			UploadedAt     time.Time `bson:"uploaded_at"`
			RecordCount    int       `bson:"record_count"`
			Status         string    `bson:"status"`
		}

		err := updateLogsCollection.
			FindOne(context.Background(), bson.M{"collection_name": name}, options.FindOne().SetSort(bson.D{{Key: "uploaded_at", Value: -1}})).
			Decode(&logEntry)

		if err != nil {
			if err == mongo.ErrNoDocuments {
				// If no documents found, append an empty log entry
				updateLogs = append(updateLogs, struct {
					Collection  string `json:"collection"`
					LastUpdated string `json:"lastUpdated"`
					RecordCount int    `json:"recordCount"`
					Status      string `json:"status"`
				}{name, "No updates", 0, "No Data"})
			} else {
				log.Printf("Failed to retrieve log for collection %s: %v", name, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve update logs"})
				return
			}
		} else {
			updateLogs = append(updateLogs, struct {
				Collection  string `json:"collection"`
				LastUpdated string `json:"lastUpdated"`
				RecordCount int    `json:"recordCount"`
				Status      string `json:"status"`
			}{
				Collection:  logEntry.CollectionName,
				LastUpdated: logEntry.UploadedAt.Format(time.RFC3339),
				RecordCount: logEntry.RecordCount,
				Status:      logEntry.Status,
			})
		}
	}

	// Send the update logs as JSON response
	c.JSON(http.StatusOK, updateLogs)
}
