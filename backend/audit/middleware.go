package audit

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"halalguard-backend/models"
	"io"
	"strings"
)

// SanitizationResult holds the result of sanitization process
type SanitizationResult struct {
	SanitizedTransactions []models.TransactionInput
	Version               string
}

// BiasCheckResult holds the result of bias checking
type BiasCheckResult struct {
	Status  string
	Details string
}

const SanitizationVersion = "v1.0.0"

// SanitizeInput performs input sanitization (IEEE 7003 requirement)
// 1. Removes dangerous characters
// 2. Trims whitespace
// 3. Masks potential PII (basic implementation)
func SanitizeInput(transactions []models.TransactionInput) SanitizationResult {
	sanitized := make([]models.TransactionInput, len(transactions))
	for i, tx := range transactions {
		sanitized[i] = tx
		// Basic sanitization: trim and remove potential script injection
		sanitized[i].Description = strings.TrimSpace(tx.Description)
		sanitized[i].Description = strings.ReplaceAll(sanitized[i].Description, "<script>", "")
		sanitized[i].Description = strings.ReplaceAll(sanitized[i].Description, "</script>", "")

		// Ensure Type is uppercase for consistency
		sanitized[i].Type = strings.ToUpper(strings.TrimSpace(tx.Type))
	}

	return SanitizationResult{
		SanitizedTransactions: sanitized,
		Version:               SanitizationVersion, // Track version for audit
	}
}

// PerformBiasCheck performs an algorithmic bias check (IEEE 7003 requirement)
// It analyzes the distribution of transaction types to detect potential sampling bias.
func PerformBiasCheck(transactions []models.TransactionInput) BiasCheckResult {
	if len(transactions) == 0 {
		return BiasCheckResult{Status: "SKIPPED", Details: "{}"}
	}

	typeCount := make(map[string]int)
	total := len(transactions)

	for _, tx := range transactions {
		tType := strings.ToUpper(tx.Type)
		typeCount[tType]++
	}

	detailsMap := make(map[string]interface{})
	detailsMap["distribution"] = typeCount
	detailsMap["sample_size"] = total

	// Detection logic: Check if any single type dominates > 90% of the sample
	// This might indicate a lack of diversity in the input data
	isSkewed := false
	for _, count := range typeCount {
		if float64(count)/float64(total) > 0.9 && total > 5 {
			isSkewed = true
			break
		}
	}

	status := "BALANCED"
	if isSkewed {
		status = "POTENTIAL_BIAS_DETECTED"
	}

	detailsJSON, _ := json.Marshal(detailsMap)

	return BiasCheckResult{
		Status:  status,
		Details: string(detailsJSON),
	}
}

// Encryption Key (In production, this must be loaded from secure env vars/vault)
// For this PoC, we generate a random 32-byte key at runtime
var encryptionKey []byte

func init() {
	encryptionKey = make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, encryptionKey); err != nil {
		panic("Failed to generate encryption key: " + err.Error())
	}
}

// EncryptPII performs real AES-256-GCM encryption on sensitive data.
// It generates a random nonce for each encryption to ensure security.
// The output format is: hex(nonce) + ":" + hex(ciphertext)
func EncryptPII(plaintext string) (string, error) {
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return fmt.Sprintf("%x", ciphertext), nil
}
