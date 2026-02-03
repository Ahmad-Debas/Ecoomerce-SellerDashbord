import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit3, 
  Package,
  SlidersHorizontal
} from 'lucide-react';
import api from '../../services/api'; 
import { Link } from 'react-router-dom';

// --- Helper Functions ---
const getStatusStyle = (status) => {
  switch (status) {
    case 'in_stock': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'out_of_stock': return 'bg-red-100 text-red-700 border-red-200';
    case 'low_stock': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const formatStatus = (status) => {
  return status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-';
};

// --- API Fetch Function ---
const fetchInventory = async ({ page, search, status, stockLevel }) => {
  const params = { page };
  if (search) params.search = search;
  if (status) params.status = status;
  if (stockLevel) params.stock_level = stockLevel;

  const response = await api.get('/seller/inventory', { params });
  return response.data.data;
};

export default function Inventory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockLevelFilter, setStockLevelFilter] = useState('');

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', page, search, statusFilter, stockLevelFilter],
    queryFn: () => fetchInventory({ 
      page, 
      search, 
      status: statusFilter, 
      stockLevel: stockLevelFilter 
    }),
    keepPreviousData: true, 
  });

  const items = inventoryData?.items || [];
  const meta = inventoryData?.meta || {};

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); 
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1); 
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-4 md:p-6 font-sans text-slate-800 pb-20 md:pb-6">
      
      {/* --- Header --- */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
          <span>Home</span>
          <ChevronRight size={14} />
          <span className="text-teal-600 font-medium">Inventory</span>
        </div>
      </div>

      {/* --- Filters Section --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        
        {/* الحاوية الرئيسية: فلاتر فوق وبحث تحت في الموبايل */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          
          {/* 1. Filter Dropdowns (Stacked on Mobile) */}
          <div className="w-full md:w-auto">
             {/* التغيير هنا:
                flex-col: يرتبهم تحت بعض في الموبايل
                sm:flex-row: يرجعهم جنب بعض في الشاشات الأكبر شوية (اختياري، لو بدك يضلوا تحت بعض دائماً شيل sm:flex-row)
             */}
             <div className="flex flex-col sm:flex-row gap-3 w-full">
                
                {/* Status Filter */}
                <div className="relative w-full sm:w-auto">
                    <select 
                      value={statusFilter}
                      onChange={handleFilterChange(setStatusFilter)}
                      className="w-full sm:w-[160px] appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="">All Status</option>
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="low_stock">Low Stock</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {/* Stock Level Filter */}
                <div className="relative w-full sm:w-auto">
                    <select 
                      value={stockLevelFilter}
                      onChange={handleFilterChange(setStockLevelFilter)}
                      className="w-full sm:w-[160px] appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="">Stock Level</option>
                      <option value="low">Low</option>
                      <option value="out_of_stock">Empty</option>
                    </select>
                    <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
             </div>
          </div>

          {/* 2. Search Bar (Full width on mobile) */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search product name, SKU..." 
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-2.5 bg-teal-50/50 border border-teal-100 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>

        </div>
      </div>

      {/* --- Table Section (Horizontal Scroll) --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-10">
                <div className="h-full bg-blue-500 animate-progress origin-left-right"></div>
            </div>
        )}

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Product Name</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">SKU</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Brand</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Qty</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="py-6 px-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    <Package size={48} className="mx-auto mb-3 opacity-20" />
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                    
                    {/* Image & Name */}
                    <td className="py-4 px-6 min-w-[250px] max-w-[300px]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                               <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 line-clamp-1" title={item.product_name_en}>
                              {item.product_name_en}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.variant_label}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-600 font-mono whitespace-nowrap">{item.sku || '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">{item.category?.name_en}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">{item.brand?.name_en}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900 text-center whitespace-nowrap">{item.quantity}</td>
                    
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(item.status)}`}>
                        {formatStatus(item.status)}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/show-inventory/${item.id}`} className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition">
                          <Eye size={18} />
                        </Link>
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Edit3 size={18} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        {!isLoading && items.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center p-6 border-t border-gray-50 bg-white gap-4">
             <div className="text-sm text-gray-500">
                Page {page}
             </div>
             <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} className="p-2 border rounded hover:bg-gray-50"><ChevronLeft size={16}/></button>
                <button onClick={() => setPage(p => p+1)} className="p-2 border rounded hover:bg-gray-50"><ChevronRight size={16}/></button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}