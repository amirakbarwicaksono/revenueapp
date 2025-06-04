package models

type Mastermn_1 struct {
	//ID                      primitive.ObjectID `bson:"_id,omitempty"`
	MitraCodeGenesis        string `bson:"Mitra Code Genesis"`
	NamaMitra               string `bson:"Nama Mitra"`
	MitraNamaWthConcatinate string `bson:"Mitra Nama Wth Concatinate"`
	Kategori                string `bson:"Kategori"`
	ThreeLC                 string `bson:"3LC"` // Using `ThreeLC` for readability in Golang
	City                    string `bson:"City"`
}
