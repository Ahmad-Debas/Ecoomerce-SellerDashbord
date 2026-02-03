import React from 'react';
import { Outlet } from 'react-router-dom';
import { Globe } from 'lucide-react';

export default function AuthLayout() {
  return (
    // 1. خلفية كاملة للشاشة
    <div className="min-h-screen w-full bg-[#5F9EA0] flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="w-full max-w-5xl  bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[600px]">
        <div className="hidden md:flex w-1/2 bg-teal-800 text-white flex-col justify-center items-center p-12 relative">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto backdrop-blur-sm">
                 <Globe size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Seller Control</h2>
              <p className="text-teal-100 text-lg leading-relaxed">
                Manage your products, orders, and inventory ,efficiently in one place.
              </p>
           </div>
        </div>

  
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
          <div className="w-full max-w-md">
             <Outlet />
          </div>
        </div>

      </div>
      
    </div>
  );
}