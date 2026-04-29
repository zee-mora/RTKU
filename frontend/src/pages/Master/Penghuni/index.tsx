import { useMemo } from "react";
import PageContainer from "../../../components/layout/PageContainer";
import DataTable from "../../../components/DataTable/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import Button from "../../../components/ui/Button";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Resident = {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  house_number: string;
  status: "aktif" | "nonaktif";
};

const MasterPenghuni = () => {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<Resident>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "fullname",
        header: "Nama Penghuni",
      },
      {
        accessorKey: "resident_status",
        header: "Status Penghuni",
      },
      {
        accessorKey: "phone_number",
        header: "No. Telepon",
      },
      {
        accessorKey: "marital_status",
        header: "Status Perkawinan",
      },
      {
        accessorKey: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button size="sm" variant="secondary" onClick={() => handleEditPenghuni(row.original.id)}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => alert(`Hapus ${row.original.fullname}`)}>
              Hapus
            </Button>
          </div>
        ),
      }
    ],
    [],
  );
  function handleEditPenghuni(id: number) {
    navigate(`/master/penghuni/edit/${id}`);
  }

  function handleAddPenghuni()
  {
    navigate("/master/penghuni/add");
  }

  return (
    <>
      <PageContainer>
        <Breadcrumb items={[{ label: "Master" }, { label: "Penghuni" }]} />

        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Penghuni</h1>
          <div className="">
            <Button size="md" variant="primary" Icon={Plus} onClick={handleAddPenghuni}>
              Tambah
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          apiUrl="http://localhost:8000/api/residents/datatables"
          enableServerSide={true}
          searchPlaceholder="Cari data dari backend..."
        />
      </PageContainer>
    </>
  );
};

export default MasterPenghuni;
