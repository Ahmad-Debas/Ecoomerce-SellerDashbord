import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Pages/Dashboard/Sidebar.jsx";
import Navbar from "../Pages/Dashboard/Navbar.jsx";

export default function DashboardLayout() {
  // 1. حالة للتحكم في القائمة (مفتوحة أو مغلقة)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* 2. تمرير الحالة ووظيفة الإغلاق للسايدبار */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeSidebar={() => setIsSidebarOpen(false)} 
      />

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* 3. تمرير وظيفة الفتح للنافبار (عشان زر القائمة يشتغل) */}
        <Navbar 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      
      </div>
    </div>
  );
}