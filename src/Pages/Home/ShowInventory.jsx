import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronRight, 
  Package, 
  Layers, 
  Tag, 
  Hash, 
  ArrowLeft,
  History,
  User,
  Calendar
} from 'lucide-react';
import api from '../../services/api';

// --- Helper Functions ---
const getStatusStyle = (status) => {
  switch (status) {
    case 'in_stock': return 'bg-emerald-100 text-emerald-700';
    case 'out_of_stock': return 'bg-red-100 text-red-700';
    case 'low_stock': return 'bg-orange-100 text-orange-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const formatStatus = (status) => {
    return status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-';
};

export default function ShowInventory() {
  const { id } = useParams();

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['inventory-item', id],
    queryFn: async () => {
      const res = await api.get(`/seller/inventory/${id}`);
      return res.data.data;
    },
    staleTime: 1000 * 60,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (isError || !item) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FD] gap-4">
            <div className="text-red-500 font-semibold">Error loading inventory details.</div>
            <Link to="/seller/inventory" className="text-teal-600 hover:underline">Go Back</Link>
        </div>
    );
  }

  return (
    // التعديل 1: Padding متجاوب ومسافة سفلية للموبايل
    <div className="min-h-screen bg-[#F8F9FD] p-4 md:p-6 font-sans text-slate-800 pb-20 md:pb-6">
      
      {/* --- Header --- */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-4 mb-2">
            <Link to="/seller/inventory" className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <ArrowLeft size={20} className="text-gray-500"/>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Inventory Details</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 ml-1">
          <Link to="/seller/dashboard" className="hover:text-teal-600">Home</Link>
          <ChevronRight size={14} />
          <Link to="/seller/inventory" className="hover:text-teal-600">Inventory</Link>
          <ChevronRight size={14} />
          <span className="text-teal-600 font-medium break-all">{item.sku}</span>
        </div>
      </div>

      {/* --- Top Section: 2 Columns --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        
        {/* 1. Product Info Card */}
        {/* التعديل 2: تقليل الـ padding الداخلي للكارد في الموبايل */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Product Info</h2>
            
            {/* التعديل 3: الصورة والاسم فوق بعض بالموبايل (flex-col) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
                 {/* Product Image */}
                 <div className="w-24 h-24 rounded-xl bg-gray-50 border border-gray-100 p-1 flex-shrink-0">
                    <img 
                        src={item.image || "https://via.placeholder.com/100"} 
                        alt="Product" 
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>
                <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold text-gray-900">{item.product_name_en}</h3>
                      <p className="text-gray-500 font-arabic text-sm mt-1">{item.product_name_ar}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Hash size={16} /> Code (SKU)
                    </span>
                    <span className="font-semibold text-gray-900">{item.sku}</span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Layers size={16} /> Category
                    </span>
                    <span className="font-semibold text-gray-900">{item.category?.name_en}</span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Tag size={16} /> Brand
                    </span>
                    <span className="font-semibold text-gray-900">{item.brand?.name_en}</span>
                </div>
            </div>
        </div>

        {/* 2. Inventory Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Inventory Info</h2>
            
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <span className="text-sm font-medium text-gray-500">Total Quantity</span>
                    <span className="font-bold text-xl text-gray-900">{item.quantity}</span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <span className="text-sm font-medium text-gray-500">Current Price</span>
                    <span className="font-bold text-gray-900">{Number(item.price).toLocaleString()} SAR</span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <span className="text-sm font-medium text-gray-500">Variant</span>
                    <div className="flex items-center gap-2">
                        {item.color && (
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs font-semibold text-gray-700 border border-gray-200">
                                <span className="w-3 h-3 rounded-full border border-gray-300" style={{backgroundColor: item.color.code}}></span>
                                {item.color.name_en}
                            </span>
                        )}
                        {item.size && (
                            <span className="bg-gray-50 px-2 py-1 rounded text-xs font-semibold text-gray-700 border border-gray-200">
                                {item.size.name_en}
                            </span>
                        )}
                         {!item.color && !item.size && <span className="text-gray-400 text-sm">-</span>}
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize ${getStatusStyle(item.status)}`}>
                        {formatStatus(item.status)}
                    </span>
                </div>
            </div>
        </div>

      </div>

      {/* --- Bottom Section: History --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Inventory History Log</h2>
        
        {/* التعديل 4: تفعيل السكرول الأفقي للجدول */}
        <div className="overflow-x-auto no-scrollbar">
            {/* التعديل 5: تحديد أقل عرض للجدول للحفاظ على التنسيق */}
            <table className="w-full text-left min-w-[700px]">
                <thead className="bg-gray-50 text-gray-500">
                    <tr>
                        <th className="py-4 px-6 rounded-l-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap">Event</th>
                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider whitespace-nowrap">User</th>
                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider whitespace-nowrap">Date</th>
                        <th className="py-4 px-6 rounded-r-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap">Changes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {item.history && item.history.length > 0 ? (
                        item.history.map((log, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 transition">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                                            <History size={14} />
                                        </div>
                                        <span className="font-medium text-gray-700 capitalize">{log.event}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-600 whitespace-nowrap">{log.user}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-600 whitespace-nowrap">{log.date}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">
                                    <div className="flex flex-wrap gap-2">
                                        {log.new_values.quantity && (
                                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs border border-gray-200">
                                                Qty: {log.new_values.quantity}
                                            </span>
                                        )}
                                        {log.new_values.price && (
                                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs border border-gray-200">
                                                Price: {log.new_values.price}
                                            </span>
                                        )}
                                        {log.new_values.status && (
                                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs border border-gray-200">
                                                Status: {log.new_values.status}
                                            </span>
                                        )}
                                        {Object.keys(log.new_values).length === 0 && <span>-</span>}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="py-8 text-center text-gray-400">No history available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
}