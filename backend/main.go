package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"halalguard-backend/config"
	"halalguard-backend/database"
	"halalguard-backend/handlers"
	"halalguard-backend/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Validate Gemini API Key
	if cfg.GeminiAPIKey == "" {
		log.Fatal("❌ GEMINI_API_KEY is required. Please set it in .env file")
	}

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Initialize Gemini service
	geminiService, err := services.NewGeminiService(cfg.GeminiAPIKey)
	if err != nil {
		log.Fatalf("❌ Failed to initialize Gemini service: %v", err)
	}
	defer geminiService.Close()

	// Initialize handlers
	handler := handlers.NewHandler(geminiService)

	// Setup Gin router
	router := gin.Default()

	// CORS configuration
	corsConfig := cors.Config{
		AllowOrigins:     []string{cfg.CORSOrigin, "http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}
	router.Use(cors.New(corsConfig))

	// API routes
	api := router.Group("/api")
	{
		api.GET("/health", handler.HealthCheck)
		api.POST("/analyze", handler.AnalyzeTransactions)
		api.GET("/transactions", handler.GetAllTransactions)
		api.GET("/transactions/:id", handler.GetTransactionByID)
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan
		log.Println("\n🛑 Shutting down server...")
		os.Exit(0)
	}()

	// Start server
	port := cfg.Port
	log.Printf("🚀 Server starting on port %s", port)
	log.Printf("📡 CORS enabled for: %s", cfg.CORSOrigin)
	log.Printf("🗄️  Database: %s@%s:%s/%s", cfg.Database.User, cfg.Database.Host, cfg.Database.Port, cfg.Database.DBName)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
