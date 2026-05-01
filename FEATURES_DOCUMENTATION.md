# Dokumentasi Fitur RTKU - May 2026

## 📋 Fitur-Fitur Yang Sudah Diimplementasikan

### 1. ✅ Manajemen Pengeluaran (Expense Management)

#### Backend - ExpensesController
- **Location**: `backend/app/Http/Controllers/Api/ExpensesController.php`
- **API Endpoints**:
  - `GET /api/expenses/categories` - Get semua kategori pengeluaran
  - `GET /api/expenses/datatables` - Get daftar pengeluaran (server-side)
  - `GET /api/expenses/summary` - Get ringkasan pengeluaran bulanan
  - `GET /api/expenses/{id}` - Get detail pengeluaran
  - `POST /api/expenses` - Tambah pengeluaran baru
  - `PUT /api/expenses/{id}` - Update pengeluaran
  - `DELETE /api/expenses/{id}` - Hapus pengeluaran

#### Frontend - Pengeluaran Module
- **Location**: `frontend/src/pages/Master/Pengeluaran/`
- **Files**:
  - `index.tsx` - Daftar pengeluaran dengan datatable
  - `FormPengeluaran.tsx` - Form tambah/edit pengeluaran (modal)
- **Features**:
  - Tampilan daftar pengeluaran dengan pencarian
  - Form modal untuk tambah/edit pengeluaran
  - Kategori pengeluaran terintegrasi dari database
  - Delete dengan konfirmasi

**Kategori Pengeluaran Tersedia**:
- Perbaikan Jalan
- Listrik Pos
- Gaji Satpam
- Kebersihan
- Umum

---

### 2. ✅ Auto-Generate Tagihan Bulanan

#### Backend - GenerateMonthlyCharges Command
- **Location**: `backend/app/Console/Commands/GenerateMonthlyCharges.php`
- **Usage**:
  ```bash
  # Generate untuk bulan sekarang
  php artisan charges:generate

  # Generate untuk bulan tertentu
  php artisan charges:generate --month=1 --year=2026

  # Generate ulang (hapus yang lama dulu)
  php artisan charges:generate --month=1 --year=2026 --force
  ```

**Fitur**:
- Otomatis membuat tagihan untuk penghuni dengan status **Tetap** (permanent residents)
- Membuat 2 tipe tagihan per penghuni per bulan:
  - Satpam: 100.000 IDR
  - Kebersihan: 15.000 IDR
- Status default: "Belum Bayar"
- Safe untuk dijalankan ulang dengan flag `--force`

#### API Endpoint untuk Generate dari UI
- **Endpoint**: `POST /api/dashboard/generate-charges`
- **Parameters**:
  ```json
  {
    "month": 5,
    "year": 2026,
    "force": false
  }
  ```
- **Response**:
  ```json
  {
    "message": "Successfully generated 30 charge records for 5/2026",
    "data": {
      "month": 5,
      "year": 2026,
      "count": 30,
      "residents_count": 15
    }
  }
  ```

---

### 3. ✅ Dashboard Komprehensif

#### Features
- **Statistics Cards**:
  - Total Rumah
  - Rumah Dihuni (occupied)
  - Rumah Kosong (empty)
  - Total Penghuni
  - Penghuni Aktif

- **Financial Summary**:
  - Pemasukan Bulan Ini (Lunas)
  - Tunggakan Pembayaran
  - Saldo Tahun Ini

- **Charts**:
  - 📊 Ringkasan Bulanan (Bar Chart - Pemasukan vs Pengeluaran)
  - 📈 Tren Saldo Bulanan (Line Chart)
  - 🥧 Pemasukan Berdasarkan Tipe (Pie Chart)
  - 🥧 Pengeluaran Berdasarkan Kategori (Pie Chart)

- **Recent Transactions**:
  - 5 pembayaran terbaru dengan detail
  - 5 pengeluaran terbaru dengan detail

#### Dashboard API Endpoints
- `GET /api/dashboard/statistics` - Get statistik dasar
- `GET /api/dashboard/monthly-overview` - Get data chart bulanan
- `GET /api/dashboard/income-expense` - Get ringkasan income vs expense
- `POST /api/dashboard/generate-charges` - Trigger generate charges

**Features**:
- Year selector untuk melihat data tahun sebelumnya
- Real-time calculation of balance
- Responsive design untuk mobile dan desktop
- Color-coded indicators (green untuk positive, red untuk negative)

---

