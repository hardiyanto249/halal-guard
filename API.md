# API Documentation - HalalGuard AI

Dokumentasi lengkap REST API untuk HalalGuard AI Backend.

## Base URL

**Development**: `http://localhost:8087/api`  
**Production**: `https://your-domain.com/api`

## Authentication

Saat ini API tidak memerlukan authentication. Untuk production, pertimbangkan menambahkan:
- API Key authentication
- JWT tokens
- Rate limiting

## Endpoints

### 1. Health Check

Memeriksa status server.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "service": "HalalGuard AI Backend",
  "version": "1.0.0"
}
```

**Status Codes**:
- `200 OK` - Server berjalan normal

---

### 2. Analyze Transactions

Menganalisis satu atau lebih transaksi menggunakan AI.

**Endpoint**: `POST /analyze`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "transactions": [
    {
      "id": "TXN001",
      "description": "Pembelian saham syariah",
      "amount": 10000000,
      "date": "2024-01-15",
      "type": "Investment"
    },
    {
      "id": "TXN002",
      "description": "Pinjaman dengan bunga 5%",
      "amount": 5000000,
      "date": "2024-01-16",
      "type": "Loan"
    }
  ]
}
```

**Request Fields**:
- `transactions` (array, required): Array of transaction objects
  - `id` (string, required): Unique transaction ID
  - `description` (string, required): Transaction description
  - `amount` (number, required): Transaction amount in IDR
  - `date` (string, required): Transaction date (format: YYYY-MM-DD)
  - `type` (string, required): Transaction type (e.g., "Investment", "Loan", "Purchase")

**Response**:
```json
{
  "results": [
    {
      "transactionId": "TXN001",
      "status": "Patuh",
      "violationType": "Halal",
      "confidenceScore": 95.5,
      "breakdown": {
        "ribaScore": 1.0,
        "ghararScore": 0.95,
        "maysirScore": 1.0,
        "halalScore": 0.98,
        "justiceScore": 0.92
      },
      "maslahahAnalysis": {
        "totalScore": 85.5,
        "breakdown": {
          "economicJustice": 88.0,
          "communityDevelopment": 82.0,
          "educationalImpact": 85.0,
          "environmental": 90.0,
          "socialCohesion": 83.0
        },
        "longTermProjection": "Investasi ini berpotensi memberikan dampak positif jangka panjang..."
      },
      "reasoning": "Transaksi ini sesuai dengan prinsip syariah karena...",
      "suggestedCorrection": ""
    },
    {
      "transactionId": "TXN002",
      "status": "Tidak Patuh",
      "violationType": "Riba",
      "confidenceScore": 25.0,
      "breakdown": {
        "ribaScore": 0.0,
        "ghararScore": 0.8,
        "maysirScore": 1.0,
        "halalScore": 0.7,
        "justiceScore": 0.6
      },
      "maslahahAnalysis": {
        "totalScore": 35.0,
        "breakdown": {
          "economicJustice": 30.0,
          "communityDevelopment": 35.0,
          "educationalImpact": 40.0,
          "environmental": 35.0,
          "socialCohesion": 35.0
        },
        "longTermProjection": "Praktik riba dapat merusak keadilan ekonomi..."
      },
      "reasoning": "Transaksi mengandung unsur riba karena adanya bunga 5%",
      "suggestedCorrection": "Gunakan pembiayaan syariah dengan akad mudharabah atau musyarakah"
    }
  ]
}
```

**Response Fields**:
- `results` (array): Array of analysis results
  - `transactionId` (string): ID transaksi yang dianalisis
  - `status` (string): Status kepatuhan ("Patuh", "Tidak Patuh", "Butuh Tinjauan")
  - `violationType` (string): Jenis pelanggaran ("Riba", "Gharar", "Maysir", "Halal", "Syubhat")
  - `confidenceScore` (number): Skor kepatuhan total (0-100)
  - `breakdown` (object): Breakdown skor per prinsip (0-1)
    - `ribaScore`: Skor bebas riba
    - `ghararScore`: Skor kejelasan akad
    - `maysirScore`: Skor bebas judi
    - `halalScore`: Skor kehalalan objek
    - `justiceScore`: Skor keadilan
  - `maslahahAnalysis` (object): Analisis dampak sosial
    - `totalScore` (number): Total skor maslahah (0-100)
    - `breakdown` (object): Breakdown per dimensi (0-100)
    - `longTermProjection` (string): Proyeksi dampak jangka panjang
  - `reasoning` (string): Penjelasan hasil analisis
  - `suggestedCorrection` (string): Saran perbaikan (jika ada)

**Status Codes**:
- `200 OK` - Analisis berhasil
- `400 Bad Request` - Request tidak valid
- `500 Internal Server Error` - Error pada server atau AI

**Error Response**:
```json
{
  "error": "Invalid request",
  "message": "transactions field is required"
}
```

---

### 3. Get All Transactions

Mengambil semua transaksi beserta hasil analisisnya.

**Endpoint**: `GET /transactions`

