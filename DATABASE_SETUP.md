# Setup Database PostgreSQL - HalalGuard AI

Panduan lengkap untuk setup database PostgreSQL untuk HalalGuard AI.

## 📋 Prasyarat

- ✅ PostgreSQL 12+ sudah terinstall (Anda punya versi 15.13)
- ✅ Tahu username PostgreSQL (biasanya `postgres`)
- ✅ Tahu password PostgreSQL

## 🚀 Metode Setup

### Metode 1: Menggunakan Script Otomatis (RECOMMENDED)

#### Windows:
```bash
setup-database.bat
```

#### Linux/Mac:
```bash
chmod +x setup-database.sh
./setup-database.sh
```

Script akan:
1. Meminta username PostgreSQL (default: postgres)
2. Meminta password
3. Membuat database `halalguard_db`
4. Membuat tables, indexes, dan views
5. Insert sample data untuk testing

---

### Metode 2: Manual dengan psql

#### Step 1: Buka psql
```bash
psql -U postgres
```
Masukkan password PostgreSQL Anda.

#### Step 2: Buat Database
```sql
CREATE DATABASE halalguard_db;
\c halalguard_db
```

#### Step 3: Jalankan Setup Script
```bash
# Keluar dari psql (ketik \q)
psql -U postgres -d halalguard_db -f database/setup.sql
```

---

### Metode 3: Manual Step-by-Step

#### 1. Buat Database
```bash
psql -U postgres
```

```sql
CREATE DATABASE halalguard_db;
\c halalguard_db
```

#### 2. Buat Tables
```sql
-- Transactions table
CREATE TABLE transactions (
    id VARCHAR(255) PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis results table
CREATE TABLE analysis_results (
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
```

#### 3. Buat Indexes
```sql
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_analysis_status ON analysis_results(status);
CREATE INDEX idx_analysis_violation ON analysis_results(violation_type);
CREATE INDEX idx_analysis_created_at ON analysis_results(created_at);
```

#### 4. Buat View
```sql
CREATE VIEW transaction_analysis_view AS
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
```

#### 5. Insert Sample Data (Optional)
```sql
INSERT INTO transactions (id, description, amount, date, type) VALUES
    ('SAMPLE001', 'Investasi Saham Syariah', 10000000, '2024-01-15', 'Investment'),
    ('SAMPLE002', 'Pinjaman dengan Bunga 5%', 5000000, '2024-01-16', 'Loan'),
    ('SAMPLE003', 'Pembelian Obligasi Konvensional', 7500000, '2024-01-17', 'Investment');
```

---

## ✅ Verifikasi Setup

Setelah setup, verifikasi dengan:

```bash
psql -U postgres -d halalguard_db
```

```sql
-- Cek tables
\dt

-- Cek data
SELECT * FROM transactions;

-- Cek view
SELECT * FROM transaction_analysis_view;

-- Cek jumlah data
SELECT COUNT(*) FROM transactions;
```

Output yang diharapkan:
```
                List of relations
 Schema |        Name        | Type  |  Owner   
--------+--------------------+-------+----------
 public | analysis_results   | table | postgres
 public | transactions       | table | postgres
```

---

## 🔧 Konfigurasi Backend

Setelah database setup, update file `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_actual_password_here
DB_NAME=halalguard_db
DB_SSLMODE=disable
```

---

## 🚨 Troubleshooting

### Error: "database already exists"
Database sudah dibuat sebelumnya. Anda bisa:
1. Gunakan database yang ada
2. Atau drop dan buat ulang:
```sql
DROP DATABASE halalguard_db;
CREATE DATABASE halalguard_db;
```

### Error: "password authentication failed"
- Pastikan password PostgreSQL benar
- Cek file `pg_hba.conf` untuk authentication method
- Coba reset password:
```bash
# Windows (sebagai admin)
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';

# Linux
sudo -u postgres psql
ALTER USER postgres PASSWORD 'new_password';
```

### Error: "could not connect to server"
PostgreSQL service tidak berjalan:

**Windows:**
```bash
# Cek status
sc query postgresql-x64-15

# Start service
net start postgresql-x64-15
```

**Linux:**
```bash
# Cek status
sudo systemctl status postgresql

# Start service
sudo systemctl start postgresql
```

### Error: "permission denied"
Jalankan command sebagai administrator/sudo.

---

## 📊 Database Schema Diagram

```
┌─────────────────────────┐
│     transactions        │
├─────────────────────────┤
│ id (PK)                 │
│ description             │
│ amount                  │
│ date                    │
│ type                    │
│ created_at              │
└───────────┬─────────────┘
            │
            │ 1:1
            │
┌───────────┴─────────────┐
│   analysis_results      │
├─────────────────────────┤
│ id (PK)                 │
│ transaction_id (FK)     │
│ status                  │
│ violation_type          │
│ confidence_score        │
│ riba_score              │
│ gharar_score            │
│ maysir_score            │
│ halal_score             │
│ justice_score           │
│ maslahah_* (6 fields)   │
│ reasoning               │
│ suggested_correction    │
│ created_at              │
└─────────────────────────┘
```

---

## 🎯 Next Steps

Setelah database setup berhasil:

1. ✅ **Configure backend/.env** dengan credentials database
2. ✅ **Install backend dependencies**: `cd backend && go mod download`
3. ✅ **Install frontend dependencies**: `cd frontend && npm install`
4. ✅ **Start servers**: Jalankan `start-dev.bat` atau manual
5. ✅ **Test aplikasi**: Buka http://localhost:5173

---

## 📝 Quick Commands Reference

```bash
# Connect to database
psql -U postgres -d halalguard_db

# List databases
\l

# List tables
\dt

# Describe table
\d transactions

# View data
SELECT * FROM transactions;

# Count records
SELECT COUNT(*) FROM transactions;

# Exit psql
\q

# Backup database
pg_dump -U postgres halalguard_db > backup.sql

# Restore database
psql -U postgres -d halalguard_db < backup.sql
```

---

**Catatan**: Ganti `postgres` dengan username PostgreSQL Anda jika berbeda.
