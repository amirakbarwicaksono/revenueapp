package db

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client

// ConnectDB connects to MongoDB and initializes MongoClient
func ConnectDB() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found. Using environment variables.")
	}

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		log.Fatal("MONGODB_URI is not set in environment variables.")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Ping MongoDB to confirm the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("MongoDB ping failed: %v", err)
	}

	log.Println("Successfully connected to MongoDB")
	MongoClient = client
}

// GetCollection provides a MongoDB collection reference
func GetCollection(collectionName string) *mongo.Collection {
	if MongoClient == nil {
		log.Fatal("MongoClient is not initialized. Ensure ConnectDB() is called before using GetCollection.")
	}
	dbName := os.Getenv("MONGODB_DATABASE")
	if dbName == "" {
		log.Fatal("MONGODB_DATABASE is not set in environment variables.")
	}
	return MongoClient.Database(dbName).Collection(collectionName)
}
