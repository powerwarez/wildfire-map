import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <div 
        className={`transition-all duration-300 ease-in-out flex-1 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 