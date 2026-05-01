import React, { useEffect, useMemo, useState } from 'react';
import InputForm from '../../../components/ui/InputForm';
import SelectField from '../../../components/ui/SelectField';
import Button from '../../../components/ui/Button';
import api from '../../../api/axios';
import { showToast } from '../../../utils/alert';
import { triggerDatatableRefetch } from '../../../components/DataTable/DatatableRegistry';

type Option = { value: string; label: string };

const typeOptions: Option[] = [
  { value: 'Satpam', label: 'Satpam' },
  { value: 'Kebersihan', label: 'Kebersihan' },
];

const periodOptions: Option[] = [
  { value: '1', label: '1 bulan' },
  { value: '12', label: '12 bulan' },
];

const statusOptions: Option[] = [
  { value: 'Lunas', label: 'Lunas' },
  { value: 'Belum Bayar', label: 'Belum Bayar' },
];

type OccupancyOption = {
  id: number;
  label: string;
  house_number?: string | null;
  resident_name?: string | null;
};

const FormPayment: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [occupancies, setOccupancies] = useState<Option[]>([]);
  const [occupancyId, setOccupancyId] = useState<Option | null>(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<Option | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [periods, setPeriods] = useState<Option | null>(periodOptions[0]);
  const [status, setStatus] = useState<'Lunas'|'Belum Bayar'>('Lunas');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await api.get('/payments/options');
        const data = (res.data?.data ?? []) as OccupancyOption[];
        setOccupancies(
          data.map((item) => ({
            value: String(item.id),
            label: item.label,
          })),
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const chosenType = type?.value ?? null;
  const selectedPeriods = Number(periods?.value ?? '1');
  const totalAmount = useMemo(() => Number(amount || 0) * selectedPeriods, [amount, selectedPeriods]);
  const isAnnualEnabled = chosenType === 'Kebersihan';
  const effectivePeriods = chosenType === 'Satpam' ? 1 : selectedPeriods;
  const effectiveStatus: 'Lunas' | 'Belum Bayar' = effectivePeriods > 1 ? 'Lunas' : status;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/payments', {
        trhouse_resident_id: Number(occupancyId?.value),
        amount: Number(amount),
        type: type?.value,
        month,
        year,
        periods: effectivePeriods,
        status: effectiveStatus,
        paid_at: effectiveStatus === 'Lunas' ? new Date().toISOString() : null,
      });

      showToast('success', 'Berhasil', 'Pembayaran berhasil dicatat.');
      triggerDatatableRefetch('table-payments');
      onClose?.();
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal', 'Tidak dapat menyimpan pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField
        label="Pilih Rumah / Penghuni Aktif"
        required
        options={occupancies}
        value={occupancyId}
        onChange={(val) => setOccupancyId(val)}
        placeholder="Cari rumah dan penghuni"
      />

      <InputForm label="Nominal" required value={amount} onChange={(e) => setAmount(e.target.value)} />

      <SelectField
        label="Tipe Iuran"
        options={typeOptions}
        value={type}
        onChange={(v) => {
          setType(v);
          if (v?.value === 'Satpam') {
            setPeriods(periodOptions[0]);
          }
        }}
        isClearable={false}
      />

      <SelectField
        label="Periode Pembayaran"
        options={periodOptions}
        value={periods}
        onChange={(v) => setPeriods(v ?? periodOptions[0])}
        isClearable={false}
        isDisabled={!isAnnualEnabled}
        helperText={
          chosenType === 'Satpam'
            ? 'Iuran satpam dibayar bulanan.'
            : 'Pilih 12 bulan untuk pembayaran kebersihan 1 tahun.'
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <InputForm label="Bulan (1-12)" type="number" value={String(month)} onChange={(e) => setMonth(Number(e.target.value))} />
        <InputForm label="Tahun" type="number" value={String(year)} onChange={(e) => setYear(Number(e.target.value))} />
      </div>

      <SelectField
        label="Status"
        options={statusOptions}
        value={{ value: effectiveStatus, label: effectiveStatus }}
        onChange={(v) => setStatus((v?.value ?? 'Belum Bayar') as 'Lunas'|'Belum Bayar')}
        isClearable={false}
        isDisabled={effectivePeriods > 1}
        helperText={effectivePeriods > 1 ? 'Pembayaran 1 tahun harus lunas.' : undefined}
      />

      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Total tagihan yang dicatat: <span className="font-semibold">Rp{totalAmount.toLocaleString('id-ID')}</span>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => onClose?.()} disabled={loading}>Batal</Button>
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </form>
  );
};

export default FormPayment;
