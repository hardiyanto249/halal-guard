package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	GeminiAPIKey string
	Database     DatabaseConfig
	CORSOrigin   string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

func Load() *Config {
	// Load .env file based on APP_ENV
	env := getEnv("APP_ENV", "local")
	var envFile string
	if env == "production" {
		envFile = ".env.production"
	} else {
		envFile = ".env.local"
	}
	if err := godotenv.Load(envFile); err != nil {
		log.Printf("No %s file found, trying .env", envFile)
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, using environment variables")
		}
	}

	return &Config{
		Port:         getEnv("PORT", "8087"),
		GeminiAPIKey: getEnv("GEMINI_API_KEY", ""),
		CORSOrigin:   getEnv("CORS_ORIGIN", "http://localhost:5173"),
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "halalguard_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
