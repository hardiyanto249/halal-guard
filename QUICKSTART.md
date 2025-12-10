# Quick Start Guide - HalalGuard AI

Panduan cepat untuk memulai development HalalGuard AI.

## ⚡ Super Quick Start (5 Menit)

### 1️⃣ Clone & Setup
```bash
cd d:\Users\Yan\project\halalguard-ai-db

# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh start-dev.sh
./setup.sh
```

### 2️⃣ Configure Environment

**Backend** (`backend/.env`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
DB_PASSWORD=your_postgres_password
```

### 3️⃣ Setup Database
```bash
# Buat database
createdb halalguard_db

# Import schema
psql -d halalguard_db -f database/schema.sql
```

### 4️⃣ Start Development
```bash
# Windows
start-dev.bat

# Linux/Mac
./start-dev.sh
```

**Done!** 🎉
- Backend: http://localhost:8087
- Frontend: http://localhost:5173

---

## 📝 Common Commands

### Backend
```bash
cd backend

# Install dependencies
go mod download

# Run server
go run main.go

# Build binary
go build -o halalguard-backend main.go

# Run binary
./halalguard-backend
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database
```bash
# Connect to database
psql -d halalguard_db

# Backup database
pg_dump halalguard_db > backup.sql

# Restore database
psql -d halalguard_db < backup.sql

# View tables
psql -d halalguard_db -c "\dt"
```

---

## 🧪 Testing API

### Using cURL
```bash
# Health check
curl http://localhost:8087/api/health

# Analyze transaction
curl -X POST http://localhost:8087/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [{
      "id": "TEST001",
      "description": "Test transaction",
      "amount": 1000000,
      "date": "2024-01-15",
      "type": "Investment"
    }]
  }'

# Get all transactions
curl http://localhost:8087/api/transactions
```

### Using Browser
1. Open http://localhost:5173
2. Click "Analisis" menu
3. Add transaction
4. Click "Analisis Sekarang"
5. View results

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 8087 is in use
netstat -ano | findstr :8087  # Windows
lsof -i :8087                 # Linux/Mac

# Check .env file exists
cat backend/.env

# Check database connection
psql -d halalguard_db
```

### Frontend won't start
```bash
# Clear node_modules
rm -rf frontend/node_modules
npm install

# Check if port 5173 is in use
netstat -ano | findstr :5173  # Windows
lsof -i :5173                 # Linux/Mac
```

### Database error
```bash
# Check PostgreSQL is running
# Windows
sc query postgresql

# Linux/Mac
sudo systemctl status postgresql

# Recreate database
dropdb halalguard_db
createdb halalguard_db
psql -d halalguard_db -f database/schema.sql
```

### CORS error
- Check `CORS_ORIGIN` in `backend/.env`
- Should match frontend URL: `http://localhost:5173`

---

## 📚 Documentation

- **README.md** - Project overview
- **API.md** - API documentation
- **STRUCTURE.md** - Project structure
- **DEPLOYMENT.md** - Production deployment
- **backend/README.md** - Backend specific
- **frontend/README.md** - Frontend specific

---

## 🎯 Development Tips

### Hot Reload
- **Backend**: Manual restart needed (or use `air` for hot reload)
- **Frontend**: Auto-reload enabled by Vite

### Debugging
- **Backend**: Add `log.Println()` statements
- **Frontend**: Use browser DevTools console
- **Database**: Check logs in `psql` or pgAdmin

### Code Style
- **Backend**: Follow Go conventions (`gofmt`)
- **Frontend**: Use TypeScript strict mode
- **Database**: Use snake_case for columns

---

## 🚀 Next Steps

1. ✅ Setup complete
2. 📖 Read API.md for endpoint details
3. 🎨 Customize frontend components
4. 🔧 Add new features
5. 🚢 Deploy to production (see DEPLOYMENT.md)

---

## 💡 Useful Links

- [Go Documentation](https://golang.org/doc/)
- [Gin Framework](https://gin-gonic.com/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Google Gemini AI](https://ai.google.dev/)

---

## 🆘 Need Help?

1. Check documentation files
2. Review error messages carefully
3. Check logs (backend & database)
4. Verify environment variables
5. Ensure all services are running

---

**Happy Coding! 🎉**
