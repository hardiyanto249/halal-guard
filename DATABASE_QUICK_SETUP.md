# 🚀 Quick Setup - HalalGuard AI Database

## ⚡ Cara Tercepat (3 Langkah)

### 1️⃣ Jalankan Setup Script
```bash
# Windows
setup-database.bat

# Pilih opsi 1 (Setup Otomatis)
# Masukkan password PostgreSQL Anda
```

### 2️⃣ Configure Backend
```bash
# Edit backend/.env
DB_PASSWORD=your_postgres_password
GEMINI_API_KEY=your_gemini_api_key
```

### 3️⃣ Done! ✅
Database siap digunakan dengan:
- ✅ Database: `halalguard_db`
- ✅ Tables: `transactions`, `analysis_results`
- ✅ Sample data: 3 transaksi test

---

## 🔍 Verifikasi Cepat

```bash
psql -U postgres -d halalguard_db -c "\dt"
```

Harus menampilkan:
```
 public | analysis_results | table | postgres
 public | transactions     | table | postgres
```

---

## 🆘 Troubleshooting Cepat

### Password salah?
```bash
# Reset password PostgreSQL
psql -U postgres
ALTER USER postgres PASSWORD 'newpassword';
```

### Service tidak jalan?
```bash
# Windows
net start postgresql-x64-15

# Atau cek services.msc
```

### Masih error?
Baca panduan lengkap: **DATABASE_SETUP.md**

---

## 📝 Manual Setup (Jika Script Gagal)

```bash
# 1. Buka psql
psql -U postgres

# 2. Buat database
CREATE DATABASE halalguard_db;
\c halalguard_db

# 3. Jalankan script
\i database/setup.sql

# 4. Verifikasi
\dt
SELECT * FROM transactions;
```

---

## ✅ Next Steps

Setelah database setup:

1. **Configure backend/.env**
   ```env
   DB_PASSWORD=your_password
   GEMINI_API_KEY=your_api_key
   ```

2. **Install dependencies**
   ```bash
   cd backend && go mod download
   cd frontend && npm install
   ```

3. **Start application**
   ```bash
   start-dev.bat
   ```

4. **Open browser**
   ```
   http://localhost:5173
   ```

---

**Need help?** Check **DATABASE_SETUP.md** for detailed guide!
