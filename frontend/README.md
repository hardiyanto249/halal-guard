# HalalGuard AI - Frontend

Frontend aplikasi HalalGuard AI menggunakan React, TypeScript, dan Vite.

## Fitur

- ✅ Dashboard analisis kepatuhan syariah
- ✅ Input dan analisis transaksi
- ✅ Visualisasi data dengan Recharts
- ✅ Laporan audit yang dapat dicetak
- ✅ Monitoring sistem
- ✅ Responsive design

## Prasyarat

- Node.js 18 atau lebih tinggi
- npm atau yarn

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Konfigurasi Environment

File `.env` sudah tersedia dengan konfigurasi default:

```env
VITE_API_URL=http://localhost:8080/api
```

Jika backend Anda berjalan di URL yang berbeda, update nilai `VITE_API_URL`.

### 3. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## Build untuk Production

```bash
npm run build
```

Output akan ada di folder `dist/`

## Preview Production Build

```bash
npm run preview
```

## Struktur Folder

```
frontend/
├── components/          # React components
│   ├── Header.tsx
│   ├── TransactionInput.tsx
│   ├── AnalysisDashboard.tsx
│   ├── TransactionList.tsx
│   └── SystemMonitor.tsx
├── services/           # API services
│   └── geminiService.ts
├── App.tsx            # Main app component
├── index.tsx          # Entry point
├── types.ts           # TypeScript types
└── index.html         # HTML template
```

## Koneksi ke Backend

Frontend berkomunikasi dengan backend melalui REST API. Pastikan backend sudah berjalan sebelum menjalankan frontend.

Endpoint yang digunakan:
- `POST /api/analyze` - Analisis transaksi
- `GET /api/transactions` - Ambil semua transaksi
- `GET /api/transactions/:id` - Ambil transaksi spesifik
- `GET /api/health` - Health check

## Troubleshooting

### CORS Error
- Pastikan backend sudah mengaktifkan CORS untuk origin frontend
- Periksa konfigurasi `CORS_ORIGIN` di backend `.env`

### API Connection Error
- Pastikan backend sudah berjalan
- Periksa `VITE_API_URL` di file `.env` frontend
- Periksa console browser untuk error detail

### Build Error
- Hapus folder `node_modules` dan `package-lock.json`
- Jalankan `npm install` lagi
- Pastikan versi Node.js kompatibel

## License

MIT
