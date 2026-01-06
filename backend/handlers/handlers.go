package handlers

import (
	"log"
	"net/http"

	"halalguard-backend/audit"
	"halalguard-backend/models"
	"halalguard-backend/services"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	geminiService *services.GeminiService
}

// NewHandler creates a new handler
func NewHandler(geminiService *services.GeminiService) *Handler {
	return &Handler{
		geminiService: geminiService,
	}
}

// AnalyzeTransactions handles transaction analysis requests
func (h *Handler) AnalyzeTransactions(c *gin.Context) {
	var req models.AnalyzeRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// 1. Sanitize Input (IEEE 7003)
	sanitizedResult := audit.SanitizeInput(req.Transactions)
	transactions := sanitizedResult.SanitizedTransactions

	// 2. Perform Bias Check (IEEE 7003)
	biasResult := audit.PerformBiasCheck(transactions)

	// Save transactions to database
	for _, tx := range transactions {
		if err := services.SaveTransaction(tx); err != nil {
			log.Printf("Warning: Failed to save transaction %s: %v", tx.ID, err)
		}
	}

	// Analyze transactions using Gemini AI
	results, err := h.geminiService.AnalyzeTransactions(transactions)
	if err != nil {
		log.Printf("Analysis failed: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Analysis failed",
			Message: err.Error(),
		})
		return
	}

	// Save analysis results to database WITH AUDIT TRAIL
	for i := range results {
		// Enrich result with audit data
		results[i].BiasCheckStatus = biasResult.Status
		results[i].BiasLog = biasResult.Details
		results[i].DataSanitizationVersion = sanitizedResult.Version

		if err := services.SaveAnalysisResult(results[i]); err != nil {
			log.Printf("Warning: Failed to save analysis result for %s: %v", results[i].TransactionID, err)
		}
	}

	c.JSON(http.StatusOK, models.AnalyzeResponse{
		Results: results,
	})
}

// GetAllTransactions retrieves all transactions with analysis
func (h *Handler) GetAllTransactions(c *gin.Context) {
	results, err := services.GetAllTransactions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to retrieve transactions",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, results)
}

// GetTransactionByID retrieves a specific transaction
func (h *Handler) GetTransactionByID(c *gin.Context) {
	id := c.Param("id")

	result, err := services.GetTransactionByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "Transaction not found",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// HealthCheck handles health check requests
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "HalalGuard AI Backend",
		"version": "1.0.0",
	})
}

// GetSystemMetrics returns aggregated system metrics
func (h *Handler) GetSystemMetrics(c *gin.Context) {
	metrics, err := services.GetSystemMetrics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to get system metrics",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, metrics)
}
