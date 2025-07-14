import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import { useEffect, useState } from 'react';

function App() {
  const [token,setToken] = useState(localStorage.getItem('token') || ''); //checks if jwt token is already stored in the browser

  useEffect(() => { 
    if (token){
      localStorage.setItem('token',token);
    }
  }, [token]); //when token changes, this saves to localstorage so user remains logged in even after refreshing the page
  return(
    <Router> 
      <Routes>
        <Route path="/" element={<LoginPage setToken={setToken}/>} />
        <Route path="/login" element={<LoginPage setToken={setToken}/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token}/> : <Navigate to="/login"/>} /> 
      </Routes>
    </Router>

  );
}

export default App;
