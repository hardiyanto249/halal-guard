package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

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

// AnalyzeTransactions analyzes transactions using Gemini AI
func (s *GeminiService) AnalyzeTransactions(transactions []models.TransactionInput) ([]models.AnalysisResult, error) {
	if len(transactions) == 0 {
		return []models.AnalysisResult{}, nil
	}

	model := s.client.GenerativeModel("gemini-2.5-flash")

	// Set system instruction
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text("Anda adalah sistem AI HalalGuard. Output harus JSON valid. Gunakan Bahasa Indonesia untuk reasoning dan correction."),
		},
	}

	// Configure JSON response
	model.ResponseMIMEType = "application/json"

	// Build prompt
	transactionsJSON, err := json.Marshal(transactions)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal transactions: %w", err)
	}

	prompt := fmt.Sprintf(`
Bertindaklah sebagai Auditor Kepatuhan Syariah DAN Analis Dampak Sosial Ekonomi Islam (Maslahah).

Tugas 1: COMPLIANCE SCORE (Kepatuhan Hukum)
Nilai berdasarkan 5 Prinsip (0.0 Buruk - 1.0 Baik):
1. Riba (30%%): Bebas bunga.
2. Gharar (25%%): Kejelasan akad.
3. Maysir (20%%): Bebas judi.
4. Halal Goods (15%%): Objek halal.
5. Justice/Keadilan (10%%): Kewajaran harga.

Tugas 2: MASLAHAH IMPACT SCORE (Dampak Sosial/Manfaat)
Nilai dampak sosial transaksi ini (0-100) berdasarkan dimensi berikut:
1. Keadilan Ekonomi (30%%): Distribusi kekayaan, pengentasan kemiskinan.
2. Pengembangan Komunitas (25%%): Lapangan kerja, infrastruktur lokal.
3. Dampak Pendidikan (20%%): Peningkatan skill, literasi.
4. Kelestarian Lingkungan (15%%): Green investment, keberlanjutan.
5. Kohesi Sosial (10%%): Kepercayaan komunitas, integrasi sosial.

Berikan proyeksi dampak jangka panjang singkat untuk aspek Maslahah.

PENTING: Response harus berupa array JSON dengan struktur berikut untuk setiap transaksi:
{
  "transactionId": "string",
  "status": "Patuh" | "Tidak Patuh" | "Butuh Tinjauan",
  "violationType": "Riba" | "Gharar" | "Maysir" | "Halal" | "Syubhat",
  "confidenceScore": number (0-100),
  "breakdown": {
    "ribaScore": number (0-1),
    "ghararScore": number (0-1),
    "maysirScore": number (0-1),
    "halalScore": number (0-1),
    "justiceScore": number (0-1)
  },
  "maslahahAnalysis": {
    "totalScore": number (0-100),
    "breakdown": {
      "economicJustice": number (0-100),
      "communityDevelopment": number (0-100),
      "educationalImpact": number (0-100),
      "environmental": number (0-100),
      "socialCohesion": number (0-100)
    },
    "longTermProjection": "string"
  },
  "reasoning": "string",
  "suggestedCorrection": "string (optional)"
}

Data Input:
%s
`, string(transactionsJSON))

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
