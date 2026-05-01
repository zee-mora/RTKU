import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, CalendarClock, Eye, PencilLine, RefreshCw, Users } from "lucide-react";

import PageContainer from "../../../components/layout/PageContainer";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/DataTable/DataTable";
import InputForm from "../../../components/ui/InputForm";
import SelectField from "../../../components/ui/SelectField";
import { showToast } from "../../../utils/alert";
import api from "../../../api/axios";
import { triggerDatatableRefetch } from "../../../components/DataTable/DatatableRegistry";

type Option = {
  value: string;
  label: string;
};

type ResidentOption = {
  id: number;
  fullname: string;
};

type HouseRow = {
  id: number;
  house_number: string;
  address_detail: string | null;
  is_occupied: number | boolean;
  occupancy_status_label: string;
  current_resident_id: number | null;
  current_resident_name: string | null;
  current_start_date: string | null;
};

type OccupancyHistory = {
  id: number;
  resident_id: number;
  resident_name: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
};

type PaymentHistory = {
  id: number;
  trhouse_resident_id: number;
  resident_id: number;
  resident_name: string | null;
  type: string;
  month: number;
  year: number;
  amount: string | number;
  status: string;
  paid_at: string | null;
};

type HouseDetail = {
  id: number;
  house_number: string;
  address_detail: string | null;
  is_occupied: boolean;
  occupancy_status_label: string;
  current_resident: {
    id: number;
    fullname: string;
    start_date: string;
  } | null;
  occupancy_history: OccupancyHistory[];
  payment_history: PaymentHistory[];
};

type HouseFormState = {
  id: number | null;
  house_number: string;
  address_detail: string;
  is_occupied: boolean;
  resident_id: number | null;
};

const occupancyOptions: Option[] = [
  { value: "true", label: "Dihuni" },
  { value: "false", label: "Tidak dihuni" },
];

const monthLabels = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const emptyForm: HouseFormState = {
  id: null,
  house_number: "",
  address_detail: "",
  is_occupied: false,
  resident_id: null,
};

