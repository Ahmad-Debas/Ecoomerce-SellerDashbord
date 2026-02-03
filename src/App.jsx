import React from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './route.jsx'
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // إعدادات افتراضية مفيدة (اختياري)
      refetchOnWindowFocus: false, // يمنع إعادة التحميل المزعجة كل ما تضغط ع الشاشة
      retry: 1, // يحاول مرة واحدة فقط عند الفشل
    },
  },
});

export default function App() {
  return (
    <> 

    <QueryClientProvider client={queryClient}>



  
    <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
     
    <RouterProvider router={router}  />

      </QueryClientProvider>
    </>
  )
}
