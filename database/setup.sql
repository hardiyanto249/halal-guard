-- HalalGuard AI Database Setup Script
-- Run this with: psql -U postgres -f database/setup.sql

-- Create database (if not exists)
SELECT 'CREATE DATABASE halalguard_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'halalguard_db')\gexec

-- Connect to the database
\c halalguard_db

-- Display connection info
SELECT current_database(), current_user, version();

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create analysis_results table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_analysis_status ON analysis_results(status);
CREATE INDEX IF NOT EXISTS idx_analysis_violation ON analysis_results(violation_type);
CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON analysis_results(created_at);

-- Create view for easy querying
CREATE OR REPLACE VIEW transaction_analysis_view AS
SELECT 
    t.id,
    t.description,
    t.amount,
    t.date,
    t.type,
    t.created_at as transaction_date,
    a.status,
    a.violation_type,
    a.confidence_score,
    a.riba_score,
    a.gharar_score,
    a.maysir_score,
    a.halal_score,
    a.justice_score,
    a.maslahah_total_score,
    a.reasoning,
    a.suggested_correction,
    a.created_at as analysis_date
FROM transactions t
LEFT JOIN analysis_results a ON t.id = a.transaction_id
ORDER BY t.created_at DESC;

-- Insert sample data (optional - for testing)
INSERT INTO transactions (id, description, amount, date, type) VALUES
    ('SAMPLE001', 'Investasi Saham Syariah', 10000000, '2024-01-15', 'Investment'),
    ('SAMPLE002', 'Pinjaman dengan Bunga 5%', 5000000, '2024-01-16', 'Loan'),
    ('SAMPLE003', 'Pembelian Obligasi Konvensional', 7500000, '2024-01-17', 'Investment')
ON CONFLICT (id) DO NOTHING;

-- Display table info
\dt

-- Display sample data
SELECT COUNT(*) as total_transactions FROM transactions;
SELECT COUNT(*) as total_analysis FROM analysis_results;

-- Success message
SELECT '✅ Database setup completed successfully!' as message;
SELECT '📊 Tables created: transactions, analysis_results' as info;
SELECT '🔍 View created: transaction_analysis_view' as info;
SELECT '📝 Sample data inserted: 3 transactions' as info;
