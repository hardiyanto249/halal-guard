# ANALISIS ROLLBACK & DAMPAK MIGRATE_TO_NPM.SH

**Tanggal Analisis:** 2025-12-21  
**Script:** `/opt/halal-guard/migrate_to_npm.sh`  
**Fokus:** Mekanisme Rollback & Dampak ke Aplikasi Lain di VPS

---

## 📋 EXECUTIVE SUMMARY

### Status Keamanan Rollback
- ✅ **AMAN** - Script memiliki mekanisme rollback otomatis
- ⚠️ **TERBATAS** - Rollback hanya untuk file `index.html`
- ❌ **TIDAK LENGKAP** - Tidak rollback `node_modules` dan `package.json`

### Dampak ke Aplikasi Lain
- ✅ **AMAN** - Tidak ada dampak langsung ke aplikasi lain
- ✅ **ISOLATED** - Semua operasi terbatas di `/opt/halal-guard/frontend`
- ⚠️ **RESOURCE USAGE** - Bisa mempengaruhi resource VPS sementara

---

## 🔍 ANALISIS MEKANISME ROLLBACK

### 1. Rollback yang ADA (Baris 74-85)

```bash
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    echo "   Restoring backup..."
    cp index.html.backup.cdn index.html    # ← ROLLBACK OTOMATIS
    echo "   Backup restored. Please check errors above."
    exit 1
fi
```

**Yang Di-Rollback:**
- ✅ File `index.html` → dikembalikan ke versi CDN

**Yang TIDAK Di-Rollback:**
- ❌ `node_modules/` → tetap ada (paket npm sudah terinstall)
- ❌ `package.json` → tetap berisi dependency baru
- ❌ `package-lock.json` → tetap ada

---

## ⚠️ SKENARIO KEGAGALAN & DAMPAKNYA

### Skenario 1: Gagal di Step 1 (npm install)

**Titik Kegagalan:**
```bash
npm install react@19.2.1 react-dom@19.2.1 lucide-react@0.556.0 recharts@3.5.1
```

**Kemungkinan Penyebab:**
- Network error (tidak bisa akses npm registry)
- Disk space penuh
- Permission error
- Versi Node.js tidak kompatibel

**Dampak:**
- ❌ Script berhenti (exit 1)
- ⚠️ `package.json` sudah dimodifikasi
- ⚠️ `node_modules/` mungkin partial install
- ✅ `index.html` belum diubah (masih aman)

**Rollback Status:**
- ❌ TIDAK ADA rollback otomatis
- ⚠️ Aplikasi masih bisa jalan dengan CDN (index.html belum berubah)
- ⚠️ Tapi `package.json` sudah berubah

**Recovery Manual:**
```bash
cd /opt/halal-guard/frontend
git checkout package.json package-lock.json  # jika pakai git
# atau
npm install  # install ulang sesuai package.json yang baru
```

---

### Skenario 2: Gagal di Step 5 (npm run build)

**Titik Kegagalan:**
```bash
npm run build
```

**Kemungkinan Penyebab:**
- TypeScript compilation error
- Import path error
- Missing dependencies
- Vite configuration error
- Memory habis (OOM)

**Dampak:**
- ✅ ROLLBACK OTOMATIS berjalan
- ✅ `index.html` dikembalikan ke versi CDN
- ⚠️ `node_modules/` tetap ada (tidak di-rollback)
- ⚠️ `package.json` tetap berisi dependency baru

**Rollback Status:**
- ✅ Rollback `index.html` berhasil
- ⚠️ Aplikasi bisa jalan dengan CDN lagi
- ⚠️ Tapi ada "sampah" di `node_modules/` (paket yang tidak terpakai)

**Recovery Manual:**
```bash
# Bersihkan node_modules yang tidak terpakai
cd /opt/halal-guard/frontend
rm -rf node_modules
npm install  # install ulang sesuai package.json original
```

---

### Skenario 3: Build Sukses, Tapi Deploy Gagal

**Titik Kegagalan:**
```bash
# Setelah migrate_to_npm.sh sukses
../deploy_frontend.sh  # ← Gagal di sini
```

**Kemungkinan Penyebab:**
- Nginx configuration error
- Permission error saat copy ke `/var/www/`
- Service restart gagal

