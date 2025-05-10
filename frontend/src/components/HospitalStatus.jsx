import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHospital, FaBed, FaAmbulance, FaUserMd } from 'react-icons/fa';
import { toast } from 'react-toastify';

const HospitalStatus = () => {
    const [status, setStatus] = useState('checking');
    const [lastChecked, setLastChecked] = useState(null);

    const checkStatus = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/hospital-status`);
            if (response.data.success) {
                setStatus('online');
                setLastChecked(new Date());
            } else {
                setStatus('offline');
                setLastChecked(new Date());
            }
        } catch (error) {
            console.error('Error checking hospital status:', error);
            setStatus('offline');
            setLastChecked(new Date());
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-20 left-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                        status === 'online' ? 'bg-green-500' : 
                        status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm font-medium">
                        {status === 'online' ? 'Hospital System Online' : 
                         status === 'offline' ? 'Hospital System Offline' : 'Checking Status...'}
                    </span>
                </div>
                {lastChecked && (
                    <p className="text-xs text-gray-500 mt-1">
                        Last checked: {lastChecked.toLocaleTimeString()}
                    </p>
                )}
            </div>
        </div>
    );
};

export default HospitalStatus; 