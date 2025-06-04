package handlers

import (
    "context"
    "encoding/json"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "backend/db"
)

// Added Rate Forward.

// Add this new struct
type DateRangeRequest struct {
    Collection string `json:"collection"`
    StartDate  string `json:"startDate"`
    EndDate    string `json:"endDate"`
    Username   string `json:"username"`
}

// Add this new handler
func SaveDateRange(c *gin.Context) {
    // Ensure the request method is POST
    if c.Request.Method != http.MethodPost {
        respondWithJSONError(c, http.StatusMethodNotAllowed, "Method not allowed")
        return
    }

    // Decode the JSON payload into the DateRangeRequest struct
    var req DateRangeRequest
    if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
        respondWithJSONError(c, http.StatusBadRequest, "Invalid request payload")
        return
    }

    // Parse start date
    startDate, err := time.Parse("2006-01-02", req.StartDate)
    if err != nil {
        respondWithJSONError(c, http.StatusBadRequest, "Invalid start date format")
        return
    }

    // Parse end date
    endDate, err := time.Parse("2006-01-02", req.EndDate)
    if err != nil {
        respondWithJSONError(c, http.StatusBadRequest, "Invalid end date format")
        return
    }

    // Save to date_ranges collection
    dateRangesCollection := db.GetCollection("date_ranges")
    _, err = dateRangesCollection.InsertOne(context.Background(), bson.M{
        "collection": req.Collection,
        "start_date": startDate.Format("02-Jan-06"), // Ensure correct format
        "end_date":   endDate.Format("02-Jan-06"),   // Ensure correct format
        "created_by": req.Username,
        "created_at": time.Now(),
    })

    if err != nil {
        respondWithJSONError(c, http.StatusInternalServerError, "Failed to save date range")
        return
    }

    // Success response
    c.JSON(http.StatusOK, gin.H{
        "message": "Date range saved successfully",
    })
}
