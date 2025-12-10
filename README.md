# HalalGuard AI

> Sistem analisis kepatuhan transaksi syariah menggunakan AI (Google Gemini) dengan arsitektur frontend-backend terpisah.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://golang.org/)
[![React Version](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791?logo=postgresql)](https://www.postgresql.org/)

---

## 📖 Dokumentasi

- **[QUICKSTART.md](QUICKSTART.md)** - Panduan cepat memulai (5 menit)
- **[API.md](API.md)** - Dokumentasi API lengkap
- **[STRUCTURE.md](STRUCTURE.md)** - Struktur project detail
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Panduan deployment production
- **[backend/README.md](backend/README.md)** - Dokumentasi backend
- **[frontend/README.md](frontend/README.md)** - Dokumentasi frontend

---

## ✨ Fitur Utama

### 🎯 Analisis Kepatuhan Syariah
Berdasarkan **5 Prinsip Ekonomi Islam**:
- ✅ **Riba** (30%) - Bebas bunga
- ✅ **Gharar** (25%) - Kejelasan akad
- ✅ **Maysir** (20%) - Bebas judi
- ✅ **Halal Goods** (15%) - Objek halal
- ✅ **Justice/Keadilan** (10%) - Kewajaran harga

### 🌍 Analisis Maslahah (Dampak Sosial)
- 🏛️ Keadilan Ekonomi (30%)
- 🏘️ Pengembangan Komunitas (25%)
- 📚 Dampak Pendidikan (20%)
- 🌱 Kelestarian Lingkungan (15%)
- 🤝 Kohesi Sosial (10%)

### 📊 Dashboard & Reporting
- Dashboard visual dengan grafik interaktif
- Laporan audit yang dapat dicetak (PDF)
- Monitoring sistem real-time
- Riwayat transaksi dan analisis lengkap

---

## 🏗️ Arsitektur

```
halalguard-ai-db/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Golang + Gin + PostgreSQL  
└── database/          # SQL schemas
```

### 🎨 Frontend Stack
- **Framework**: React 19 dengan TypeScript
- **Build Tool**: Vite 6
- **UI Components**: Custom components + Lucide React icons
- **Charts**: Recharts untuk visualisasi data
- **Styling**: Vanilla CSS dengan animasi modern

### ⚙️ Backend Stack
- **Language**: Golang 1.21+
- **Framework**: Gin (HTTP router)
- **Database**: PostgreSQL 12+
- **AI Integration**: Google Gemini AI (gemini-2.0-flash-exp)
- **Features**: REST API, CORS, Database persistence, Auto-migration

---

## 🚀 Quick Start

### Prasyarat
- ✅ Node.js 18+
- ✅ Go 1.21+
- ✅ PostgreSQL 12+
- ✅ Google Gemini API Key ([Get it here](https://ai.google.dev/))

### Setup Cepat (5 Menit)

### Prasyarat
- Node.js 18+
- Go 1.21+
- PostgreSQL 12+
- Google Gemini API Key

### 1. Setup Database

```bash
# Buat database
createdb halalguard_db

# Jalankan schema
psql -d halalguard_db -f database/schema.sql
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
go mod download

# Copy dan edit environment file
cp .env.example .env
# Edit .env dan isi GEMINI_API_KEY, DB_PASSWORD, dll

# Jalankan server
go run main.go
```

Backend akan berjalan di `http://localhost:8087`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 📋 Fitur Utama

### 1. Analisis Kepatuhan Syariah
Berdasarkan 5 Prinsip Ekonomi Islam:
- ✅ **Riba** (30%): Bebas bunga
- ✅ **Gharar** (25%): Kejelasan akad
- ✅ **Maysir** (20%): Bebas judi
- ✅ **Halal Goods** (15%): Objek halal
- ✅ **Justice/Keadilan** (10%): Kewajaran harga

### 2. Analisis Maslahah (Dampak Sosial)
- Keadilan Ekonomi (30%)
- Pengembangan Komunitas (25%)
- Dampak Pendidikan (20%)
- Kelestarian Lingkungan (15%)
- Kohesi Sosial (10%)

### 3. Dashboard & Reporting
- Dashboard visual dengan grafik
- Laporan audit yang dapat dicetak (PDF)
- Monitoring sistem real-time
- Riwayat transaksi dan analisis

## 🔌 API Endpoints

### Health Check
```http
GET /api/health
```

### Analyze Transactions
```http
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
```http
GET /api/transactions
```

### Get Transaction by ID
```http
GET /api/transactions/:id
```

## 🗄️ Database Schema

### Table: `transactions`
Menyimpan data transaksi input

### Table: `analysis_results`
Menyimpan hasil analisis AI untuk setiap transaksi

### View: `transaction_analysis_view`
View gabungan untuk query mudah

Lihat detail di `database/schema.sql`

## 🛠️ Development

### Backend Development
```bash
cd backend
go run main.go
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Build untuk Production

**Backend:**
```bash
cd backend
go build -o halalguard-backend main.go
```

**Frontend:**
```bash
cd frontend
npm run build
# Output di folder dist/
```

## 🔧 Konfigurasi

### Backend (.env)
```env
PORT=8087
GEMINI_API_KEY=your_gemini_api_key
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=halalguard_db
DB_SSLMODE=disable
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8087/api
```

## 📦 Dependencies

### Backend
- `gin-gonic/gin` - HTTP web framework
- `lib/pq` - PostgreSQL driver
- `google/generative-ai-go` - Gemini AI SDK
- `joho/godotenv` - Environment loader
- `gin-contrib/cors` - CORS middleware

### Frontend
- `react` & `react-dom` - UI framework
- `lucide-react` - Icons
- `recharts` - Charts
- `vite` - Build tool
- `typescript` - Type safety

## 🐛 Troubleshooting

### Backend tidak bisa connect ke database
- Pastikan PostgreSQL sudah berjalan
- Periksa kredensial di `.env`
- Pastikan database `halalguard_db` sudah dibuat

### Frontend tidak bisa connect ke backend
- Pastikan backend sudah berjalan di port 8087
- Periksa `VITE_API_URL` di frontend `.env`
- Periksa CORS settings di backend

### Gemini API Error
- Pastikan API key valid dan aktif
- Periksa koneksi internet
- Periksa quota API Gemini

## 📝 License

MIT License

## 👨‍💻 Author

HalalGuard AI Team

---

**Note**: Aplikasi ini adalah tools edukasi dan deteksi dini. Untuk kasus kompleks, konsultasikan dengan Dewan Pengawas Syariah yang bersertifikat.