**Dampak:**
- ⚠️ Build baru sudah ada di `dist/`
- ⚠️ Tapi belum di-deploy ke production
- ✅ Aplikasi production masih pakai versi lama (aman)

**Rollback Status:**
- ❌ TIDAK ADA rollback otomatis
- ✅ Production masih aman (pakai versi lama)
- ⚠️ Perlu rollback manual jika ingin kembali ke CDN

**Recovery Manual:**
```bash
cd /opt/halal-guard/frontend
cp index.html.backup.cdn index.html
npm run build
../deploy_frontend.sh
```

---

## 🖥️ DAMPAK KE APLIKASI LAIN DI VPS

### Analisis Isolasi

**Direktori Kerja:**
```bash
cd /opt/halal-guard/frontend || exit 1  # ← Semua operasi di sini
```

**Operasi yang Dilakukan:**
1. `npm install` → Install paket di `/opt/halal-guard/frontend/node_modules/`
2. `cp index.html` → Copy file di `/opt/halal-guard/frontend/`
3. `npm run build` → Build di `/opt/halal-guard/frontend/dist/`

**Kesimpulan Isolasi:**
- ✅ **FULLY ISOLATED** - Tidak ada operasi di luar `/opt/halal-guard/frontend/`
- ✅ **NO GLOBAL CHANGES** - Tidak mengubah global npm packages
- ✅ **NO SYSTEM CHANGES** - Tidak mengubah system configuration

---

### Dampak Resource VPS

#### 1. CPU Usage

**Saat npm install:**
- ⚠️ CPU spike 30-60 detik
- ⚠️ Bisa mencapai 80-100% CPU usage
- ⚠️ Aplikasi lain bisa melambat sementara

**Saat npm run build:**
- ⚠️ CPU spike 20-40 detik
- ⚠️ Vite bundling process intensive
- ⚠️ Aplikasi lain bisa melambat sementara

**Mitigasi:**
```bash
# Jalankan dengan nice (lower priority)
nice -n 10 ./migrate_to_npm.sh
```

---

#### 2. Memory Usage

**npm install:**
- ⚠️ Memory spike ~200-500 MB
- ⚠️ Jika VPS memory kecil (< 1GB), bisa OOM
- ⚠️ OOM bisa kill aplikasi lain

**npm run build:**
- ⚠️ Memory spike ~300-800 MB
- ⚠️ Vite build process memory intensive
- ⚠️ Bisa trigger OOM killer

**Cek Memory Sebelum Jalankan:**
```bash
free -h
# Pastikan available memory > 1GB
```

**Mitigasi OOM:**
```bash
# Tambahkan swap jika memory kecil
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

#### 3. Disk I/O

**npm install:**
- ⚠️ Write ~50-100 MB ke disk
- ⚠️ Banyak small files (ribuan files di node_modules)
- ⚠️ Disk I/O spike bisa mempengaruhi database performance

**npm run build:**
- ⚠️ Read dari node_modules + source files
- ⚠️ Write ke dist/ folder
- ⚠️ Disk I/O intensive

**Dampak ke Aplikasi Lain:**
- ⚠️ Database queries bisa melambat
- ⚠️ File uploads bisa timeout
- ⚠️ Log writing bisa delay

---

#### 4. Network Usage

**npm install:**
- ⚠️ Download ~20-40 MB dari npm registry
- ⚠️ Bandwidth spike 10-30 detik
- ⚠️ Bisa mempengaruhi aplikasi yang sedang download/upload

**Dampak:**
- ⚠️ API calls dari aplikasi lain bisa melambat
- ⚠️ User uploads bisa timeout
- ⚠️ External API calls bisa delay

---

### Dampak ke Aplikasi Spesifik

#### Jika Ada Database (PostgreSQL/MySQL)

**Dampak:**
- ⚠️ Query performance bisa turun saat build
- ⚠️ Connection pool bisa terpengaruh jika memory tight
- ✅ Data AMAN - tidak ada operasi database

**Mitigasi:**
```bash
# Jalankan saat traffic rendah
# Misalnya jam 2-4 pagi
```

---

#### Jika Ada Web Server (Nginx/Apache)

**Dampak:**
- ✅ AMAN - tidak ada perubahan configuration
- ✅ AMAN - tidak ada restart service
- ⚠️ Response time bisa naik saat CPU spike

**Yang TIDAK Terpengaruh:**
- ✅ Virtual host configuration
- ✅ SSL certificates
- ✅ Proxy settings
- ✅ Running applications

---

#### Jika Ada Aplikasi Node.js Lain

**Dampak:**
- ✅ AMAN - tidak ada perubahan global npm
- ✅ AMAN - tidak ada perubahan Node.js version
- ⚠️ Performance bisa turun saat CPU/memory spike

**Yang TIDAK Terpengaruh:**
- ✅ Global npm packages
- ✅ PM2 processes
- ✅ Environment variables
- ✅ Port bindings

---

## 🚨 SKENARIO TERBURUK

### Worst Case Scenario: OOM Killer

**Apa yang Terjadi:**
1. `npm run build` memakan terlalu banyak memory
2. Linux OOM killer aktif
3. OOM killer membunuh process yang paling banyak pakai memory

**Proses yang Bisa Di-Kill:**
- ❌ npm build process (yang kita inginkan)
- ❌ Database server (PostgreSQL/MySQL)
- ❌ Node.js application lain
- ❌ Web server (Nginx/Apache) - jarang, tapi mungkin

**Dampak:**
- 🔴 **CRITICAL** - Aplikasi lain bisa mati
- 🔴 **CRITICAL** - Database bisa mati (data corruption risk)
- 🔴 **CRITICAL** - Website down

**Deteksi OOM:**
```bash
# Cek log OOM killer
dmesg | grep -i "killed process"
journalctl -xe | grep -i "out of memory"
```

**Recovery:**
```bash
# Restart services yang mati
sudo systemctl restart postgresql
sudo systemctl restart nginx
pm2 restart all
```

---

## ✅ REKOMENDASI KEAMANAN

### 1. Pre-Flight Checks

**Sebelum Jalankan Script:**

```bash
#!/bin/bash
# pre_flight_check.sh

