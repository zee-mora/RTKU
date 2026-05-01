import React, { useCallback } from 'react';
import PageContainer from '../../../components/layout/PageContainer';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import DataTable from '../../../components/DataTable/DataTable';
import Button from '../../../components/ui/Button';
import FormPayment from './FormPayment';
import { useModal } from '../../../hooks/UseModal';

const MasterIuran: React.FC = () => {
  const { show, close } = useModal();

  const openAdd = useCallback(() => {
    show(<FormPayment onClose={() => close()} />, { title: 'Tambah Pembayaran', size: 'md' });
  }, [show, close]);

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: 'Master' }, { label: 'Iuran' }]} />

      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mengelola Pembayaran</h1>
        <div>
          <Button size="md" variant="primary" onClick={openAdd}>Tambah Pembayaran</Button>
        </div>
      </div>

      <DataTable
        columns={[
          { accessorKey: 'index', header: 'NO' },
          { accessorKey: 'resident_name', header: 'Penghuni' },
          { accessorKey: 'house_number', header: 'Rumah' },
          { accessorKey: 'type', header: 'Tipe' },
          { accessorKey: 'month', header: 'Bulan' },
          { accessorKey: 'year', header: 'Tahun' },
          { accessorKey: 'amount', header: 'Nominal' },
          { accessorKey: 'status', header: 'Status' },
        ]}
        apiUrl="payments/datatables"
        enableServerSide
        datatableKey="table-payments"
        searchPlaceholder="Cari pembayaran..."
      />
    </PageContainer>
  );
};

export default MasterIuran;
