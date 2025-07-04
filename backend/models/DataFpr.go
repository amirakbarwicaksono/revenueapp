// package models

// import "time"

// // Ticket represents an airline ticket record in the MongoDB tickets collection.
// type DataFpr struct {
// 	// ID                    primitive.ObjectID `bson:"_id,omitempty"` // MongoDB document ID
// 	YearFlown            string    `bson:"YearFlown"`            // Year the flight was flown (e.g., "2025")
// 	MonthFlown           string    `bson:"MonthFlown"`           // Month the flight was flown (e.g., "March")
// 	PartitionCode        string    `bson:"PartitionCode"`        // Partition code (e.g., "OD")
// 	StationOpenDate      time.Time `bson:"StationOpenDate"`      // Date station opened (DD-MMM-YY, e.g., "14-Feb-25")
// 	StationNo            string    `bson:"StationNo"`            // Station number (e.g., "91200071")
// 	CountryName          string    `bson:"CountryName"`          // Country name (e.g., "MALAYSIA")
// 	CityCode             string    `bson:"CityCode"`             // City code (e.g., "KUL")
// 	SalesCurrency        string    `bson:"SalesCurrency"`        // Currency of sale (e.g., "MYR")
// 	TicketNumber         string    `bson:"TicketNumber"`         // Ticket number (e.g., "8162129596913")
// 	PNRR                 string    `bson:"PNR"`                  // Passenger Name Record (e.g., "NDTOUK")
// 	PaxName              string    `bson:"PaxName"`              // Passenger name (e.g., "LEE/PAN SENG MR")
// 	IssuedDate           time.Time `bson:"IssuedtDate"`          // Date ticket was issued (DD-MMM-YY, e.g., "14-Feb-25")
// 	RefundTicket         string    `bson:"RefundTicket"`         // Refund ticket number (if applicable)
// 	ExchTicket           string    `bson:"ExchTicker"`           // Exchange ticket number (if applicable)
// 	PreconjTicket        string    `bson:"PreconjTicket"`        // Preconjunction ticket number (if applicable)
// 	TransCode            string    `bson:"Transcode"`            // Transaction code (e.g., "SALE", "EXCH")
// 	DocType              string    `bson:"DocType"`              // Document type (e.g., "TKT")
// 	AgentDie             string    `bson:"AgentDie"`             // Agent code (e.g., "KULGVZ")
// 	StationCode          string    `bson:"StationCode"`          // Station code (e.g., "KULWB")
// 	Channel              string    `bson:"Channel"`              // Sales channel (e.g., "WEB")
// 	AgencyName           string    `bson:"AgencyName"`           // Agency name (e.g., "FLIGHTROUTES24 TRAVEL COMPANY LIMITED")
// 	TourCode             string    `bson:"TourCode"`             // Tour code (e.g., "ITMYKUL007566")
// 	FlightNumber         string    `bson:"FlightNumber"`         // Flight number (e.g., "805")
// 	FC                   string    `bson:"FC"`                   // Flight class or segment number (e.g., "1")
// 	RouteAwal            string    `bson:"RouteAwal"`            // Departure airport code (e.g., "KUL")
// 	RouteAkhir           string    `bson:"RouteAkhir"`           // Arrival airport code (e.g., "SIN")
// 	DateOfFlight         time.Time `bson:"DateOfFlight"`         // Flight date (DD-MMM-YY, e.g., "23-Mar-25")
// 	FareUpdate           float64   `bson:"FareUpdate"`           // Ticket fare (e.g., 142.00)
// 	QSFare               float64   `bson:"QSFare"`               // Additional fare/surcharge (e.g., 0.00)
// 	Descr                string    `bson:"Descr"`                // Fare calculation description (e.g., "KUL OD SIN31.52NUC31.52END ROE4.50483")
// 	StatusTicket         string    `bson:"StatusTicket"`         // Ticket status (e.g., "USED")
// 	StatusFlight         string    `bson:"StatusFlight"`         // Flight status (e.g., "FLOWN")
// 	Airlines             string    `bson:"Airlines"`             // Airline code (e.g., "OD")
// 	FlownDate            time.Time `bson:"FlownDate"`            // Date flown (DD-MMM-YY, e.g., "23-Mar-25")
// 	AirlinesTKT          string    `bson:"AirlinesTKT"`          // Airline ticket code (e.g., "OD")
// 	OriginalTransCode    string    `bson:"OriginalTransCode"`    // Original transaction code (e.g., "SALE")
// 	OriginalTicketNumber string    `bson:"OriginalTicketNumber"` // Original ticket number (e.g., "8.16213E+12")
// 	OriginalCurr         string    `bson:"OriginalCurr"`         // Original currency (e.g., "USD")
// 	OriginalFareUpdate   float64   `bson:"OriginalFareUpdate"`   // Original fare (e.g., 191.00)
// 	OriginalIssuedDate   time.Time `bson:"OriginalIssuedDate"`   // Original issue date (DD-MMM-YY, e.g., "18-Nov-24")
// 	AgentDieOrigin       string    `bson:"AgentDieOrigin"`       // Original agent code (e.g., "HDQDCS")
// 	StationNoOrigin      string    `bson:"StationNoOrigin"`      // Original station number (e.g., "71000053")
// 	TourCodeOrigin       string    `bson:"TourCodeOrigin"`       // Original tour code (e.g., "ITMYKUL007520")
// }

