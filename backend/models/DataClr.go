package models

import (
	"time"
)

type DataClr struct {
	ReferenceNo         string    `bson:"ReferenceNo" json:"reference_no"`
	OfficeName          string    `bson:"OfficeName" json:"office_name"`
	AgentName           string    `bson:"AgentName" json:"agent_name"`
	Type                string    `bson:"Type" json:"type"`
	Product             string    `bson:"Product" json:"product"`
	Commodity           string    `bson:"Commodity" json:"commodity"`
	ExchangeCurrency    string    `bson:"ExchangeCurrency" json:"exchange_currency"`
	ExchangeRate        float64   `bson:"ExchangeRate" json:"exchange_rate"`
	ChargeableWeight    float64   `bson:"ChargeableWeight" json:"chargeable_weight"`
	Remarks             string    `bson:"Remarks" json:"remarks"`
	TariffRate          float64   `bson:"TariffRate" json:"tariff_rate"`
	MaxCreditLimit      float64   `bson:"MaxCreditLimit" json:"max_credit_limit"`
	BalanceCreditLimit  float64   `bson:"BalanceCreditLimit" json:"balance_credit_limit"`
	DebitAmount         float64   `bson:" DebitAmount" json:"debit_amount"`
	CreditAmount        float64   `bson:" CreditAmount" json:"credit_amount"`
	PaymentCurrency     string    `bson:"PaymentCurrency" json:"payment_currency"`
	AWBStatus           string    `bson:"AWBStatus" json:"awb_status"`
	TransactionMode     string    `bson:"TransactionMode" json:"transaction_mode"`
	TransactionDate     time.Time `bson:"TransactionDate" json:"transaction_date"` // bisa diubah jadi time.Time
	PenaltyCharges      float64   `bson:"PenaltyCharges" json:"penalty_charges"`
	EventDetails        string    `bson:"EventDetails" json:"event_details"`
	RequestedBy         string    `bson:"RequestedBy" json:"requested_by"`
	RequestedOn         string    `bson:"RequestedOn" json:"requested_on"`
	UpdatedBy           string    `bson:"UpdatedBy" json:"updated_by"`
	BankName            string    `bson:"BankName" json:"bank_name"`
	InternalReferenceNo string    `bson:"InternalReferenceNo" json:"internal_reference_no"`
}
