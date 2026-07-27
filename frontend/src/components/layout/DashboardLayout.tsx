import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setisOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
