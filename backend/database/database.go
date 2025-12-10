package database

import (
	"database/sql"
	"fmt"
	"log"

	"halalguard-backend/config"

	_ "github.com/lib/pq"
)

var DB *sql.DB

// Connect establishes connection to PostgreSQL database
func Connect(cfg *config.Config) error {
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.SSLMode,
	)

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("error opening database: %w", err)
	}

	// Test connection
	if err = DB.Ping(); err != nil {
		return fmt.Errorf("error connecting to database: %w", err)
	}

	log.Println("✅ Connected to PostgreSQL database")

	// Create tables if they don't exist
	if err = createTables(); err != nil {
		return fmt.Errorf("error creating tables: %w", err)
	}

	return nil
}

// createTables creates necessary database tables
func createTables() error {
	schema := `
	CREATE TABLE IF NOT EXISTS transactions (
		id VARCHAR(255) PRIMARY KEY,
		description TEXT NOT NULL,
		amount DECIMAL(15, 2) NOT NULL,
		date VARCHAR(50) NOT NULL,
		type VARCHAR(50) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS analysis_results (
		id SERIAL PRIMARY KEY,
		transaction_id VARCHAR(255) REFERENCES transactions(id) ON DELETE CASCADE,
		status VARCHAR(50) NOT NULL,
		violation_type VARCHAR(50) NOT NULL,
		confidence_score DECIMAL(5, 2) NOT NULL,
		riba_score DECIMAL(5, 4) NOT NULL,
		gharar_score DECIMAL(5, 4) NOT NULL,
		maysir_score DECIMAL(5, 4) NOT NULL,
		halal_score DECIMAL(5, 4) NOT NULL,
		justice_score DECIMAL(5, 4) NOT NULL,
		maslahah_total_score DECIMAL(5, 2),
		maslahah_economic_justice DECIMAL(5, 2),
		maslahah_community_dev DECIMAL(5, 2),
		maslahah_educational DECIMAL(5, 2),
		maslahah_environmental DECIMAL(5, 2),
		maslahah_social_cohesion DECIMAL(5, 2),
		maslahah_projection TEXT,
		reasoning TEXT NOT NULL,
		suggested_correction TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(transaction_id)
	);

	CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
	CREATE INDEX IF NOT EXISTS idx_analysis_status ON analysis_results(status);
	CREATE INDEX IF NOT EXISTS idx_analysis_violation ON analysis_results(violation_type);
	`

	_, err := DB.Exec(schema)
	if err != nil {
		return err
	}

	log.Println("✅ Database tables created/verified")
	return nil
}

// Close closes the database connection
func Close() {
	if DB != nil {
		DB.Close()
		log.Println("Database connection closed")
	}
}
