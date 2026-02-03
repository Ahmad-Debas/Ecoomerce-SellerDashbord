import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
    
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  const lang = localStorage.getItem("lang") || "en";
  config.headers["Accept-Language"] = lang;
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // إذا صار أي خطأ، بنفحص نوعه
    if (error.response && error.response.status === 401) {
      console.warn("Session Expired - Redirecting to login...");

      // أ. احذف التوكن الخربان عشان ما يضل يحاول يرسله
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // إذا مخزن بيانات يوزر كمان احذفها
      window.location.href = "/auth/login";
    }

    // ج. رجع الخطأ عشان لو صفحة ShowProduct بدها تعرض رسالة معينة تقدر تشوفه
    return Promise.reject(error);
  }
);



export default api;