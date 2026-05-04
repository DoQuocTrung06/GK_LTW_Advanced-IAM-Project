import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import Pages
import Whiteboard from './pages/Whiteboard/Whiteboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyOtp from './pages/Auth/VerifyOtp';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OAuthCallback from './pages/Auth/OAuthCallback';


// NGƯỜI BẢO VỆ: Nếu chưa có token, đá về trang login và nhớ cái link định vào
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  const location = useLocation();

  if (!token) {
    // Lưu lại cái link hiện tại (VD: /board/14) để sau khi login quay lại đúng đây
    localStorage.setItem('redirect_after_login', location.pathname);
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * Hàng rào GuestRoute (Chỉ dành cho khách chưa đăng nhập)
 * Nếu đã có auth_token (tức là đã đăng nhập), tự động đá văng về trang chủ (/)
 */
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token'); 
  
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Routes>
      {/* 1. Trang chủ: Tự động tạo phòng mới */}
      <Route path="/" element={
          <ProtectedRoute>
            <Whiteboard />
          </ProtectedRoute>
      } />
      
      {/* THÊM MỚI: Mở cửa cho link chia sẻ có chứa ID */}
      <Route path="/board/:id" element={
          <ProtectedRoute>
            <Whiteboard />
          </ProtectedRoute>
      } />
      
      {/* 2. Các trang Auth: Được bọc bởi GuestRoute để chặn người đã đăng nhập */}
      <Route path="/login" element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      } />

      <Route path="/oauth/callback" element={<OAuthCallback />} />

      <Route path="/register" element={
        <GuestRoute>
          <Register />
        </GuestRoute>
      } />
      <Route path="/forgot-password" element={
        <GuestRoute>
          <ForgotPassword />
        </GuestRoute>
      } />
      <Route path="/reset-password" element={
        <GuestRoute>
          <ResetPassword />
        </GuestRoute>
      } />
      <Route path="/verify-otp" element={
        <GuestRoute>
          <VerifyOtp />
        </GuestRoute>
      } />
      
      {/* Trang 404: Not Found (Trả lại code gốc của bạn) */}
      <Route path="*" element={
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
          <h1 style={{ fontSize: '72px', color: '#1e293b' }}>404</h1>
          <p>Oops! The page you are looking for doesn't exist.</p>
          <a href="/" style={{ color: '#4f46e5', textDecoration: 'none' }}>Go back Home</a>
        </div>
      } />
</Routes>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;