const MasterRumah = () => {
  const [form, setForm] = useState<HouseFormState>(emptyForm);
  const [residentOptions, setResidentOptions] = useState<Option[]>([]);
  const [residentLoading, setResidentLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<HouseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadResidents = useCallback(async () => {
    setResidentLoading(true);
    try {
      const response = await api.get("/residents/options");
      const residents = (response.data?.data ?? []) as ResidentOption[];

      setResidentOptions(
        residents.map((resident) => ({
          value: String(resident.id),
          label: resident.fullname,
        })),
      );
    } catch (error) {
      console.error(error);
      showToast("error", "Gagal", "Tidak dapat memuat daftar penghuni.");
    } finally {
      setResidentLoading(false);
    }
  }, []);

  const loadHouseDetail = useCallback(async (houseId: number) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/houses/${houseId}`);
      setSelectedHouse(response.data?.data ?? null);
    } catch (error) {
      console.error(error);
      showToast("error", "Gagal", "Tidak dapat memuat detail rumah.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResidents();
  }, [loadResidents]);

  const statusValue = useMemo(() => occupancyOptions.find((option) => option.value === String(form.is_occupied)) ?? null, [form.is_occupied]);
  const selectedResidentValue = useMemo(
    () => residentOptions.find((option) => option.value === (form.resident_id ? String(form.resident_id) : "")) ?? null,
    [form.resident_id, residentOptions],
  );

  const columns = useMemo<ColumnDef<HouseRow>[]>(
    () => [
      { accessorKey: "index", header: "NO" },
      {
        accessorKey: "house_number",
        header: "Nomor Rumah",
      },
      {
        accessorKey: "address_detail",
        header: "Alamat",
        cell: ({ row }) => row.original.address_detail || "-",
      },
      {
        accessorKey: "occupancy_status_label",
        header: "Status Rumah",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              row.original.is_occupied ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {row.original.occupancy_status_label}
          </span>
        ),
      },
      {
        accessorKey: "current_resident_name",
        header: "Penghuni Aktif",
        cell: ({ row }) => row.original.current_resident_name || "-",
      },
      {
        accessorKey: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              Icon={PencilLine}
              onClick={() => {
                setForm({
                  id: row.original.id,
                  house_number: row.original.house_number,
                  address_detail: row.original.address_detail ?? "",
                  is_occupied: Boolean(row.original.is_occupied),
                  resident_id: row.original.current_resident_id,
                });

                void loadHouseDetail(row.original.id);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="primary"
              Icon={Eye}
              onClick={() => void loadHouseDetail(row.original.id)}
            >
              Detail
            </Button>
          </div>
        ),
      },
    ],
    [loadHouseDetail],
  );

  const resetForm = () => {
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        house_number: form.house_number.trim(),
        address_detail: form.address_detail.trim() || null,
        is_occupied: form.is_occupied,
        resident_id: form.is_occupied && form.resident_id ? form.resident_id : null,
      };

      const response = form.id
        ? await api.put(`/houses/${form.id}`, payload)
        : await api.post("/houses", payload);

      const message = form.id ? "Rumah berhasil diperbarui." : "Rumah berhasil ditambahkan.";
      showToast("success", "Berhasil", message);
      triggerDatatableRefetch("table-rumah");

      const savedHouse = response.data?.data as HouseDetail | undefined;
      if (savedHouse) {
        setSelectedHouse(savedHouse);
      }

      resetForm();
    } catch (error) {
      console.error(error);
      showToast("error", "Gagal", "Tidak dapat menyimpan data rumah.");
    } finally {
      setSaving(false);
    }
  };

  const occupancyHistory = selectedHouse?.occupancy_history ?? [];
  const paymentHistory = selectedHouse?.payment_history ?? [];

  return (
    <PageContainer className="space-y-8 bg-gradient-to-br from-white via-emerald-50/40 to-slate-50">
      <Breadcrumb items={[{ label: "Master" }, { label: "Rumah" }]} />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mengelola Rumah</h1>
            <p className="text-sm text-slate-500">
              Tambah atau ubah rumah, tentukan penghuni aktif, dan pantau history hunian serta pembayaran.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {form.id ? "Ubah Rumah" : "Tambah Rumah"}
              </h2>
              <p className="text-sm text-slate-500">
                Status dihuni akan otomatis membentuk history penghuni aktif di tabel riwayat.
              </p>
            </div>
            <Button type="button" variant="secondary" Icon={RefreshCw} onClick={resetForm}>
              Reset
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <InputForm
              label="Nomor Rumah"
              required
              placeholder="Contoh: A-01"
              value={form.house_number}
              onChange={(event) => setForm((current) => ({ ...current, house_number: event.target.value }))}
            />

            <InputForm
              label="Alamat Detail"
              placeholder="Blok, jalan, atau patokan alamat"
              value={form.address_detail}
              onChange={(event) => setForm((current) => ({ ...current, address_detail: event.target.value }))}
            />

            <SelectField
              label="Status Hunian"
              required
              options={occupancyOptions}
              value={statusValue}
              onChange={(option) => {
                const occupied = option?.value === "true";

                setForm((current) => ({
                  ...current,
                  is_occupied: occupied,
                  resident_id: occupied ? current.resident_id : null,
                }));
              }}
              placeholder="Pilih status hunian"
              isClearable={false}
            />

            <SelectField
              label="Penghuni Aktif"
              required={form.is_occupied}
              options={residentOptions}
              value={selectedResidentValue}
              onChange={(option) =>
                setForm((current) => ({
                  ...current,
                  resident_id: option ? Number(option.value) : null,
                }))
              }
              placeholder={form.is_occupied ? "Pilih penghuni rumah" : "Pilih status dihuni dulu"}
              isDisabled={!form.is_occupied || residentLoading}
              helperText={
                form.is_occupied
                  ? "Saat status dihuni, pilih penghuni aktif agar history hunian tercatat otomatis."
                  : "Jika tidak dihuni, penghuni aktif akan dikosongkan dan history lama tetap tersimpan."
              }
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Menyimpan..." : form.id ? "Perbarui Rumah" : "Simpan Rumah"}
            </Button>
          </div>
        </form>

        <section className="rounded-3xl border border-white/70 bg-slate-950 p-6 text-white shadow-sm shadow-slate-300/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Ringkasan rumah terpilih</p>
              <h2 className="mt-1 text-xl font-semibold">
                {selectedHouse ? selectedHouse.house_number : "Belum ada rumah dipilih"}
              </h2>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 text-emerald-300">
              <CalendarClock size={20} />
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Status hunian</p>
              <p className="mt-1 text-lg font-semibold">
                {selectedHouse?.occupancy_status_label ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Penghuni aktif</p>
              <p className="mt-1 text-lg font-semibold">
                {selectedHouse?.current_resident?.fullname ?? "Tidak dihuni"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Alamat</p>
              <p className="mt-1 text-sm text-slate-200">
                {selectedHouse?.address_detail ?? "-"}
              </p>
            </div>
          </div>

          {detailLoading ? (
            <div className="mt-5 text-sm text-slate-300">Memuat detail rumah...</div>
          ) : null}
        </section>
      </div>

      <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Daftar Rumah</h2>
            <p className="text-sm text-slate-500">Gunakan tabel ini untuk edit data rumah atau membuka riwayat penghuni dan pembayaran.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <Users size={16} />
            {residentLoading ? "Memuat penghuni..." : `${residentOptions.length} penghuni tersedia`}
          </div>
        </div>

        <DataTable
          columns={columns}
          apiUrl="houses/datatables"
          enableServerSide={true}
          searchPlaceholder="Cari nomor rumah, alamat, atau penghuni..."
          datatableKey="table-rumah"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">History Penghuni</h2>
              <p className="text-sm text-slate-500">Catatan perpindahan penghuni pada rumah yang dipilih.</p>
            </div>
          </div>

          {occupancyHistory.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Penghuni</th>
                    <th className="px-4 py-3 text-left font-semibold">Mulai</th>
                    <th className="px-4 py-3 text-left font-semibold">Selesai</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {occupancyHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-slate-800">{item.resident_name ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(item.start_date)}</td>
                      <td className="px-4 py-3 text-slate-600">{item.end_date ? formatDate(item.end_date) : "Masih dihuni"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.is_active ? "Aktif" : "Riwayat"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Belum ada riwayat penghuni untuk rumah ini.
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">History Pembayaran</h2>
              <p className="text-sm text-slate-500">Menampilkan siapa yang harus membayar, nominal, dan status lunas atau belum.</p>
            </div>
          </div>

          {paymentHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Periode</th>
                    <th className="px-4 py-3 text-left font-semibold">Penghuni</th>
                    <th className="px-4 py-3 text-left font-semibold">Tipe</th>
                    <th className="px-4 py-3 text-left font-semibold">Nominal</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paymentHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {monthLabels[item.month - 1]} {item.year}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.resident_name ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{item.type}</td>
                      <td className="px-4 py-3 text-slate-600">{currencyFormatter.format(Number(item.amount))}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === "Lunas" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.paid_at ? (
                          <p className="mt-1 text-xs text-slate-400">Dibayar {formatDate(item.paid_at)}</p>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Belum ada history pembayaran untuk rumah ini.
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
};

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

export default MasterRumah;