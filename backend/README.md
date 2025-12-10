# HalalGuard AI - Backend

Backend API untuk HalalGuard AI menggunakan Golang, PostgreSQL, dan Google Gemini AI.

## Fitur

- ✅ REST API untuk analisis transaksi syariah
- ✅ Integrasi dengan Google Gemini AI
- ✅ Database PostgreSQL untuk penyimpanan data
- ✅ CORS support untuk frontend
- ✅ Analisis kepatuhan berdasarkan 5 Prinsip Ekonomi Islam
- ✅ Analisis Maslahah (dampak sosial ekonomi)

## Prasyarat

- Go 1.21 atau lebih tinggi
- PostgreSQL 12 atau lebih tinggi
- Google Gemini API Key

## Setup

### 1. Install Dependencies

```bash
cd backend
go mod download
```

### 2. Setup Database

Buat database PostgreSQL:

```sql
CREATE DATABASE halalguard_db;
```

### 3. Konfigurasi Environment

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan konfigurasi Anda:

```env
PORT=8080
GEMINI_API_KEY=your_actual_gemini_api_key_here
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=halalguard_db
DB_SSLMODE=disable
CORS_ORIGIN=http://localhost:5173
```

### 4. Jalankan Server

```bash
go run main.go
```

Server akan berjalan di `http://localhost:8080`

## API Endpoints

### Health Check
```
GET /api/health
```

### Analyze Transactions
```
POST /api/analyze
Content-Type: application/json

{
  "transactions": [
    {
      "id": "TXN001",
      "description": "Pembelian saham",
      "amount": 5000000,
      "date": "2024-01-15",
      "type": "Investment"
    }
  ]
}
```

### Get All Transactions
```
GET /api/transactions
```

### Get Transaction by ID
```
GET /api/transactions/:id
```

## Struktur Database

### Table: transactions
- `id` (VARCHAR, PRIMARY KEY)
- `description` (TEXT)
- `amount` (DECIMAL)
- `date` (VARCHAR)
- `type` (VARCHAR)
- `created_at` (TIMESTAMP)

### Table: analysis_results
- `id` (SERIAL, PRIMARY KEY)
- `transaction_id` (VARCHAR, FOREIGN KEY)
- `status` (VARCHAR)
- `violation_type` (VARCHAR)
- `confidence_score` (DECIMAL)
- `riba_score`, `gharar_score`, `maysir_score`, `halal_score`, `justice_score` (DECIMAL)
- `maslahah_*` fields untuk analisis dampak sosial
- `reasoning` (TEXT)
- `suggested_correction` (TEXT)
- `created_at` (TIMESTAMP)

## Build untuk Production

```bash
go build -o halalguard-backend main.go
```

Jalankan binary:

```bash
./halalguard-backend
```

## Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL sudah berjalan
- Periksa kredensial database di file `.env`
- Pastikan database sudah dibuat

### Gemini API Error
- Pastikan `GEMINI_API_KEY` sudah diset dengan benar
- Periksa koneksi internet
- Verifikasi API key masih valid

## License

MIT
