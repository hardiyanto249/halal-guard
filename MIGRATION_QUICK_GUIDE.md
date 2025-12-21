# 🚀 PANDUAN MIGRASI NPM - QUICK REFERENCE

## 📋 RINGKASAN EKSEKUTIF

### Apakah Aman untuk Aplikasi Lain?
**✅ YA, AMAN** - dengan catatan:
- ✅ Tidak ada perubahan global/system
- ✅ Semua operasi terisolasi di `/opt/halal-guard/frontend/`
- ⚠️ **TAPI** bisa mempengaruhi **performance sementara** (CPU/Memory spike)
- 🔴 **RISIKO:** Jika memory VPS < 1GB, bisa trigger OOM killer yang membunuh aplikasi lain

### Rollback Tersedia?
**✅ YA** - Ada 3 level rollback:
1. **Otomatis** - Jika build gagal, rollback index.html otomatis
2. **Manual** - Script `rollback_migration.sh` untuk rollback lengkap
3. **Backup Timestamped** - Semua file di-backup dengan timestamp

---

## 🎯 CARA PENGGUNAAN

### Opsi 1: Migrasi Aman (RECOMMENDED)

```bash
cd /opt/halal-guard

# 1. Jalankan pre-flight check dulu
./pre_flight_check.sh

# Script akan otomatis lanjut ke migrasi jika semua OK
# Atau berhenti jika ada masalah kritis
```

### Opsi 2: Migrasi Langsung (Enhanced Version)

```bash
cd /opt/halal-guard

# Gunakan versi enhanced dengan backup lebih lengkap
./migrate_to_npm_enhanced.sh
```

### Opsi 3: Migrasi Original

```bash
cd /opt/halal-guard

# Gunakan script original (backup terbatas)
./migrate_to_npm.sh
```

---

## 🔄 CARA ROLLBACK

### Jika Migrasi Gagal

```bash
cd /opt/halal-guard

# Jalankan script rollback
./rollback_migration.sh

# Script akan:
# 1. Restore index.html
# 2. Restore package.json
# 3. Clean node_modules
# 4. Reinstall dependencies
# 5. Rebuild
# 6. Deploy
```

### Rollback Manual (Jika Script Gagal)

```bash
cd /opt/halal-guard/frontend

# Restore files
cp index.html.backup.cdn index.html
cp package.json.backup.cdn package.json
cp package-lock.json.backup.cdn package-lock.json

# Clean dan reinstall
rm -rf node_modules
npm install

# Rebuild dan deploy
npm run build
cd ..
./deploy_frontend.sh
```

---

## ⚠️ KAPAN SEBAIKNYA JALANKAN?

### ✅ Waktu IDEAL:
- **Jam 2-4 pagi** (traffic rendah)
- **Hari Minggu/Senin dini hari**
- **Saat tidak ada proses penting lain**

### ❌ JANGAN Jalankan Saat:
- Jam sibuk (jam kerja, weekend siang)
- Ada backup database sedang berjalan
- VPS sedang high load
- Sedang ada deployment aplikasi lain

---

## 📊 CHECKLIST SEBELUM MIGRASI

```
□ Available memory > 1GB (cek: free -h)
□ Available disk > 500MB (cek: df -h)
□ CPU load < 2.0 (cek: uptime)
□ Network OK (cek: ping registry.npmjs.org)
□ Backup database sudah jalan (jika ada)
□ Notify team (jika ada)
□ Siapkan terminal untuk monitoring
```

---

## 🛡️ MONITORING SELAMA MIGRASI

### Terminal 1: Jalankan Migrasi
```bash
./pre_flight_check.sh
```

### Terminal 2: Monitor Resources
```bash
watch -n 1 'free -h && echo "" && df -h /opt/halal-guard && echo "" && uptime'
```

### Terminal 3: Monitor Processes
```bash
watch -n 1 'ps aux | grep -E "(npm|node|vite)" | grep -v grep'
```

---

## 🚨 TROUBLESHOOTING

### Problem: npm install gagal

**Penyebab:**
- Network error
- Disk penuh
- Permission error

