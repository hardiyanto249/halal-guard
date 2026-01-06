package models

import "time"

// TransactionInput represents input transaction data
type TransactionInput struct {
	ID          string  `json:"id" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
	Date        string  `json:"date" binding:"required"`
	Type        string  `json:"type" binding:"required"`
}

// Transaction represents a stored transaction
type Transaction struct {
	ID          string    `json:"id"`
	Description string    `json:"description"`
	Amount      float64   `json:"amount"`
	Date        string    `json:"date"`
	Type        string    `json:"type"`
	CreatedAt   time.Time `json:"createdAt"`
}

// ComplianceBreakdown represents detailed compliance scores
type ComplianceBreakdown struct {
	RibaScore    float64 `json:"ribaScore"`
	GhararScore  float64 `json:"ghararScore"`
	MaysirScore  float64 `json:"maysirScore"`
	HalalScore   float64 `json:"halalScore"`
	JusticeScore float64 `json:"justiceScore"`
}

// MaslahahBreakdown represents social impact breakdown
type MaslahahBreakdown struct {
	EconomicJustice      float64 `json:"economicJustice"`
	CommunityDevelopment float64 `json:"communityDevelopment"`
	EducationalImpact    float64 `json:"educationalImpact"`
	Environmental        float64 `json:"environmental"`
	SocialCohesion       float64 `json:"socialCohesion"`
}

// MaslahahAnalysis represents social impact analysis
type MaslahahAnalysis struct {
	TotalScore         float64           `json:"totalScore"`
	Breakdown          MaslahahBreakdown `json:"breakdown"`
	LongTermProjection string            `json:"longTermProjection"`
}

// AnalysisResult represents AI analysis result
type AnalysisResult struct {
	TransactionID       string              `json:"transactionId"`
	Status              string              `json:"status"`
	ViolationType       string              `json:"violationType"`
	ConfidenceScore     float64             `json:"confidenceScore"`
	Breakdown           ComplianceBreakdown `json:"breakdown"`
	MaslahahAnalysis    *MaslahahAnalysis   `json:"maslahahAnalysis,omitempty"`
	Reasoning           string              `json:"reasoning"`
	SuggestedCorrection string              `json:"suggestedCorrection,omitempty"`

	// Audit Fields (IEEE 7003)
	BiasCheckStatus         string `json:"biasCheckStatus"`
	BiasLog                 string `json:"biasLog"`
	DataSanitizationVersion string `json:"dataSanitizationVersion"`
}

// CombinedResult represents transaction with analysis
type CombinedResult struct {
	TransactionInput
	Analysis *AnalysisResult `json:"analysis,omitempty"`
}

// AnalyzeRequest represents the API request for analysis
type AnalyzeRequest struct {
	Transactions []TransactionInput `json:"transactions" binding:"required,min=1"`
}

// AnalyzeResponse represents the API response
type AnalyzeResponse struct {
	Results []AnalysisResult `json:"results"`
}

// ErrorResponse represents error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

// SystemMetrics represents aggregated system performance and audit data
type SystemMetrics struct {
	TotalAnalyzed            int            `json:"totalAnalyzed"`
	AverageConfidence        float64        `json:"averageConfidence"`
	BiasCheckStatus          map[string]int `json:"biasCheckStatus"`          // e.g. "BALANCED": 50, "BIASED": 2
	ComplianceStats          map[string]int `json:"complianceStats"`          // e.g. "COMPLIANT": 40, "NON_COMPLIANT": 10
	SanitizationVersionStats map[string]int `json:"sanitizationVersionStats"` // e.g. "v1.0.0": 100
}
