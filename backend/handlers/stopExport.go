package handlers

import (
	"context"
	"log"
	"time"

	"backend/db"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

func StopExportProcess(c *gin.Context) {
	requestID := c.GetString("requestID")
	if requestID == "" {
		requestID = uuid.New().String()
	}
	log.Printf("[%s] Attempting to stop running export process", requestID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	processesCollection := db.GetCollection("processes")

	result, err := processesCollection.DeleteMany(ctx, bson.M{
		"status": "running",
		"type":   "export",
	})
	if err != nil {
		log.Printf("[%s] Failed to stop export process: %v", requestID, err)
		c.JSON(500, gin.H{"message": "Failed to stop export process"})
		return
	}

	if result.DeletedCount == 0 {
		log.Printf("[%s] No running export process found to stop", requestID)
		c.JSON(404, gin.H{"message": "No running export process found"})
		return
	}

	log.Printf("[%s] Successfully stopped %d running export process(es)", requestID, result.DeletedCount)
	c.JSON(200, gin.H{"message": "Export process stopped successfully"})
}
