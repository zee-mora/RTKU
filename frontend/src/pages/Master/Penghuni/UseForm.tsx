import React, { useState, useEffect } from "react";
import { showToast } from "../../../utils/alert";
import api from "../../../api/axios";
import { useNavigate, useParams } from "react-router-dom";

type option = {
  value: string;
  label: string;
};

type ResidentPayload = {
  id?: number;
  fullname?: string;
  phone_number?: string;
  resident_status?: string;
  marital_status?: string;
  ktp_path?: string | null;
  photo_url?: string | null;
};

interface UseFromPenghuniProps {
  initialData?: ResidentPayload | null;
}

const useFormPenghuni = ({ initialData }: UseFromPenghuniProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const residentId = id ? Number(id) : (initialData?.id ?? null);
  const isEditMode = Boolean(residentId);

  const [photo, setPhoto] = useState<File | null>(null);
  const [fullname, setFullname] = useState(initialData?.fullname ?? "");
  const [phoneNumber, setPhoneNumber] = useState(
    initialData?.phone_number ?? "",
  );
  const [residentStatus, setResidentStatus] = useState<string | null>(
    initialData?.resident_status ?? null,
  );
  const [maritalStatus, setMaritalStatus] = useState<string | null>(
    initialData?.marital_status ?? null,
  );
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(
    initialData?.photo_url ?? null,
  );
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
      } finally {
        setInitialLoading(false);
      }
    };

    void fetchResident();
  }, [residentId, initialData]);

  const findOption = (opts: option[], value: string | null) => {
    return opts.find((opt) => opt.value === value) ?? null;
};

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullname", fullname);
      formData.append("phone_number", phoneNumber);
      if (residentStatus) formData.append("resident_status", residentStatus);
      if (maritalStatus) formData.append("marital_status", maritalStatus);
      if (photo) formData.append("photo", photo);

      if (isEditMode && residentId) {
        await api.post(`/residents/${residentId}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast('success', 'Berhasil', 'Data penghuni berhasil diperbarui.');
      } else {
        await api.post("/residents", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast('success', 'Berhasil', 'Data penghuni berhasil ditambahkan.');
      }
      navigate("/master/penghuni");
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan data penghuni.');
    } finally {
      setLoading(false);
    }
  } 

  return {
    residentId,
    isEditMode,
    photo,
    setPhoto,
    fullname,
    setFullname,
    phoneNumber,
    setPhoneNumber,
    residentStatus,
    setResidentStatus,
    maritalStatus,
    setMaritalStatus,
    existingPhotoUrl,
    setExistingPhotoUrl,
    initialLoading,
    loading,
    navigate,
    StatusPernikahanOptions,
    StatusPenghuniOptions,
    findOption,
    handleSubmit,
  };
};

export default useFormPenghuni;
