import { Routes, Route } from 'react-router-dom';

// Import các trang (Pages)
import Whiteboard from './pages/Whiteboard/Whiteboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyOtp from './pages/Auth/VerifyOtp';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <>
      <Routes>
        {/* 1. Trang chủ: Hiện bảng vẽ Whiteboard */}
        <Route path="/" element={<Whiteboard />} />
        
        {/*2. Các trang xác thực tài khoản */}
        <Route path="/login" element={<Login />} />
        
        <Route path="/register" element={<Register />} />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        Trang đặt lại mật khẩu cần có :token để xác thực từ link email *
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/verify-otp" element={<VerifyOtp />} />
        

        {/* Bạn có thể thêm trang 404 (Không tìm thấy trang) nếu muốn */}
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