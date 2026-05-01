import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import Navbar from '../ui/Navbar';

const MainLayout: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className="flex min-h-screen bg-emerald-50/50">
      {sidebarVisible && <Sidebar />}

      <div className="flex-1 flex flex-col">
        <Navbar onToggleSidebar={() => setSidebarVisible((s) => !s)} sidebarVisible={sidebarVisible} />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;