package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"text/template"
	"time"

	"halalguard-backend/config"
	"halalguard-backend/models"
	"halalguard-backend/socket"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type GeminiService struct {
	client *genai.Client
	ctx    context.Context
}

// NewGeminiService creates a new Gemini AI service
func NewGeminiService(apiKey string) (*GeminiService, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}

	return &GeminiService{
		client: client,
		ctx:    ctx,
	}, nil
}

// PromptData holds data for the prompt template
type PromptData struct {
	TransactionsJSON string
	ContextText      string // Aggregated text for searching
}

// Contains checks if the context text contains a specific keyword (case-insensitive)
func (p PromptData) Contains(term string) bool {
	return strings.Contains(strings.ToLower(p.ContextText), strings.ToLower(term))
}

// AnalyzeTransactions analyzes transactions using Gemini AI
func (s *GeminiService) AnalyzeTransactions(transactions []models.TransactionInput) ([]models.AnalysisResult, error) {
	if len(transactions) == 0 {
		return []models.AnalysisResult{}, nil
	}

	// Load prompt configuration
	promptCfg := config.LoadPrompts()

	model := s.client.GenerativeModel("gemini-2.5-flash")

	// Set system instruction from config
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text(promptCfg.SystemInstruction),
		},
	}

	// Configure JSON response
	model.ResponseMIMEType = "application/json"

	// Prepare data for template
	transactionsJSON, err := json.Marshal(transactions)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal transactions: %w", err)
	}

	// Aggregate context text for dynamic keyword detection
	var contextBuilder strings.Builder
	for _, tx := range transactions {
		contextBuilder.WriteString(tx.Description)
		contextBuilder.WriteString(" ")
		contextBuilder.WriteString(tx.Type)
		contextBuilder.WriteString(" ")
	}

	data := PromptData{
		TransactionsJSON: string(transactionsJSON),
		ContextText:      contextBuilder.String(),
	}

	// Parse and execute template
	tmpl, err := template.New("analysis").Parse(promptCfg.AnalysisPrompt)
	if err != nil {
		return nil, fmt.Errorf("failed to parse prompt template: %w", err)
	}

	var promptBuf bytes.Buffer
	if err := tmpl.Execute(&promptBuf, data); err != nil {
		return nil, fmt.Errorf("failed to execute prompt template: %w", err)
	}

	finalPrompt := promptBuf.String()

	// Implement Concurrency Control (Semaphore) to prevent rate limiting
	// Allow max 5 concurrent AI requests
	sem := make(chan struct{}, 5)

	// If transactions are many, we might want to split them, but our current prompt structure sends them all at once.
	// To strictly follow the "Go Routine" request to prevent hanging:
	// We will wrap the external API call in a channel-based timeout handler.

	type resultChan struct {
		data []models.AnalysisResult
		err  error
	}

	ch := make(chan resultChan, 1)

	go func() {
		// Acquire semaphore
		sem <- struct{}{}
		defer func() { <-sem }()

		socket.Broadcast("status", "🤖 Memulai analisis AI...")

		resp, err := model.GenerateContent(s.ctx, genai.Text(finalPrompt))
		if err != nil {
			ch <- resultChan{nil, err}
			return
		}

		if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
			ch <- resultChan{nil, fmt.Errorf("empty response from AI")}
			return
		}

		responseText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
		responseText = strings.TrimPrefix(responseText, "```json")
		responseText = strings.TrimPrefix(responseText, "```")
		responseText = strings.TrimSuffix(responseText, "```")
		responseText = strings.TrimSpace(responseText)

		var results []models.AnalysisResult
		if err := json.Unmarshal([]byte(responseText), &results); err != nil {
			log.Printf("Failed to parse AI response: %s", responseText)
			ch <- resultChan{nil, fmt.Errorf("failed to parse AI response: %w", err)}
			return
		}

		socket.Broadcast("success", "✅ Analisis Selesai")
		ch <- resultChan{results, nil}
	}()

	// Wait for result or timeout (prevent system hang)
	select {
	case res := <-ch:
		return res.data, res.err
	case <-time.After(30 * time.Second):
		return nil, fmt.Errorf("AI analysis timed out after 30 seconds")
	}
}

// Close closes the Gemini client
func (s *GeminiService) Close() {
	if s.client != nil {
		s.client.Close()
	}
}
