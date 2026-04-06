import './App.css';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import WriteEntry from './pages/WriteEntry';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import ViewEntry from './pages/ViewEntry';
import ForgotPassword from './pages/ForgotPassword';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import Insights from './pages/Insights';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import TherapistRoute from './components/TherapistRoute';
import TherapistDashboard from './pages/TherapistDashboard';
import PatientDetail from './pages/PatientDetail';
import TherapistChat from './pages/TherapistChat';
import ProfessionalSupport from './pages/ProfessionalSupport';
import VerificationPending from './pages/VerificationPending';
import TherapistProfile from './pages/TherapistProfile';

function App() {

  return (
    <>
      <div className="App">
        <Toaster position="top-center" reverseOrder={false} />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
          <Route path="/verification-pending" element={<VerificationPending />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/write" element={<AppLayout><WriteEntry /></AppLayout>} />
            <Route path="/write/:id" element={<AppLayout><WriteEntry /></AppLayout>} />
            <Route path="/entry/:id" element={<AppLayout><ViewEntry /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="/insights" element={<AppLayout><Insights /></AppLayout>} />
            <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
            <Route path="/chat/:id" element={<AppLayout><Chat /></AppLayout>} />
            <Route path="/professional-support" element={<AppLayout><ProfessionalSupport /></AppLayout>} />
            <Route path="/therapist-chat/:roomId" element={<TherapistChat />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<TherapistRoute />}>
            <Route path="/therapist" element={<AppLayout><TherapistDashboard /></AppLayout>} />
            <Route path="/therapist/patient/:userId" element={<PatientDetail />} />
            <Route path="/therapist/chat/:roomId" element={<TherapistChat />} />
            <Route path="/therapist/profile" element={<AppLayout><TherapistProfile /></AppLayout>} />
          </Route>
          
        </Routes>
      </div>
    </>
  )
}

export default App;