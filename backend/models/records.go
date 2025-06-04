package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"` // MongoDB ObjectID
	Username   string             `bson:"username"`      // Username for login
	Password   string             `bson:"password"`      // Hashed password
	StaffName  string             `bson:"staffname"`     // Staff's full name
	StaffEmail string             `bson:"staffemail"`    // Staff's email
	Access     []string           `bson:"access"`        // List of access permissions
	Keyword    []string           `bson:"keyword"`       // Associated keywords
}
