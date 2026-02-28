import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ShopManager from './pages/ShopManager';
import CustomerView from './pages/CustomerView';
import './App.css';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('sn_token');
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/shop-manage/:shopId" element={<PrivateRoute><ShopManager /></PrivateRoute>} />
                <Route path="/shop/:shopId" element={<CustomerView />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;
