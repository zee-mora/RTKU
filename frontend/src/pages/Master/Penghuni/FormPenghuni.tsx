import React, { useEffect, useState } from "react";
import PageContainer from "../../../components/layout/PageContainer";
import Button from "../../../components/ui/Button";
import DropzoneField from "../../../components/ui/DropzoneField.tsx";
import InputForm from "../../../components/ui/InputForm";
import SelectField from "../../../components/ui/SelectField";
import type { Option } from "../../../components/ui/SelectField";
import api from "../../../api/axios";
import { showToast } from "../../../utils/alert";
import { useNavigate, useParams } from "react-router-dom";

type ResidentPayload = {
  id?: number;
  fullname?: string;
  phone_number?: string;
  resident_status?: string;
  marital_status?: string;
  ktp_path?: string | null;
  photo_url?: string | null;
};

interface FormPenghuniProps {
  initialData?: ResidentPayload | null;
}

const FormPenghuni: React.FC<FormPenghuniProps> = ({ initialData = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const residentId = id ? Number(id) : initialData?.id ?? null;
  const isEditMode = Boolean(residentId);

  const [photo, setPhoto] = useState<File | null>(null);
  const [fullname, setFullname] = useState(initialData?.fullname ?? "");
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phone_number ?? "");
  const [residentStatus, setResidentStatus] = useState<string | null>(initialData?.resident_status ?? null);
  const [maritalStatus, setMaritalStatus] = useState<string | null>(initialData?.marital_status ?? null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(initialData?.photo_url ?? null);
  const [initialLoading, setInitialLoading] = useState(Boolean(residentId));
  const [loading, setLoading] = useState(false);

  const StatusPernikahanOptions = [
    { value: "Belum Menikah", label: "Belum Menikah" },
    { value: "Sudah Menikah", label: "Sudah Menikah" },
  ];

  const StatusPenghuniOptions = [
    { value: "Tetap", label: "Tetap" },
    { value: "Kontrak", label: "Kontrak" },
  ];

  useEffect(() => {
    if (!residentId || initialData) {
      return;
    }

    const fetchResident = async () => {
      setInitialLoading(true);

      try {
        const response = await api.get(`/residents/${residentId}`);
        const resident = (response.data?.data ?? response.data) as ResidentPayload;

        setFullname(resident.fullname ?? "");
        setPhoneNumber(resident.phone_number ?? "");
        setResidentStatus(resident.resident_status ?? null);
        setMaritalStatus(resident.marital_status ?? null);
        setExistingPhotoUrl(resident.photo_url ?? null);
      } catch (err) {
        console.error(err);
        showToast('error', 'Gagal', 'Data penghuni tidak ditemukan atau gagal dimuat.');
        navigate('/master/penghuni');
      } finally {
        setInitialLoading(false);
      }
    };

    void fetchResident();
  }, [residentId, initialData, navigate]);

  const findOption = (opts: Option[], value?: string | null) => {
    if (!value) return null;
    return opts.find((o) => o.value === value) ?? null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('phone_number', phoneNumber);
      formData.append('resident_status', residentStatus ?? 'Tetap');
      formData.append('marital_status', maritalStatus ?? 'Belum Menikah');
      if (photo) {
        formData.append('photo', photo);
      }

      if (residentId) {
        formData.append('_method', 'PUT');

        await api.post(`/residents/${residentId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('success', 'Berhasil', 'Data penghuni berhasil diperbarui.');
      } else {
        await api.post('/residents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('success', 'Berhasil', 'Penghuni berhasil ditambahkan.');
      }

      navigate('/master/penghuni');
    } catch (err: unknown) {
      console.error(err);
      let message = 'Terjadi kesalahan saat menyimpan data.';
      if (typeof err === 'object' && err !== null) {
        const maybeErr = err as Record<string, unknown>;
        const response = maybeErr['response'] as Record<string, unknown> | undefined;
        const data = response?.['data'] as Record<string, unknown> | undefined;
        const msg = data?.['message'] as string | undefined;
        if (msg) {
          message = msg;
        } else if (typeof maybeErr['message'] === 'string') {
          message = maybeErr['message'] as string;
        }
      }
      showToast('error', 'Gagal', String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Penghuni' : 'Tambah Penghuni'}</h1>
        <p className="text-gray-500">
          {isEditMode
            ? 'Perbarui data penghuni yang sudah tersimpan di sistem.'
            : 'Lengkapi data penghuni baru untuk sistem pengelolaan rumah.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl bg-white">
        {/* Form Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <InputForm
            type="text"
            label="Nama Lengkap"
            required
            placeholder="Masukkan nama lengkap"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />

          <InputForm
            type="text"
            label="No. HP"
            required
            placeholder="Masukkan nomor HP"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <SelectField
            label="Status Pernikahan"
            required
            options={StatusPernikahanOptions}
            value={findOption(StatusPernikahanOptions, maritalStatus)}
            onChange={(val) => setMaritalStatus(val?.value ?? null)}
          />

          <SelectField
            label="Status Penghuni"
            required
            options={StatusPenghuniOptions}
            value={findOption(StatusPenghuniOptions, residentStatus)}
            onChange={(val) => setResidentStatus(val?.value ?? null)}
          />

          <div className="md:col-span-2">
            <DropzoneField
              label="Foto"
              required
              value={photo}
              previewUrl={existingPhotoUrl}
              onFileChange={setPhoto}
              helperText="Format gambar yang didukung: PNG, JPG, JPEG, WEBP, GIF."
            />
          </div>
        </div>

        {initialLoading ? (
          <div className="px-1 pt-2 text-sm text-gray-500">Memuat data penghuni...</div>
        ) : null}

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Menyimpan...' : isEditMode ? 'Perbarui Data' : 'Simpan Data'}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
};

export default FormPenghuni;