echo "🔍 Pre-Flight Checks for migrate_to_npm.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check available memory
AVAILABLE_MEM=$(free -m | awk 'NR==2 {print $7}')
echo "Available Memory: ${AVAILABLE_MEM}MB"
if [ "$AVAILABLE_MEM" -lt 1000 ]; then
    echo "⚠️  WARNING: Low memory! Recommended: > 1GB"
    echo "   Consider adding swap or running during low traffic"
fi

# 2. Check disk space
AVAILABLE_DISK=$(df -h /opt/halal-guard | awk 'NR==2 {print $4}')
echo "Available Disk: ${AVAILABLE_DISK}"
AVAILABLE_DISK_MB=$(df -m /opt/halal-guard | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_DISK_MB" -lt 500 ]; then
    echo "⚠️  WARNING: Low disk space! Recommended: > 500MB"
    exit 1
fi

# 3. Check CPU load
CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
echo "CPU Load (1min): ${CPU_LOAD}"

# 4. Check if other critical processes running
echo ""
echo "Critical Processes:"
ps aux | grep -E "(postgres|mysql|nginx|node)" | grep -v grep | awk '{print $11}' | sort | uniq

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Proceed with migration? (y/n)"
read -r CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Migration cancelled."
    exit 0
fi
```

---

### 2. Enhanced Rollback Script

**Buat script rollback lengkap:**

```bash
#!/bin/bash
# rollback_migration.sh

echo "🔄 Rolling back migration to CDN..."

cd /opt/halal-guard/frontend || exit 1

# 1. Restore index.html
if [ -f "index.html.backup.cdn" ]; then
    cp index.html.backup.cdn index.html
    echo "✅ index.html restored"
else
    echo "❌ Backup not found!"
    exit 1
fi

# 2. Restore package.json (if backed up)
if [ -f "package.json.backup.cdn" ]; then
    cp package.json.backup.cdn package.json
    echo "✅ package.json restored"
fi

# 3. Clean node_modules
echo "🧹 Cleaning node_modules..."
rm -rf node_modules

# 4. Reinstall original dependencies
echo "📦 Reinstalling original dependencies..."
npm install

# 5. Rebuild
echo "🔨 Rebuilding..."
npm run build

# 6. Deploy
echo "🚀 Deploying..."
../deploy_frontend.sh

echo "✅ Rollback complete!"
```

---

### 3. Improved migrate_to_npm.sh

**Tambahkan backup package.json:**

```bash
# Tambahkan di Step 2 (setelah backup index.html)
echo "📝 Step 2: Backup current files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cp index.html index.html.backup.cdn
cp package.json package.json.backup.cdn  # ← TAMBAHKAN INI
cp package-lock.json package-lock.json.backup.cdn  # ← TAMBAHKAN INI
echo "✅ Backups saved:"
echo "   - index.html.backup.cdn"
echo "   - package.json.backup.cdn"
echo "   - package-lock.json.backup.cdn"
echo ""
```

---

### 4. Monitoring During Migration

**Jalankan monitoring di terminal terpisah:**

```bash
# Terminal 1: Jalankan migration
./migrate_to_npm.sh

# Terminal 2: Monitor resources
watch -n 1 'free -h && echo "" && df -h /opt/halal-guard && echo "" && uptime'

# Terminal 3: Monitor processes
watch -n 1 'ps aux | grep -E "(npm|node|vite)" | grep -v grep'
```

---

## 📊 RISK MATRIX

| Skenario | Probability | Impact | Risk Level | Mitigation |
|----------|-------------|--------|------------|------------|
| npm install gagal | Medium | Low | 🟡 MEDIUM | Pre-flight check network |
| Build gagal | Low | Low | 🟢 LOW | Rollback otomatis ada |
| OOM saat build | Medium | High | 🔴 HIGH | Add swap, run off-peak |
| Disk penuh | Low | Medium | 🟡 MEDIUM | Pre-flight check disk |
| Kill aplikasi lain | Low | Critical | 🔴 HIGH | Monitor memory, add swap |
| Database corruption | Very Low | Critical | 🟡 MEDIUM | Backup database dulu |

---

## 🎯 BEST PRACTICES

### Waktu Eksekusi Ideal

**Rekomendasi:**
- ✅ **Jam 2-4 pagi** (traffic rendah)
- ✅ **Hari Minggu/Senin dini hari**
- ❌ **JANGAN saat jam sibuk** (jam kerja, weekend siang)

### Checklist Sebelum Migrasi

```
□ Backup database (jika ada)
□ Cek available memory > 1GB
□ Cek available disk > 500MB
□ Cek CPU load < 2.0
□ Notify team (jika ada)
□ Siapkan rollback plan
□ Test di staging dulu (jika ada)
□ Monitor tools ready (htop, watch)
```

### Checklist Setelah Migrasi

```
□ Test aplikasi frontend
□ Cek console browser (no errors)
□ Cek network tab (no CDN requests)
□ Cek aplikasi lain masih jalan
□ Cek database masih jalan
□ Monitor memory usage
□ Monitor disk usage
□ Backup file hasil migrasi
```

---

## 🔧 TOOLS UNTUK MONITORING

### 1. htop
```bash
sudo apt install htop
htop
# Monitor CPU, memory, processes real-time
```

### 2. iotop
```bash
sudo apt install iotop
sudo iotop
# Monitor disk I/O
```

### 3. nethogs
```bash
sudo apt install nethogs
sudo nethogs
# Monitor network usage per process
```

### 4. dstat
```bash
sudo apt install dstat
dstat -tcmdn
# Monitor CPU, memory, disk, network
```

---

## 📝 KESIMPULAN

### Keamanan Rollback
- ✅ Ada mekanisme rollback otomatis untuk `index.html`
- ⚠️ Perlu ditambahkan rollback untuk `package.json`
- ⚠️ Perlu script rollback manual lengkap

### Dampak ke Aplikasi Lain
- ✅ **Isolasi baik** - tidak ada perubahan global
- ⚠️ **Resource usage** - bisa mempengaruhi performance sementara
- 🔴 **OOM risk** - bisa kill aplikasi lain jika memory kecil

### Rekomendasi
1. **Jalankan pre-flight checks** sebelum migrasi
2. **Tambahkan swap** jika memory < 2GB
3. **Jalankan saat traffic rendah** (dini hari)
4. **Monitor resources** selama migrasi
5. **Siapkan rollback script** lengkap
6. **Backup database** sebelum migrasi (jika ada)

### Risk Level: 🟡 MEDIUM-HIGH
- Low risk untuk aplikasi HalalGuard sendiri
- Medium-high risk untuk aplikasi lain (jika memory tight)

---

**Prepared by:** Antigravity AI  
**Date:** 2025-12-21  
**Version:** 1.0
