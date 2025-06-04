package models

// Agent represents an agent record in the MongoDB collection (e.g., agentData or dataFpr).
type MasterTP_1 struct {
	// ID           primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	StationNo   string `bson:"StationNo" json:"StationNo"`
	StationCode string `bson:"StationCode" json:"StationCode"`
	AgentDie    string `bson:"AgentDie" json:"AgentDie"`
	Portal      string `bson:"Portal" json:"Portal"`
	PARTICY     string `bson:"PARTICY" json:"PARTICY"`
	DATA        string `bson:"DATA" json:"DATA"`
}
