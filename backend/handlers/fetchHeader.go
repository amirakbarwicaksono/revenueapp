package handlers

import (
	"backend/models"
	"crypto/sha256"
	"encoding/csv"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"reflect"
	"strings"
	"unicode"

	"github.com/gin-gonic/gin"
)

// Map of collection names to corresponding structs for header validation
var collectionStructs = map[string]interface{}{
	"dataFpr": models.DataFpr{},
	"dataFmr": models.DataFmr{},
	"dataClr": models.DataClr{},
	"masterTP_1": models.MasterTP_1{},

}

// Map of collections requiring data removal before upload
var collectionsToClear = map[string]bool{
	"dataFpr": true,
	"dataFmr": true,
	"dataClr": true,
	"masterTP_1": true,
}

// TrimSpacesAndRemoveChar160 function to clean spaces and replace non-breaking spaces
func TrimSpacesAndRemoveChar160(input string) string {
	// Step 1: Trim leading and trailing spaces
	trimmed := strings.TrimSpace(input)

	// Step 2: Replace non-breaking spaces and non-printable characters
	return strings.Map(func(r rune) rune {
		if r == 160 || r == '\u00A0' || !unicode.IsPrint(r) || r == '�' { // Non-breaking space and non-printable
			return ' ' // Replace with a regular space
		}
		return r // Keep printable characters
	}, trimmed)
}

// Get the list of expected headers from struct tags
func getStructHeaders(structType interface{}) []string {
	v := reflect.TypeOf(structType)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}

	var headers []string
	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		tag := field.Tag.Get("bson")
		if tag != "" && tag != "-" {
			headers = append(headers, tag)
		}
	}
	return headers
}

// Validate CSV headers against the expected struct headers
func validateHeaders(csvHeaders, expectedHeaders []string) error {
	if len(csvHeaders) != len(expectedHeaders) {
		return fmt.Errorf("header count mismatch: expected %d, got %d", len(expectedHeaders), len(csvHeaders))
	}
	for i, csvHeader := range csvHeaders {
		if csvHeader != expectedHeaders[i] {
			return fmt.Errorf("header mismatch at column %d: expected '%s', got '%s'", i+1, expectedHeaders[i], csvHeader)
		}
	}
	return nil
}

// GenerateUniqueKey creates a unique key by hashing the concatenated record fields
func GenerateUniqueKey(record map[string]interface{}) string {
	hash := sha256.New()
	for key, value := range record {
		hash.Write([]byte(fmt.Sprintf("%s:%v;", key, value)))
	}
	return hex.EncodeToString(hash.Sum(nil))
}

// UploadHandler for handling CSV file uploads and processing them
func UploadHandler(c *gin.Context) {
	// Get uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "File not found"})
		return
	}

	// Open file
	src, err := file.Open()
	if err != nil {
		c.JSON(500, gin.H{"error": "Unable to open file"})
		return
	}
	defer src.Close()

	// Process the CSV
	// Your logic for parsing, validation, and processing goes here

	c.JSON(200, gin.H{"message": "File processed successfully"})
}

// FetchHeadersAndExport is the handler for exporting CSV headers as a guide for the LP team
func FetchHeadersAndExport(c *gin.Context) {
	collectionName := c.DefaultQuery("collection", "")
	if collectionName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Collection name is required"})
		return
	}

	// Validate the collection name and get the struct type
	structType, exists := collectionStructs[collectionName]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Unknown collection: %s", collectionName)})
		return
	}

	// Get headers from the struct
	headers := getStructHeaders(structType)
	if len(headers) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("No headers found for collection: %s", collectionName)})
		return
	}

	// Set response headers for CSV download
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", fmt.Sprintf("attachment;filename=%s_headers.csv", collectionName))

	// Create CSV writer
	csvWriter := csv.NewWriter(c.Writer)
	defer csvWriter.Flush()

	// Write headers to CSV
	if err := csvWriter.Write(headers); err != nil {
		log.Printf("Failed to write headers to CSV: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV file"})
		return
	}

	log.Printf("Headers exported for collection %s: %v", collectionName, headers)
}
