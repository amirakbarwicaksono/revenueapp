package handlers

import (
	"backend/db"
	"backend/models"
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// GetUploadLogs retrieves all upload logs from the update_logs collection
func GetUploadLogs(c *gin.Context) {
	collection := db.GetCollection("update_logs")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.D{})
	if err != nil {
		log.Printf("Failed to fetch upload logs: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch upload logs"})
		return
	}
	defer cursor.Close(ctx)

	var logs []models.UploadLog
	if err := cursor.All(ctx, &logs); err != nil {
		log.Printf("Failed to parse upload logs: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse upload logs"})
		return
	}

	c.JSON(http.StatusOK, logs)
}
