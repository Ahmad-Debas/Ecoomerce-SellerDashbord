import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { 
  ShoppingBag, Users, DollarSign, Package, Clock, CheckCircle, XCircle, 
  TrendingUp, Calendar, ArrowRight, MoreHorizontal 
} from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

// --- Helper: Format Currency ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// --- Helper: Status Badge ---
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    approved: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    returned: 'bg-gray-100 text-gray-700',
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

export default function Home() {
  const [period, setPeriod] = useState('daily');

  // 1. Fetch Summary Stats
  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => (await api.get('/seller/dashboard/summary')).data.data
  });

  // 2. Fetch Sales Chart
  const { data: salesData } = useQuery({
    queryKey: ['dashboard-sales', period],
    queryFn: async () => (await api.get(`/seller/dashboard/charts/sales?period=${period}`)).data.data
  });

  // 3. Fetch Top Products
  const { data: topProducts } = useQuery({
    queryKey: ['dashboard-products', period],
    queryFn: async () => (await api.get(`/seller/dashboard/charts/products?period=${period}`)).data.data
  });

  // 4. Fetch Customers
  const { data: customers } = useQuery({
    queryKey: ['dashboard-customers'],
    queryFn: async () => (await api.get('/seller/dashboard/charts/customers')).data.data
  });

  // 5. Fetch Recent Orders
  const { data: recentOrders } = useQuery({
    queryKey: ['dashboard-recent-orders'],
    queryFn: async () => (await api.get('/seller/dashboard/orders/recent')).data.data.items
  });

  // --- Stat Cards Configuration ---
  const statCards = [
    { label: 'Total Revenue', value: '$12,450', icon: DollarSign, color: 'bg-emerald-500' }, // Static for demo or sum from API
    { label: 'Pending Orders', value: summary?.pending || 0, icon: Clock, color: 'bg-orange-500' },
    { label: 'Processing', value: summary?.processing || 0, icon: Package, color: 'bg-blue-500' },
    { label: 'Delivered', value: summary?.delivered || 0, icon: CheckCircle, color: 'bg-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-4 md:p-6 font-sans pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening with your store.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                period === p ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* 2. Sales Analytics Chart (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Sales Analytics</h2>
              <p className="text-xs text-gray-400">Revenue over time</p>
            </div>
            <TrendingUp className="text-teal-500" size={20} />
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} 
                  axisLine={false}
                  tickLine={false}
                  tick={{fontSize: 12, fill: '#9ca3af'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{fontSize: 12, fill: '#9ca3af'}}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0d9488" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Top Customers by Country (Takes 1 column) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Top Regions</h2>
          <div className="space-y-4">
            {customers?.map((cust, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  {/* Flag Image from code */}
                  <img 
                    src={`https://flagcdn.com/w40/${cust.code.toLowerCase()}.png`} 
                    alt={cust.code} 
                    className="w-8 h-6 object-cover rounded shadow-sm"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{cust.name_en}</p>
                    <p className="text-xs text-gray-400">Customer base</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{cust.order_count}</p>
                  <p className="text-[10px] text-gray-400">Orders</p>
                </div>
              </div>
            ))}
            {(!customers || customers.length === 0) && <p className="text-sm text-gray-400">No customer data yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 5. Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1">
              View All <ArrowRight size={14}/>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentOrders?.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono text-teal-600 font-medium">{order.order_number}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.customer_name}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(order.amount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Top Products</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topProducts?.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xs overflow-hidden">
                   {/* We don't have image in this specific response snippet for charts/products, using placeholder icon */}
                   <ShoppingBag size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.product.name_en}</p>
                  <p className="text-xs text-gray-500">{item.product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-teal-600">{formatCurrency(item.total_revenue)}</p>
                  <p className="text-[10px] text-gray-400">{item.total_sold} sold</p>
                </div>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && <div className="p-6 text-sm text-gray-400 text-center">No sales data.</div>}
          </div>
        </div>

      </div>
    </div>
  );
}