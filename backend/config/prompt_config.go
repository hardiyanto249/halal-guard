package config

import (
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

type PromptConfig struct {
	SystemInstruction string `yaml:"system_instruction"`
	AnalysisPrompt    string `yaml:"analysis_prompt"`
}

func LoadPrompts() *PromptConfig {
	// Locate prompts.yaml. It should be in the config directory or adjacent.
	// Since we run from backend root, it might be in config/prompts.yaml
	path := "config/prompts.yaml"

	// Fallback to absolute path if needed, or check multiple locations
	if _, err := os.Stat(path); os.IsNotExist(err) {
		// Try absolute path resolution related to executable or current working dir logic if complex
		// For now, assume running from backend root
		log.Printf("Warning: prompts.yaml not found at %s", path)
	}

	data, err := os.ReadFile(path)
	if err != nil {
		log.Fatalf("❌ Failed to read prompts.yaml: %v", err)
	}

	var config PromptConfig
	if err := yaml.Unmarshal(data, &config); err != nil {
		log.Fatalf("❌ Failed to parse prompts.yaml: %v", err)
	}

	return &config
}
