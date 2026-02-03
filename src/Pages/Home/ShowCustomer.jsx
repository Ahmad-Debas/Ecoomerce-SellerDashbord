import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Mail, Phone, MapPin, Calendar, ArrowLeft, 
  Package, DollarSign, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../../services/api';

export default function ShowCustomer() {
  const { id } = useParams();
  const [page, setPage] = useState(1);

  const { data: customerData, isLoading: isCustomerLoading, isError: isCustomerError } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await api.get(`/seller/customers/${id}`);
      return res.data;
    },
  });

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['customer_orders', id, page],
    queryFn: async () => {
      const res = await api.get(`/seller/customers/${id}/orders`, {
        params: { page, per_page: 5 }
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const customer = customerData?.data;
  const orders = ordersData?.data?.items || [];
  const meta = ordersData?.data?.meta || {};

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-emerald-100 text-emerald-700',
      shipped: 'bg-blue-100 text-blue-700',
      approved: 'bg-indigo-100 text-indigo-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  if (isCustomerLoading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
    </div>
  );

  if (isCustomerError || !customer) return <div className="p-8 text-center text-red-500">Customer not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6 font-sans">
      
      {/* --- Header --- */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/customers" className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm shrink-0">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">Customer Details</h1>
          <p className="text-[10px] md:text-sm text-gray-500 truncate">
            Customers <span className="mx-0.5">/</span> <span className="text-teal-600 font-medium">Details</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* --- Customer Info Card (The one in your screenshot) --- */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-3 md:gap-4 mb-6 pb-6 border-b border-gray-50">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 text-base md:text-xl font-bold border border-teal-100 shrink-0 overflow-hidden">
              {customer.image ? <img src={customer.image} alt="Avatar" className="w-full h-full object-cover" /> : `${customer.first_name?.[0]}${customer.last_name?.[0]}`}
            </div>
            <div className="min-w-0">
              <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight break-words">
                {customer.first_name} {customer.last_name}
              </h3>
              <span className="inline-block px-2 py-0.5 mt-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                Active
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {/* Email - Fixed breaking issue */}
            <InfoItem 
              icon={<Mail size={14} />} 
              label="Email" 
              value={customer.email} 
              isBreakable 
            />
            
            <InfoItem 
              icon={<Phone size={14} />} 
              label="Phone Number" 
              value={customer.phone || 'N/A'} 
            />

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400 shrink-0"><MapPin size={14} /></div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shipping Address</p>
                {customer.default_address ? (
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed mt-0.5 whitespace-normal break-words">
                    {customer.default_address.building_no} {customer.default_address.address_line1}, {customer.default_address.city}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic mt-0.5">No address set</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <InfoItem 
                icon={<Calendar size={14} />} 
                label="Joined At" 
                value={formatDate(customer.joined_at)} 
              />
            </div>
          </div>
        </div>

        {/* --- Stats & Orders --- */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             <StatCard icon={<Package size={20} />} label="Total Orders" value={meta.total ?? customer.orders_count} color="blue" />
             <StatCard icon={<DollarSign size={20} />} label="Avg. Value" value={`${(orders.reduce((s, o) => s + parseFloat(o.amount), 0) / (orders.length || 1)).toFixed(2)} SAR`} color="teal" />
             <StatCard icon={<Clock size={20} />} label="Last Order" value={orders[0] ? formatDate(orders[0].date) : 'Never'} color="purple" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-sm md:text-lg font-bold text-gray-900">Orders History</h2>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{meta.total || 0} Total</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Order</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Total</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-gray-900">#{order.order_number}</td>
                      <td className="px-4 py-4 text-gray-500">{formatDate(order.date)}</td>
                      <td className="px-4 py-4 font-semibold text-teal-600">{order.amount} SAR</td>
                      <td className="px-4 py-4 text-right">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoItem({ icon, label, value, isBreakable = false }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-50 rounded-lg text-gray-400 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-xs md:text-sm font-semibold text-gray-900 mt-0.5 ${isBreakable ? 'break-all whitespace-normal' : 'truncate'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const themes = {
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600',
    purple: 'bg-purple-50 text-purple-600'
  };
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
      <div className={`p-2.5 rounded-xl shrink-0 ${themes[color]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{label}</p>
        <p className="text-base font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}