**Solusi:**
```bash
# Cek network
ping registry.npmjs.org

# Cek disk
df -h

# Cek permission
ls -la /opt/halal-guard/frontend/

# Retry dengan verbose
cd /opt/halal-guard/frontend
npm install --verbose
```

---

### Problem: Build gagal

**Penyebab:**
- TypeScript error
- Import path salah
- Memory habis

**Solusi:**
```bash
# Cek error detail
cd /opt/halal-guard/frontend
npm run build 2>&1 | tee build.log

# Jika memory issue, tambah swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Retry build
npm run build
```

---

### Problem: OOM Killer membunuh aplikasi lain

**Deteksi:**
```bash
# Cek log OOM
dmesg | grep -i "killed process"
journalctl -xe | grep -i "out of memory"
```

**Recovery:**
```bash
# Restart services yang mati
sudo systemctl restart postgresql
sudo systemctl restart nginx
pm2 restart all

# Rollback migrasi
cd /opt/halal-guard
./rollback_migration.sh
```

---

### Problem: Aplikasi tidak jalan setelah deploy

**Solusi:**
```bash
# Cek browser console untuk error
# Biasanya ada error import atau path

# Cek file dist/
cd /opt/halal-guard/frontend
ls -la dist/

# Cek nginx error log
sudo tail -f /var/log/nginx/error.log

# Jika masih error, rollback
cd /opt/halal-guard
./rollback_migration.sh
```

---

## 📈 DAMPAK KE APLIKASI LAIN

### Yang TIDAK Terpengaruh:
- ✅ Database (PostgreSQL/MySQL)
- ✅ Web server config (Nginx/Apache)
- ✅ Aplikasi Node.js lain
- ✅ Global npm packages
- ✅ Environment variables
- ✅ Port bindings

### Yang BISA Terpengaruh (Sementara):
- ⚠️ CPU usage spike (30-60 detik)
- ⚠️ Memory usage spike (200-800 MB)
- ⚠️ Disk I/O spike
- ⚠️ Network bandwidth spike

### Risiko OOM (Jika Memory < 1GB):
- 🔴 Aplikasi lain bisa di-kill
- 🔴 Database bisa di-kill
- 🔴 Website bisa down

**Mitigasi:**
```bash
# Tambah swap sebelum migrasi
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verifikasi
free -h
```

---

## 🎓 BEST PRACTICES

1. **Selalu jalankan pre-flight check dulu**
   ```bash
   ./pre_flight_check.sh
   ```

2. **Gunakan enhanced version untuk backup lebih baik**
   ```bash
   ./migrate_to_npm_enhanced.sh
   ```

3. **Monitor resources selama migrasi**
   ```bash
   watch -n 1 'free -h && uptime'
   ```

4. **Backup database sebelum migrasi** (jika ada)
   ```bash
   pg_dump halal_guard > backup_$(date +%Y%m%d).sql
   ```

5. **Test di staging dulu** (jika ada)

6. **Jalankan saat traffic rendah**

7. **Siapkan rollback plan**

---

## 📞 QUICK COMMANDS

```bash
# Pre-flight check
./pre_flight_check.sh

# Migrasi (enhanced)
./migrate_to_npm_enhanced.sh

# Rollback
./rollback_migration.sh

# Cek memory
free -h

# Cek disk
df -h

# Cek CPU
uptime

# Cek processes
ps aux | grep -E "(postgres|mysql|nginx|node)"

# Cek OOM log
dmesg | grep -i "killed process"
```

---

## 📚 FILE REFERENCE

| File | Deskripsi |
|------|-----------|
| `pre_flight_check.sh` | Cek system sebelum migrasi |
| `migrate_to_npm.sh` | Script migrasi original |
| `migrate_to_npm_enhanced.sh` | Script migrasi dengan backup lengkap |
| `rollback_migration.sh` | Script rollback lengkap |
| `MIGRATE_NPM_ROLLBACK_ANALYSIS.md` | Analisis detail lengkap |
| `MIGRATION_QUICK_GUIDE.md` | Panduan ini |

---

**Prepared by:** Antigravity AI  
**Date:** 2025-12-21  
**Version:** 1.0
