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
