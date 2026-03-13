import './App.css';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';

function App() {

  return (
    <>
      <div className="App">
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </>
  )
}

export default App
