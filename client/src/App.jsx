import './App.css';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WriteEntry from './pages/WriteEntry';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

function App() {


  return (
    <>
      <div className="App">
        <Toaster position="top-center" reverseOrder={false} />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            } />
            <Route path="/write" element={
              <AppLayout>
                <WriteEntry />
              </AppLayout>
            } />
            <Route path="/write/:id" element={<AppLayout><WriteEntry /></AppLayout>} />
          </Route>
        </Routes>
      </div>
    </>
  )
}

export default App;