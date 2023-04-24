import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionInfo = () => {
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    const fetchConnectionInfo = async () => {
      try {
        const response = await axios.get('http://ip-api.com/json/');
        setConnectionInfo(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching connection information:', error);
      }
    };
  
    const fetchDeviceInfo = () => {
      setDeviceInfo({
        userAgent: window.navigator.userAgent,
        platform: window.navigator.platform,
        vendor: window.navigator.vendor,
      });
    };
  
    fetchConnectionInfo();
    fetchDeviceInfo();
  }, []);
  return (
    <div>
      <h1>Connection and Device Information</h1>
      {connectionInfo && (
        <div>
          <h2>Connection Information</h2>
          <p>IP: {connectionInfo.query}</p>
          <p>ISP: {connectionInfo.isp}</p>
          <p>City: {connectionInfo.city}</p>
          <p>Region: {connectionInfo.regionName}</p>
          <p>Country: {connectionInfo.country}</p>
        </div>
      )}
      {deviceInfo && (
        <div>
          <h2>Device Information</h2>
          <p>User Agent: {deviceInfo.userAgent}</p>
          <p>Platform: {deviceInfo.platform}</p>
          <p>Vendor: {deviceInfo.vendor}</p>
        </div>
      )}
    </div>
  );
    
};

export default ConnectionInfo;
