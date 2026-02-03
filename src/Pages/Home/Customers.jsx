import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, ChevronLeft, ChevronRight, 
  MapPin, Package, Mail, Phone
} from 'lucide-react';
import { HiEye } from "react-icons/hi";
import api from '../../services/api'; 
import { Link } from 'react-router-dom';

// --- Debounce Hook ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Customers() {
  const [page, setPage] = useState(1); 
  const [search, setSearch] = useState('');
  
  const debouncedSearch = useDebounce(search, 800); 

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: customerData, isLoading, isError } = useQuery({
    queryKey: ['customers', page, debouncedSearch], 
    queryFn: async () => {
      const response = await api.get(`/seller/customers`, {
        params: { page, search: debouncedSearch || undefined, per_page: 10 }
      });
      return response.data;
    },
    keepPreviousData: true,
  });

  const customers = customerData?.data?.items || [];
  const meta = customerData?.data?.meta || {};

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  if (isLoading && !customers.length) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
    </div>
  );

  if (isError) return <div className="p-6 text-center text-red-500">Error loading customers.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6 font-sans">
      
      {/* --- Header --- */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Customers</h1>
        <div className="text-xs md:text-sm text-gray-500 mt-1">
          Home <span className="mx-1">&gt;</span> <span className="text-teal-600 font-medium">Customers</span>
        </div>
      </div>

      {/* --- Search Bar --- */}
      <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 mb-6 transition-all">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- Table for Desktop / Cards for Mobile --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Location</th>
                <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Orders</th>
                <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right pr-8">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition duration-150">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold border border-teal-100 shrink-0">
                        {customer.image ? <img src={customer.image} className="w-full h-full object-cover rounded-full" /> : getInitials(customer.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{customer.name}</p>
                        <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-600 truncate">
                    {customer.default_address ? `${customer.default_address.city}, ${customer.default_address.country_name_en}` : 'N/A'}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-bold">
                      {customer.orders_count}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <Link className="inline-flex p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition" to={`/show-customer/${customer.id}`}>
                      <HiEye size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (Hidden on Desktop) */}
        <div className="md:hidden divide-y divide-gray-100">
          {customers.length > 0 ? customers.map((customer) => (
            <div key={customer.id} className="p-4 hover:bg-gray-50 active:bg-gray-100 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold border border-teal-100 shrink-0 shadow-sm">
                    {customer.image ? <img src={customer.image} className="w-full h-full object-cover rounded-full" /> : getInitials(customer.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{customer.name}</p>
                    <div className="flex items-center gap-1 text-gray-500">
                       <Mail size={12} />
                       <p className="text-[11px] truncate">{customer.email}</p>
                    </div>
                  </div>
                </div>
                <Link to={`/show-customer/${customer.id}`} className="p-2 bg-teal-50 text-teal-700 rounded-lg shrink-0">
                  <HiEye size={18} />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin size={13} className="text-gray-400" />
                  <span className="text-[11px] truncate">
                    {customer.default_address?.city || 'No Location'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 justify-end">
                  <Package size={13} className="text-gray-400" />
                  <span className="text-[11px] font-bold">{customer.orders_count} Orders</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-gray-400 text-sm">No customers found</div>
          )}
        </div>

        {/* --- Pagination --- */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-medium text-gray-500">
            Showing {customers.length} of {meta.total || 0}
          </span>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setPage(old => Math.max(old - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30 transition shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg border border-teal-100 min-w-[32px] text-center">
              {page}
            </span>

            <button 
              onClick={() => setPage(old => (old < meta.last_page ? old + 1 : old))}
              disabled={page === meta.last_page || !meta.last_page}
              className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30 transition shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}