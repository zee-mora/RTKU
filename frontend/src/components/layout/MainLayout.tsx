import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import Navbar from '../ui/Navbar';

const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-emerald-50/50">
      {/* Sidebar tetap di sini */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Navbar tetap di atas (jika ada) */}
        <Navbar />

        {/* Isi konten halaman yang berubah-ubah ada di Outlet */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;