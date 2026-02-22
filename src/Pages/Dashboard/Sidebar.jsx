import { NavLink, useNavigate } from "react-router-dom";
import { 
  HiHome, HiShoppingCart, HiCube, HiUsers, 
  HiTicket, HiCreditCard, HiDocumentReport, 
  HiCog, HiLogout, HiQuestionMarkCircle, HiX 
} from "react-icons/hi"; 
import { MdInventory } from "react-icons/md";

// استقبال props للتحكم في الفتح والاغلاق
export default function Sidebar({ isOpen, closeSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const menuItems = [
    { path: "/dashboard", name: "Dashboard", icon: <HiHome size={22} /> },
    { path: "/products", name: "Products", icon: <HiCube size={22} /> },
    { path: "/orders", name: "Orders", icon: <HiShoppingCart size={22} /> },
    { path: "/inventory", name: "Inventory", icon: <MdInventory size={22} /> },
    { path: "/customers", name: "Customers", icon: <HiUsers size={22} /> },
    { path: "/customers-two", name: "Customers Two", icon: <HiUsers size={22} /> },
    { path: "/promotions", name: "Promotions", icon: <HiTicket size={22} /> },
    { path: "/payments", name: "Payments", icon: <HiCreditCard size={22} /> },
    { path: "/profile", name: "Company Profile", icon: <HiDocumentReport size={22} /> },
    { path: "/coupons", name: "Coupons", icon: <HiTicket size={22} /> },
    { path: "/settings", name: "Settings", icon: <HiCog size={22} /> },
  ];

  return (
    <>
      {/* 1. Mobile Overlay (الخلفية السوداء عند الفتح) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* 2. Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:inset-auto h-screen
        `}
      >
        
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
             <span className="text-xl font-bold text-gray-800">Seller-Controll</span>
          </div>
          
          {/* زر إغلاق (يظهر فقط في الموبايل) */}
          <button onClick={closeSidebar} className="md:hidden text-gray-500 hover:text-red-500 transition">
            <HiX size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar} // إغلاق القائمة عند اختيار صفحة في الموبايل
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? "bg-teal-50 text-teal-600 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-50 space-y-2 flex-shrink-0">
          <NavLink to="/help" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
              <HiQuestionMarkCircle size={22} />
              <span>Help</span>
          </NavLink>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <HiLogout size={22} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}