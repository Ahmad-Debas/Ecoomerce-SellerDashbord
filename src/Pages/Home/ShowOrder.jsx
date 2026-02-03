import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronRight, MapPin, Phone, Mail, CreditCard, Truck, 
  User, Clock, Calendar, Printer, Package, ArrowLeft
} from 'lucide-react';
import api from '../../services/api';

// --- Helper Functions ---
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-GB');
};

const formatTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'bg-green-100 text-green-700 border border-green-200';
    case 'shipped': return 'bg-orange-100 text-orange-600 border border-orange-200';
    case 'pending': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    case 'cancelled': return 'bg-red-100 text-red-700 border border-red-200';
    case 'approved': return 'bg-green-100 text-green-700 border border-green-200';
    default: return 'bg-gray-100 text-gray-600 border border-gray-200';
  }
};

export default function ShowOrder() {
  const { id } = useParams();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/seller/orders/${id}`);
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

  if (isError || !order) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FD] gap-4">
            <div className="text-red-500 font-semibold">Error loading order details.</div>
            <Link to="/seller/orders" className="text-teal-600 hover:underline">Go Back</Link>
        </div>
    );
  }

  const addr = order.shipping_address || {};
  const customer = order.customer || {};

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-4 md:p-6 font-sans text-slate-800 pb-20 md:pb-6">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
                <Link to="/seller/orders" className="p-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition md:hidden">
                    <ArrowLeft size={18} className="text-gray-500"/>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
           </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <Link to="/seller/dashboard" className="hover:text-teal-600">Home</Link>
            <ChevronRight size={14} />
            <Link to="/seller/orders" className="hover:text-teal-600">Orders</Link>
            <ChevronRight size={14} />
            <span className="text-teal-600 font-medium text-xs md:text-sm">#{order.order_number}</span>
          </div>
        </div>
        
        <button 
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition shadow-sm"
            onClick={() => window.print()}
        >
            <Printer size={18} /> Print Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* 1. Order Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Info</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Order ID</span>
                        <span className="font-bold text-gray-900">#{order.order_number}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium text-gray-900 flex items-center gap-2">
                             <Calendar size={14} className="text-teal-500"/> {formatDate(order.created_at)}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Time</span>
                        <span className="font-medium text-gray-900 flex items-center gap-2">
                             <Clock size={14} className="text-teal-500"/> {formatTime(order.created_at)}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Status</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusStyle(order.status)}`}>
                            {order.status?.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Customer Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Customer</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <User size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Name</p>
                            <p className="font-medium text-gray-900 text-sm truncate">{customer.name || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                            <Mail size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Email</p>
                            <p className="font-medium text-gray-900 text-sm truncate">{customer.email || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                            <Phone size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Phone</p>
                            <p className="font-medium text-gray-900 text-sm truncate" dir="ltr">{customer.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Address</h2>
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
                        <MapPin size={16} />
                    </div>
                    <div className="text-sm">
                         {addr.id ? (
                            <>
                                <span className="block font-bold text-xs text-teal-600 mb-1 uppercase">{addr.label || 'Home'}</span>
                                <p className="text-gray-800 leading-snug break-words">
                                    {addr.building_no} {addr.address_line1}
                                </p>
                                {addr.address_line2 && <p className="text-gray-600 text-xs mt-0.5">{addr.address_line2}</p>}
                                <p className="text-gray-600 text-xs mt-1">{addr.city}, {addr.state}</p>
                                <p className="text-gray-500 text-xs">{addr.country_name_en} - {addr.postal_code}</p>
                            </>
                        ) : (
                            <p className="text-gray-500 italic">No address provided</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 4. Items List (FIXED FOR MOBILE) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Items ({order.items?.length || 0})</h2>
                    <span className="text-[10px] md:text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                        Total Qty: {order.items?.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                </div>
                
                <div className="divide-y divide-gray-50">
                    {order.items?.map((item, index) => (
                        <div key={item.id || index} className="py-4 first:pt-0">
                            <div className="flex gap-3 md:gap-4">
                                {/* Image - Fixed Size */}
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-white border border-gray-200 p-1 flex-shrink-0 flex items-center justify-center">
                                    {item.image ? (
                                        <img src={item.image} alt={item.product_name_en} className="w-full h-full object-contain mix-blend-multiply" />
                                    ) : (
                                        <Package className="text-gray-300" size={24} />
                                    )}
                                </div>

                                {/* Content Wrapper - Flex Grow */}
                                <div className="flex-1 min-w-0">
                                    {/* Top Row: Name (Left) + Price (Right) */}
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                                            {item.product_name_en}
                                        </h3>
                                        {/* Price Fixed - No Wrap */}
                                        <div className="font-bold text-gray-900 text-sm whitespace-nowrap">
                                            {Number(item.total_price || (item.unit_price * item.quantity)).toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">SAR</span>
                                        </div>
                                    </div>
                                    
                                    {/* SKU */}
                                    <p className="text-[10px] text-gray-400 font-mono mb-2">SKU: {item.variant_sku || '-'}</p>

                                    {/* Badges Row */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                            x{item.quantity}
                                        </span>
                                        
                                        {item.color && (
                                            <span className="flex items-center gap-1 text-[10px] text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {item.color}
                                            </span>
                                        )}
                                        {item.size && (
                                            <span className="text-[10px] text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                                Size: {item.size}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Billing */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Payment</h2>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Method */}
                    <div className="w-full md:w-1/2 space-y-3">
                         <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded shadow-sm text-teal-600">
                                <CreditCard size={20} /> 
                            </div>
                            <span className="text-sm font-medium text-gray-900">Cash / Credit Card</span>
                         </div>
                    </div>

                    {/* Totals */}
                    <div className="w-full md:w-1/2 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Sub Total</span>
                            <span className="font-medium text-gray-900">{Number(order.total_amount - (order.shipping_cost || 0)).toLocaleString()} SAR</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Shipping</span>
                            <span className="font-medium text-gray-900">{Number(order.shipping_cost || 0).toLocaleString()} SAR</span>
                        </div>
                        
                        <div className="border-t border-dashed border-gray-200 mt-4 pt-3 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-xl text-teal-600">
                                {Number(order.total_amount).toLocaleString()} <span className="text-xs text-gray-500">SAR</span>
                            </span>
                        </div>

                        <button 
                            className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-teal-100 transition flex items-center justify-center gap-2"
                            onClick={() => console.log('Process')}
                        >
                            <Truck size={18} /> Process Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}