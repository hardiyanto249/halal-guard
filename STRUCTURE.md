# Project Structure - HalalGuard AI

```
halalguard-ai-db/
│
├── backend/                      # Backend Golang
│   ├── config/
│   │   └── config.go            # Configuration loader
│   ├── database/
│   │   └── database.go          # PostgreSQL connection & schema
│   ├── handlers/
│   │   └── handlers.go          # HTTP request handlers
│   ├── models/
│   │   └── models.go            # Data models & types
│   ├── services/
│   │   ├── gemini.go            # Gemini AI service
│   │   └── database.go          # Database operations
│   ├── .env.example             # Environment template
│   ├── .gitignore               # Git ignore for backend
│   ├── go.mod                   # Go dependencies
│   ├── main.go                  # Application entry point
│   └── README.md                # Backend documentation
│
├── frontend/                     # Frontend React
│   ├── components/
│   │   ├── Header.tsx           # Navigation header
│   │   ├── TransactionInput.tsx # Transaction input form
│   │   ├── AnalysisDashboard.tsx# Dashboard with charts
│   │   ├── TransactionList.tsx  # Transaction list view
│   │   └── SystemMonitor.tsx    # System monitoring
│   ├── services/
│   │   └── geminiService.ts     # API service (calls backend)
│   ├── App.tsx                  # Main application component
│   ├── index.tsx                # React entry point
│   ├── types.ts                 # TypeScript type definitions
│   ├── index.html               # HTML template
│   ├── vite.config.ts           # Vite configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── package.json             # Node dependencies
│   ├── .env                     # Environment variables
│   ├── .gitignore               # Git ignore for frontend
│   └── README.md                # Frontend documentation
│
├── database/
│   └── schema.sql               # PostgreSQL database schema
│
├── .gitignore                   # Root git ignore
├── README.md                    # Main project documentation
├── API.md                       # API documentation
├── DEPLOYMENT.md                # Deployment guide
├── setup.bat                    # Windows setup script
├── setup.sh                     # Linux/Mac setup script
├── start-dev.bat                # Windows dev server starter
└── start-dev.sh                 # Linux/Mac dev server starter
```

## Component Descriptions

### Backend Components

#### `config/config.go`
- Loads environment variables
- Provides configuration struct
- Handles default values

#### `database/database.go`
- PostgreSQL connection management
- Auto-creates tables on startup
- Provides database instance

#### `handlers/handlers.go`
- HTTP request handlers
- Request validation
- Response formatting
- Error handling

#### `models/models.go`
- Data structures
- Request/Response models
- Database models
- Type definitions

#### `services/gemini.go`
- Google Gemini AI integration
- Transaction analysis logic
- Prompt engineering
- JSON response parsing

#### `services/database.go`
- Database CRUD operations
- Transaction persistence
- Analysis result storage
- Query helpers

#### `main.go`
- Application initialization
- Router setup
- Middleware configuration
- Server startup

### Frontend Components

#### `components/Header.tsx`
- Navigation menu
- View switching
- Branding

#### `components/TransactionInput.tsx`
- Transaction input form
- Validation
- Submit handling
- Dynamic fields

#### `components/AnalysisDashboard.tsx`
- Compliance charts
- Statistics cards
- Visual indicators
- Recharts integration

#### `components/TransactionList.tsx`
- Transaction table
- Analysis results display
- Color-coded status
- Detailed breakdown

#### `components/SystemMonitor.tsx`
- System status
- Performance metrics
- Health indicators

#### `services/geminiService.ts`
- Backend API calls
- HTTP client
- Error handling
- Response parsing

#### `App.tsx`
- Main application logic
- State management
- View routing
- Loading states

### Database Schema

#### `transactions` table
- Stores transaction inputs
- Primary key: `id`
- Indexed by date and type

#### `analysis_results` table
- Stores AI analysis results
- Foreign key to transactions
- Indexed by status and violation type
- One-to-one with transactions

#### `transaction_analysis_view`
- Joined view for easy querying
- Combines transactions + analysis
- Ordered by creation date

## Data Flow

```
User Input (Frontend)
    ↓
TransactionInput Component
    ↓
geminiService.ts (API call)
    ↓
Backend API (/api/analyze)
    ↓
handlers.AnalyzeTransactions
    ↓
services.SaveTransaction (PostgreSQL)
    ↓
services.GeminiService.AnalyzeTransactions (AI)
    ↓
services.SaveAnalysisResult (PostgreSQL)
    ↓
Response to Frontend
    ↓
Update UI with Results
```

## Technology Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: Gin
- **Database**: PostgreSQL
- **AI**: Google Gemini AI
- **Libraries**:
  - `gin-gonic/gin` - HTTP framework
  - `lib/pq` - PostgreSQL driver
  - `google/generative-ai-go` - Gemini SDK
  - `joho/godotenv` - Env loader
  - `gin-contrib/cors` - CORS middleware

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Libraries**:
  - `react` & `react-dom` - UI framework
  - `lucide-react` - Icons
  - `recharts` - Charts
- **Styling**: Vanilla CSS

### Database
- **RDBMS**: PostgreSQL 12+
- **Schema**: Relational with foreign keys
- **Indexes**: Optimized for common queries

## Port Configuration

- **Backend**: 8087 (configurable via `.env`)
- **Frontend Dev**: 5173 (Vite default)
- **Database**: 5432 (PostgreSQL default)

## Environment Variables

### Backend
```
PORT=8087
GEMINI_API_KEY=<your-key>
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<password>
DB_NAME=halalguard_db
DB_SSLMODE=disable
CORS_ORIGIN=http://localhost:5173
```

### Frontend
```
VITE_API_URL=http://localhost:8087/api
```

## Build Outputs

### Backend
- Binary: `halalguard-backend` (or `.exe` on Windows)
- Location: `backend/`

### Frontend
- Static files: HTML, CSS, JS
- Location: `frontend/dist/`

## Development Workflow

1. **Setup**: Run `setup.bat` (Windows) or `setup.sh` (Linux/Mac)
2. **Configure**: Edit `.env` files
3. **Database**: Create database and run schema
4. **Start**: Run `start-dev.bat` or `start-dev.sh`
5. **Develop**: Make changes, servers auto-reload
6. **Test**: Use browser and API testing tools
7. **Build**: Build for production deployment

## Production Deployment

See `DEPLOYMENT.md` for detailed production setup including:
- Server configuration
- Nginx reverse proxy
- SSL certificates
- Systemd services
- Database optimization
- Monitoring & logging
- Backup strategies
