package handlers

import (
    "context"
    "log"
    "time"

    "backend/db"
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
)

func StopProcess(c *gin.Context) {
    requestID := c.GetString("requestID") // Assuming middleware sets requestID
    if requestID == "" {
        requestID = "unknown"
    }
    log.Printf("[%s] Attempting to stop running process", requestID)

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    processesCollection := db.GetCollection("processes")

    // Delete running process lock
    result, err := processesCollection.DeleteMany(ctx, bson.M{
        "status": "running",
        "type":   "lookup",
    })
    if err != nil {
        log.Printf("[%s] Failed to stop process: %v", requestID, err)
        c.JSON(500, gin.H{"message": "Failed to stop process"})
        return
    }

    if result.DeletedCount == 0 {
        log.Printf("[%s] No running process found to stop", requestID)
        c.JSON(404, gin.H{"message": "No running process found"})
        return
    }

    log.Printf("[%s] Successfully stopped %d running process(es)", requestID, result.DeletedCount)
    c.JSON(200, gin.H{"message": "Process stopped successfully"})
}