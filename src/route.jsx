import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "./Pages/Home/Home.jsx";
import DashboardLayout from "./Layouts/DashboardLayout.jsx";
import AuthLayout from "./Layouts/AuthLayout.jsx";
import Login from "./Pages/Auth/Login.jsx";
import SelectLanguage from "./Pages/Auth/SelectLanguage.jsx";
import Register from "./Pages/Auth/Register.jsx";
import ForgetPassword from "./Pages/Auth/ForgetPassword.jsx";
import SendCode from "./Pages/Auth/ResetPassword.jsx";
import VerifyAccount from "./Pages/Auth/VerifyAccount.jsx";
import Products from "./Pages/Home/Products.jsx";
import Orders from "./Pages/Home/Orders.jsx";
import OrdersTwo from "./Pages/Home/OrdersTwo.jsx"
import ShowProduct from "./Pages/Home/ShowProduct.jsx";
import CreateProduct from "./Pages/Home/CreateProduct.jsx"
import ShowOrder from "./Pages/Home/ShowOrder.jsx";
import Inventory from "./Pages/Home/Inventory.jsx";
import ShowInventory from "./Pages/Home/ShowInventory.jsx";
import ShowProductTest from "./Pages/Home/ShowProductTest.jsx";
import Customers from "./Pages/Home/Customers.jsx";
import ShowCustomer from "./Pages/Home/ShowCustomer.jsx";
import Promotions from "./Pages/Home/Promotions.jsx";
import CreatePromotion from "./Pages/Home/CreatePromotion.jsx";
import ShowPromoition from "./Pages/Home/ShowPromoition.jsx";
import Payments from "./Pages/Home/Payments.jsx";
import ShowInvoice from "./Pages/Home/ShowInvoice.jsx";
import Profile from "./Pages/Home/ProfileComponent/Profile.jsx";
import Coupon from "./Pages/Home/Coupon/Coupon.jsx";


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/auth" replace />;
  return children;
};

const AuthEntryPoint = () => {
  const lang = localStorage.getItem("lang");
  if (lang) {
    return <Navigate to="login" replace />;
  }
  return <Navigate to="language" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" />
      },
      {
        path: 'dashboard',
        element: <Home />
      },
      {
        path: 'home',
        element: <Home />
      },
      {
        path: 'products',
        element: <Products />
      },
      {
        path: 'products/:id',
        element: <ShowProduct />
      },
      {
        path: 'showtest-product/:id',
        element: <ShowProductTest />
      },
      {
        path: 'orders',
        element: <Orders />
      },
     
      {
        path: 'create-product',
        element: <CreateProduct />
      },
      {
        path: 'show-order/:id',
        element: <ShowOrder />
      },
      {
        path: 'inventory',
        element: <Inventory />
      },
      {
        path: 'show-inventory/:id',
        element: <ShowInventory />
      },
      {
        path: 'customers',
        element: <Customers />
      },
      {
        path: 'show-customer/:id',
        element: <ShowCustomer />
      },
      {
        path: 'promotions',
        element: <Promotions />
      },
      {
        path: 'create-promotion',
        element: <CreatePromotion />
      },
      {
        path: 'edit-promotion/:id',
        element: <ShowPromoition />
      },
      {
        path: 'payments',
        element: <Payments />
      },
      {
        path: 'invoice/:id',
        element: <ShowInvoice />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'coupons',
        element: <Coupon />
      },
      
    ]
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        index: true, 
        element: <AuthEntryPoint /> 
      },
      {
        path: 'language',
        element: <SelectLanguage /> 
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
         path :'forgot-password',
         element:<ForgetPassword />
      },
      {
         path :'send-code',
         element:<SendCode />
      },
      {
         path :'verify-account',
         element:<VerifyAccount />
      },
    ]
  },
]);

export default router;