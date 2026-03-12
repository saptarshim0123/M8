import './App.css'
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing'

function App() {

  return (
    <>
      <div className="App">
        
        <Routes>
          {/* This makes Landing the home page (at path "/") */}
          <Route path="/" element={<Landing />} />
          {/* Example of adding other routes later */}
          {/* <Route path="/login" element={<Login />} /> */}
        </Routes>
      </div>
    </>
  )
}

export default App
