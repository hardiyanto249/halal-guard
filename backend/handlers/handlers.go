package handlers

import (
	"log"
	"net/http"

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

	// Save transactions to database
	for _, tx := range req.Transactions {
		if err := services.SaveTransaction(tx); err != nil {
			log.Printf("Warning: Failed to save transaction %s: %v", tx.ID, err)
		}
	}

	// Analyze transactions using Gemini AI
	results, err := h.geminiService.AnalyzeTransactions(req.Transactions)
	if err != nil {
		log.Printf("Analysis failed: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Analysis failed",
			Message: err.Error(),
		})
		return
	}

	// Save analysis results to database
	for _, result := range results {
		if err := services.SaveAnalysisResult(result); err != nil {
			log.Printf("Warning: Failed to save analysis result for %s: %v", result.TransactionID, err)
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
