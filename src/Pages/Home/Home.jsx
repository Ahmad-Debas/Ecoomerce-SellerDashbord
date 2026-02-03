import { useEffect, useState } from "react";
import { 
  HiCurrencyDollar, HiShoppingBag, HiUsers, HiCube, 
  HiArrowUp, HiArrowDown 
} from "react-icons/hi";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import api from "../../Services/api"; // الـ Axios Instance تبعنا

export default function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. دالة جلب البيانات
  useEffect(() => {
    const fetchStats = async () => {
      try {
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        setStats({
            total_revenue: "40,689",
            daily_revenue: "1,029",
            orders: "3,456",
            products: "15",
            revenue_data: [
              { name: 'Sat', value: 4000 }, { name: 'Sun', value: 3000 },
              { name: 'Mon', value: 5000 }, { name: 'Tue', value: 2780 },
              { name: 'Wed', value: 1890 }, { name: 'Thu', value: 2390 },
              { name: 'Fri', value: 3490 },
            ],
            recent_orders: [
                { id: "#SK2540", date: "2026-01-14", customer: "Neal Matthews", total: "$420.00", status: "Shipped" },
                { id: "#SK2541", date: "2026-01-13", customer: "Jamal Burnett", total: "$110.00", status: "Pending" },
                { id: "#SK2542", date: "2026-01-12", customer: "Juan Mitchell", total: "$750.00", status: "Delivered" },
                { id: "#SK2543", date: "2026-01-11", customer: "Barry Roy", total: "$30.00", status: "Cancelled" },
            ]
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

 
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
        </div>
        <div className="h-80 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }


  const StatCard = ({ title, value, icon, trend, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} text-white`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? <HiArrowUp className="mr-1"/> : <HiArrowDown className="mr-1"/>}
          {Math.abs(trend)}%
        </span>
        <span className="text-gray-400 ml-2">vs last month</span>
      </div>
    </div>
  );

  // حالة الطلب (لتلوين الباج)
  const getStatusColor = (status) => {
      switch(status) {
          case 'Delivered': return 'bg-green-100 text-green-700';
          case 'Pending': return 'bg-yellow-100 text-yellow-700';
          case 'Shipped': return 'bg-blue-100 text-blue-700';
          case 'Cancelled': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  return (
    <div className="space-y-6">
      
      {/* --- Section 1: Top Stats --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.total_revenue}`} 
          icon={<HiCurrencyDollar size={24} />} 
          color="bg-blue-600"
          trend={12.5}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={<HiShoppingBag size={24} />} 
          color="bg-teal-600"
          trend={-2.4}
        />
        <StatCard 
          title="Products" 
          value={stats.products} 
          icon={<HiCube size={24} />} 
          color="bg-purple-600"
          trend={5.8}
        />
        <StatCard 
          title="Customers" 
          value="1,205" 
          icon={<HiUsers size={24} />} 
          color="bg-orange-500"
          trend={8.2}
        />
      </div>

      {/* --- Section 2: Charts Area --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart (Revenue) - يأخذ ثلثين المساحة */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Revenue Analytics</h3>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2 outline-none">
                <option>This Week</option>
                <option>This Month</option>
            </select>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenue_data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                    contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Area type="monotone" dataKey="value" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Stat (Daily Revenue) - يأخذ ثلث المساحة */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
           <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Daily Sales</h3>
              <p className="text-gray-400 text-sm">Total sales made today</p>
              <h2 className="text-4xl font-bold text-gray-800 mt-6">${stats.daily_revenue}</h2>
              <p className="text-green-500 text-sm font-medium mt-2 flex items-center">
                  <HiArrowUp className="mr-1"/> +1.5% from yesterday
              </p>
           </div>
           
           {/* رسم بياني صغير (Bar Chart) */}
           <div className="h-40 mt-6">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                    {name: 'A', v: 20}, {name: 'B', v: 40}, {name: 'C', v: 30}, 
                    {name: 'D', v: 50}, {name: 'E', v: 25}, {name: 'F', v: 45}
                ]}>
                    <Bar dataKey="v" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>

      {/* --- Section 3: Recent Orders Table --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
            <button className="text-teal-600 text-sm font-bold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                    <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {stats.recent_orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-800">{order.id}</td>
                            <td className="px-6 py-4">{order.date}</td>
                            <td className="px-6 py-4">{order.customer}</td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-gray-800">{order.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
}