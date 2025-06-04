package routes

import (
	"backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func setupCORS(router *gin.Engine) {
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://192.168.198.209:3000", "https://your-frontend-domain.com"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Content-Type"}
	config.AllowCredentials = true

	router.Use(cors.New(config))
}

func RegisterRoutes(router *gin.Engine) {
	setupCORS(router)

	api := router.Group("/api")
	{
		api.POST("/login", handlers.Login)
		api.POST("/subpages", handlers.GetSubpages)
		api.GET("/dashboard-data", handlers.GetDashboardData) // New endpoint
		api.GET("/getUploadLogs", handlers.GetUploadLogs)
		api.GET("/getUpdateLogs", handlers.GetUpdateLogs)                 // Converted from http.HandleFunc
		api.POST("/uploadData", handlers.UploadData)                      // Converted from http.HandleFu
		api.POST("/saveDateRange", handlers.SaveDateRange)                // Converted from http.HandleFunc
		api.GET("/lookupAndSave", handlers.LookupAndSave)                 // Converted from http.HandleFunc
		api.GET("/lookupAndSave1", handlers.LookupAndSave1)               // Converted from http.HandleFunc
		api.GET("/exportCSV", handlers.ExportCSV)                         // Converted from http.HandleFunc
		api.GET("/exportCSV1", handlers.ExportCSV1)                       // Converted from http.HandleFunc
		api.GET("/fetchHeadersAndExport", handlers.FetchHeadersAndExport) // Converted from http.HandleFunc
		api.GET("/dashboardSummary", handlers.DashboardSummary)
		api.GET("/dashboardDetailed", handlers.DashboardDetailed)
		api.GET("/dashboardManagement", handlers.DashboardManagement) // Converted from http.HandleFunc
		api.POST("/stopProcess", handlers.StopProcess)                // Converted from http.HandleFunc
		api.POST("/stopExportProcess", handlers.StopExportProcess)    // Converted from http.HandleFunc
		api.GET("/getSSRData1", handlers.GetSSRData1)                 // Converted from http.HandleFunc
		api.GET("/getSSRFilterOptions", handlers.GetSSRFilterOptions) // Converted from http.HandleFunc
		api.GET("/exportFilteredCSV", handlers.ExportFilteredCSV)     // Converted from http.HandleFunc
	}
}
