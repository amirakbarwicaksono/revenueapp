package models

import (
	"time"
)

// UploadLog function
type CollectionAction struct {
	Name    string // Nama koleksi
	Replace bool   // Flag apakah memerlukan penggantian data
}

type UploadLog struct {
	CollectionName string    `bson:"collection_name"`
	CSVTotalCount  int       `bson:"csv_total_count"`
	RecordCount    int       `bson:"record_count"`
	UploadedAt     time.Time `bson:"uploaded_at"`
	Status         string    `bson:"status"`
	ErrorMessage   string    `bson:"error_message,omitempty"`
	UploadedBy     string    `bson:"uploaded_by"`
	DataBefore     int64     `bson:"data_before"`
	DataAfter      int64     `bson:"data_after"`
	DuplicateCount int       `bson:"duplicate_count"`
	Action         string    `bson:"action"` // Add this field to track the action
	Month          string    `bson:"month"`  // aktifkan ini nanti
}