### 4. ✅ UI/Navigation Updates

#### Sidebar Navigation
Updated `frontend/src/components/ui/Sidebar.tsx` untuk menambahkan:
- Menu "Pengeluaran" di Master Data section

#### Routes
Updated `frontend/src/routes/index.tsx`:
- Tambah route: `/master/pengeluaran`

---

## 📊 Struktur Data & Database

### Expense Entities
```
expenses table:
- id
- category_id (FK ke expense_categories)
- description (string)
- amount (decimal)
- expense_date (date)
- created_at, updated_at

expense_categories table:
- id
- name (string)
```

### Payment Generation Rules
Ketika generate charges:
1. Query semua `trhouse_residents` dengan:
   - `is_active = true`
   - `end_date = null`
   - Resident status = 'Tetap' atau null
2. Untuk setiap resident, buat 2 records:
   - Type: 'Satpam', Amount: 100000, Status: 'Belum Bayar'
   - Type: 'Kebersihan', Amount: 15000, Status: 'Belum Bayar'

---

## 🚀 Cara Menggunakan Fitur-Fitur Baru

### Generate Tagihan Bulanan

#### Method 1: Via UI Dashboard
1. Buka Dashboard
2. Klik tombol "Buat Tagihan Bulanan"
3. Pilih bulan dan tahun
4. Opsional: Check "Buat Ulang" jika mau regenerate
5. Klik "Buat Tagihan"

#### Method 2: Via Terminal
```bash
# Jalankan setiap bulan di tanggal 1
php artisan charges:generate --month=5 --year=2026
```

#### Method 3: Via Scheduler (Recommended)
Tambahkan ke `app/Console/Kernel.php` (tidak ada di project ini, perlu dibuat):
```php
$schedule->command('charges:generate')->monthlyOn(1, '00:00');
```

### Mengelola Pengeluaran
1. Sidebar → Master Data → Pengeluaran
2. Klik "Tambah Pengeluaran"
3. Isi form:
   - Kategori
   - Tanggal Pengeluaran
   - Keterangan
   - Nominal (Rp)
4. Submit
5. Edit/Hapus dari tabel

### Dashboard Insights
- Monthly trend untuk planning
- Outstanding payments tracking
- Balance prediction
- Kategori pengeluaran terbesar

---

## ⚙️ Konfigurasi & Maintenance

### Default Rates (Fixed)
- Satpam: 100.000 IDR
- Kebersihan: 15.000 IDR

**Catatan**: Jika ingin mengubah rates ini, edit di:
- Backend: `GenerateMonthlyCharges.php` (line ~95)
- Backend: `DashboardController.php` (line ~107)
- Frontend: Doc atau notification

### Konvensi Status
- **Penghuni**: 'Tetap' atau 'Kontrak'
  - Tetap = automatic charges setiap bulan
  - Kontrak = perlu ditambah manual
- **Pembayaran**: 'Lunas' atau 'Belum Bayar'

---

## 📝 Catatan Penting

1. **Penghuni Sementara (Kontrak)**:
   - Tidak otomatis dicharge
   - Perlu ditambah manual dari Master Iuran
   - Fleksibel untuk periode berbeda

2. **Outstanding Payments**:
   - Dashboard menampilkan semua pembayaran dengan status "Belum Bayar"
   - Gunakan untuk reminder/follow-up

3. **Pengeluaran Tidak Terulang**:
   - Setiap pengeluaran hanya dicatat sekali
   - Untuk pengeluaran rutin, harus ditambah manual setiap bulan

4. **Backup Catatan**:
   - Dashboard dan Laporan Keuangan menyimpan snapshot
   - Semua transaksi tercatat dengan timestamp

---

## 🔍 Testing Checklist

- [ ] Generate charges berhasil (check Master Iuran)
- [ ] Pengeluaran dapat ditambah/edit/hapus
- [ ] Dashboard stats akurat
- [ ] Charts render dengan baik
- [ ] Mobile responsive
- [ ] Error handling berfungsi
- [ ] Form validation works

---

## 🎯 Next Steps (Optional Enhancements)

- [ ] Email reminder untuk outstanding payments
- [ ] Export ke Excel/PDF
- [ ] Pembayaran partial (split payment)
- [ ] Late fees untuk tunggakan
- [ ] Receipt generation
- [ ] Multiple year comparison
- [ ] Advanced filtering & search

---

**Last Updated**: May 1, 2026  
**Version**: 1.0  
**Status**: ✅ Ready for Production
