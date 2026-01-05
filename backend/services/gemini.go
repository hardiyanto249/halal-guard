package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"text/template"

	"halalguard-backend/config"
	"halalguard-backend/models"

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

	prompt := promptBuf.String()

	// Generate content
	resp, err := model.GenerateContent(s.ctx, genai.Text(prompt))
	if err != nil {
		return nil, fmt.Errorf("failed to generate content: %w", err)
	}

	// Extract text from response
	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from AI")
	}

	// Parse JSON response
	var results []models.AnalysisResult
	responseText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])

	// Clean up markdown code blocks if present (Gemini sometimes adds ```json ... ```)
	responseText = strings.TrimPrefix(responseText, "```json")
	responseText = strings.TrimPrefix(responseText, "```")
	responseText = strings.TrimSuffix(responseText, "```")
	responseText = strings.TrimSpace(responseText)

	if err := json.Unmarshal([]byte(responseText), &results); err != nil {
		log.Printf("Failed to parse AI response: %s", responseText)
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return results, nil
}

// Close closes the Gemini client
func (s *GeminiService) Close() {
	if s.client != nil {
		s.client.Close()
	}
}
