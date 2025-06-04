package handlers

import (
	"backend/db"
	"backend/models"
	"context"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Success bool     `json:"success"`
	Message string   `json:"message"`
	Access  []string `json:"access,omitempty"`
	Keyword []string `json:"keyword,omitempty"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	collection := db.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := collection.FindOne(ctx, map[string]string{"username": req.Username}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	response := LoginResponse{
		Success: true,
		Message: "Login successful",
		Access:  user.Access,
		Keyword: user.Keyword,
	}
	c.JSON(http.StatusOK, response)
}

func GetSubpages(c *gin.Context) {
	var userAccess []string
	if err := c.ShouldBindJSON(&userAccess); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	collection := db.GetCollection("applists")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := map[string]interface{}{
		"nick": map[string]interface{}{
			"$in": userAccess,
		},
	}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subpages"})
		return
	}
	defer cursor.Close(ctx)

	var subpages []map[string]interface{}
	if err := cursor.All(ctx, &subpages); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse subpages"})
		return
	}

	c.JSON(http.StatusOK, subpages)
}

// GetDashboardData returns dashboard data for charts and metrics
func GetDashboardData(c *gin.Context) {
	collection := db.GetCollection("dashboardData")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var dashboardData map[string]interface{}
	err := collection.FindOne(ctx, map[string]interface{}{}).Decode(&dashboardData)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dashboard data not found"})
		return
	}

	c.JSON(http.StatusOK, dashboardData)
}