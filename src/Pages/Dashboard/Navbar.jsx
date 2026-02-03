import { useEffect, useState } from "react";
import { HiMenu , HiBell, HiSearch } from "react-icons/hi";

export default function Navbar({ onMenuClick }) {
  const [user, setUser] = useState({ first_name: "Guest", email: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10"> {/* قللنا الـ px في الموبايل */}
      
      {/* 1. Left Section: Hamburger & Search */}
      <div className="flex items-center gap-4">
        {/* زر القائمة للموبايل */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <HiMenu size={26} />
        </button>

        {/* البحث (يظهر فقط في الكمبيوتر) */}
        <div className="hidden md:flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg w-64">
           <HiSearch size={20} />
           <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm w-full" />
        </div>
      </div>

      {/* 2. Middle Section: Page Title (تعديل: إخفاؤه في الموبايل لتوفير المساحة) */}
      <div className="hidden md:block"> {/* <--- أضفنا hidden md:block */}
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Hello, Welcome Back</p>
      </div>

      {/* في الموبايل، ممكن نظهر اللوجو أو اسم التطبيق في النص بدل العنوان الكبير (اختياري) */}
      <div className="md:hidden font-bold text-gray-700 text-lg">
        Seller<span className="text-teal-600">App</span>
      </div>

      {/* 3. Right Section: Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-teal-600 transition-colors">
          <HiBell size={24} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Profile Section */}
        <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-700">{user.first_name}</p>
            <p className="text-xs text-gray-400 truncate max-w-[150px]">{user.email}</p>
          </div>
          
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer">
            <img 
               src={user.image || "https://ui-avatars.com/api/?name=" + user.first_name}
               alt="Profile" 
               className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}