package models

import "time"

// Ticket represents an airline ticket record in the MongoDB tickets collection.
type DataFpr struct {
	// ID                   primitive.ObjectID `bson:"_id,omitempty"`        // MongoDB document ID
	YearFlown            string    `bson:"YearFlown"`            // Year the flight was flown (e.g., "2025")
	MonthFlown           string    `bson:"MonthFlown"`           // Month the flight was flown (e.g., "March")
	PartitionCode        string    `bson:"PartitionCode"`        // Partition code (e.g., "OD")
	StationOpenDate      time.Time `bson:"stationopendate"`      // Date station opened (DD-MMM-YY, e.g., "14-Feb-25")
	StationNo            int64     `bson:"stationno"`            // Station number (e.g., "91200071")
	CountryName          string    `bson:"countryname"`          // Country name (e.g., "MALAYSIA")
	CityCode             string    `bson:"city_code"`            // City code (e.g., "KUL")
	SalesCurrency        string    `bson:"SalesCurrency"`        // Currency of sale (e.g., "MYR")
	TicketNumber         int64     `bson:"ticketnumber"`         // Ticket number (e.g., "8162129596913")
	PNRR                 string    `bson:"PNRR"`                 // Passenger Name Record (e.g., "NDTOUK")
	PaxName              string    `bson:"Paxname"`              // Passenger name (e.g., "LEE/PAN SENG MR")
	IssuedDate           time.Time `bson:"Issueddate"`           // Date ticket was issued (DD-MMM-YY, e.g., "14-Feb-25")
	RefundTicket         string    `bson:"RefundTicket"`         // Refund ticket number (if applicable)
	ExchTicket           string    `bson:"Exchticket"`           // Exchange ticket number (if applicable)
	PreconjTicket        string    `bson:"PreconjTicket"`        // Preconjunction ticket number (if applicable)
	TransCode            string    `bson:"transcode"`            // Transaction code (e.g., "SALE", "EXCH")
	DocType              string    `bson:"doctype"`              // Document type (e.g., "TKT")
	AgentDie             string    `bson:"Agentdie"`             // Agent code (e.g., "KULGVZ")
	StationCode          string    `bson:"Stationcode"`          // Station code (e.g., "KULWB")
	Channel              string    `bson:"Channel"`              // Sales channel (e.g., "WEB")
	AgencyName           string    `bson:"AgencyName"`           // Agency name (e.g., "FLIGHTROUTES24 TRAVEL COMPANY LIMITED")
	TourCode             string    `bson:"tourcode"`             // Tour code (e.g., "ITMYKUL007566")
	FlightNumber         string    `bson:"Flightnumber"`         // Flight number (e.g., "805")
	FC                   string    `bson:"fc"`                   // Flight class or segment number (e.g., "1")
	RouteAwal            string    `bson:"routeawal"`            // Departure airport code (e.g., "KUL")
	RouteAkhir           string    `bson:"routeakhir"`           // Arrival airport code (e.g., "SIN")
	DateOfFlight         time.Time `bson:"dateofflight"`         // Flight date (DD-MMM-YY, e.g., "23-Mar-25")
	FareUpdate           float64   `bson:"fareupdate"`           // Ticket fare (e.g., 142.00)
	QSFare               float64   `bson:"QSfare"`               // Additional fare/surcharge (e.g., 0.00)
	Descr                string    `bson:"descr"`                // Fare calculation description (e.g., "KUL OD SIN31.52NUC31.52END ROE4.50483")
	StatusTicket         string    `bson:"StatusTicket"`         // Ticket status (e.g., "USED")
	StatusFlight         string    `bson:"StatusFlight"`         // Flight status (e.g., "FLOWN")
	Airlines             string    `bson:"airlines"`             // Airline code (e.g., "OD")
	FlownDate            time.Time `bson:"flowndate"`            // Date flown (DD-MMM-YY, e.g., "23-Mar-25")
	AirlinesTKT          string    `bson:"AirlinesTKT"`          // Airline ticket code (e.g., "OD")
	OriginalTransCode    string    `bson:"OriginalTranscode"`    // Original transaction code (e.g., "SALE")
	OriginalTicketNumber int64     `bson:"OriginalTicketnumber"` // Original ticket number (e.g., "8.16213E+12")
	OriginalCurr         string    `bson:"OriginalCurr"`         // Original currency (e.g., "USD")
	OriginalFareUpdate   float64   `bson:"OriginalFareUpdate"`   // Original fare (e.g., 191.00)
	OriginalIssuedDate   time.Time `bson:"OriginalIssueddate"`   // Original issue date (DD-MMM-YY, e.g., "18-Nov-24")
	AgentDieOrigin       string    `bson:"AgentDieOrigin"`       // Original agent code (e.g., "HDQDCS")
	StationNoOrigin      int64     `bson:"StationnoOrigin"`      // Original station number (e.g., "71000053")
	TourCodeOrigin       string    `bson:"Tourcodeorigin"`       // Original tour code (e.g., "ITMYKUL007520")
}