**Response**:
```json
[
  {
    "id": "TXN001",
    "description": "Pembelian saham syariah",
    "amount": 10000000,
    "date": "2024-01-15",
    "type": "Investment",
    "analysis": {
      "transactionId": "TXN001",
      "status": "Patuh",
      "violationType": "Halal",
      "confidenceScore": 95.5,
      "breakdown": {
        "ribaScore": 1.0,
        "ghararScore": 0.95,
        "maysirScore": 1.0,
        "halalScore": 0.98,
        "justiceScore": 0.92
      },
      "maslahahAnalysis": {
        "totalScore": 85.5,
        "breakdown": {
          "economicJustice": 88.0,
          "communityDevelopment": 82.0,
          "educationalImpact": 85.0,
          "environmental": 90.0,
          "socialCohesion": 83.0
        },
        "longTermProjection": "Investasi ini berpotensi..."
      },
      "reasoning": "Transaksi sesuai prinsip syariah...",
      "suggestedCorrection": ""
    }
  }
]
```

**Status Codes**:
- `200 OK` - Berhasil mengambil data
- `500 Internal Server Error` - Error database

---

### 4. Get Transaction by ID

Mengambil detail transaksi spesifik beserta analisisnya.

**Endpoint**: `GET /transactions/:id`

**URL Parameters**:
- `id` (string, required): Transaction ID

**Example**: `GET /transactions/TXN001`

**Response**:
```json
{
  "id": "TXN001",
  "description": "Pembelian saham syariah",
  "amount": 10000000,
  "date": "2024-01-15",
  "type": "Investment",
  "analysis": {
    "transactionId": "TXN001",
    "status": "Patuh",
    "violationType": "Halal",
    "confidenceScore": 95.5,
    "breakdown": {
      "ribaScore": 1.0,
      "ghararScore": 0.95,
      "maysirScore": 1.0,
      "halalScore": 0.98,
      "justiceScore": 0.92
    },
    "maslahahAnalysis": {
      "totalScore": 85.5,
      "breakdown": {
        "economicJustice": 88.0,
        "communityDevelopment": 82.0,
        "educationalImpact": 85.0,
        "environmental": 90.0,
        "socialCohesion": 83.0
      },
      "longTermProjection": "Investasi ini berpotensi..."
    },
    "reasoning": "Transaksi sesuai prinsip syariah...",
    "suggestedCorrection": ""
  }
}
```

**Status Codes**:
- `200 OK` - Transaksi ditemukan
- `404 Not Found` - Transaksi tidak ditemukan
- `500 Internal Server Error` - Error database

**Error Response**:
```json
{
  "error": "Transaction not found",
  "message": "transaction not found"
}
```

---

## Data Models

### TransactionInput
```typescript
{
  id: string;           // Unique identifier
  description: string;  // Transaction description
  amount: number;       // Amount in IDR
  date: string;         // Date (YYYY-MM-DD)
  type: string;         // Transaction type
}
```

### AnalysisResult
```typescript
{
  transactionId: string;
  status: "Patuh" | "Tidak Patuh" | "Butuh Tinjauan";
  violationType: "Riba" | "Gharar" | "Maysir" | "Halal" | "Syubhat";
  confidenceScore: number;  // 0-100
  breakdown: ComplianceBreakdown;
  maslahahAnalysis?: MaslahahAnalysis;
  reasoning: string;
  suggestedCorrection?: string;
}
```

### ComplianceBreakdown
```typescript
{
  ribaScore: number;     // 0-1
  ghararScore: number;   // 0-1
  maysirScore: number;   // 0-1
  halalScore: number;    // 0-1
  justiceScore: number;  // 0-1
}
```

### MaslahahAnalysis
```typescript
{
  totalScore: number;  // 0-100
  breakdown: {
    economicJustice: number;       // 0-100
    communityDevelopment: number;  // 0-100
    educationalImpact: number;     // 0-100
    environmental: number;         // 0-100
    socialCohesion: number;        // 0-100
  };
  longTermProjection: string;
}
```

---

## Rate Limiting

Saat ini tidak ada rate limiting. Untuk production, pertimbangkan:
- 100 requests per minute per IP
- 1000 requests per hour per IP

## CORS

Backend mengizinkan CORS dari origin yang dikonfigurasi di `.env`:
```
CORS_ORIGIN=http://localhost:5173
```

Untuk production, set ke domain frontend Anda.

## Error Handling

Semua error mengikuti format:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200 OK` - Request berhasil
- `400 Bad Request` - Request tidak valid
- `404 Not Found` - Resource tidak ditemukan
- `500 Internal Server Error` - Server error

## Example Usage

### cURL
```bash
# Health check
curl http://localhost:8087/api/health

# Analyze transactions
curl -X POST http://localhost:8087/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {
        "id": "TXN001",
        "description": "Pembelian saham",
        "amount": 5000000,
        "date": "2024-01-15",
        "type": "Investment"
      }
    ]
  }'

# Get all transactions
curl http://localhost:8080/api/transactions

# Get specific transaction
curl http://localhost:8080/api/transactions/TXN001
```

### JavaScript (Fetch)
```javascript
// Analyze transactions
const response = await fetch('http://localhost:8080/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    transactions: [
      {
        id: 'TXN001',
        description: 'Pembelian saham',
        amount: 5000000,
        date: '2024-01-15',
        type: 'Investment'
      }
    ]
  })
});

const data = await response.json();
console.log(data.results);
```

### Python (requests)
```python
import requests

# Analyze transactions
response = requests.post(
    'http://localhost:8080/api/analyze',
    json={
        'transactions': [
            {
                'id': 'TXN001',
                'description': 'Pembelian saham',
                'amount': 5000000,
                'date': '2024-01-15',
                'type': 'Investment'
            }
        ]
    }
)

data = response.json()
print(data['results'])
```

---

## Support

Untuk pertanyaan atau issue, silakan buka issue di repository GitHub.
