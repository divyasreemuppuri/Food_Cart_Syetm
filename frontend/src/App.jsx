import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/home"
import Register from "./pages/Register"
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import ScannerPage from "./pages/ScannerPage";
import AddWalletPage from "./pages/AddWalletPage";


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/:adminId/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/:studentId/student-dashboard" element={<StudentDashboard />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/addwallet/:studentId" element={<AddWalletPage />} />

      </Routes>
    </Router>
  )
}

export default App
