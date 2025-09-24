import React, { useState } from 'react';
import axios from 'axios';

const DebugPanel = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const addResult = (test, success, data) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { timestamp, test, success, data }]);
  };

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/health`);
      addResult('Health Check', true, response.data);
    } catch (error) {
      addResult('Health Check', false, error.response?.data || error.message);
    }
    setLoading(false);
  };

  const testDebugSignup = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/test-signup`, {
        email: 'debug@test.com',
        password: 'Test123!',
        name: 'Debug User'
      });
      addResult('Debug Signup', true, response.data);
    } catch (error) {
      addResult('Debug Signup', false, error.response?.data || error.message);
    }
    setLoading(false);
  };

  const testRealSignup = async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email: `test${timestamp}@example.com`,
        password: 'Test123!',
        name: 'Test User'
      });
      addResult('Real Signup', true, response.data);
    } catch (error) {
      addResult('Real Signup', false, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🐛 Debug Panel</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testHealth} disabled={loading} style={{ margin: '5px', padding: '10px' }}>
          Test Health
        </button>
        <button onClick={testDebugSignup} disabled={loading} style={{ margin: '5px', padding: '10px' }}>
          Test Debug Signup
        </button>
        <button onClick={testRealSignup} disabled={loading} style={{ margin: '5px', padding: '10px' }}>
          Test Real Signup
        </button>
        <button onClick={clearResults} style={{ margin: '5px', padding: '10px', background: '#ff4444', color: 'white' }}>
          Clear Results
        </button>
      </div>

      {loading && <p>⏳ Testing...</p>}

      <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
        <h3>Test Results:</h3>
        {results.map((result, index) => (
          <div key={index} style={{ 
            marginBottom: '10px', 
            padding: '10px', 
            border: `1px solid ${result.success ? 'green' : 'red'}`,
            backgroundColor: result.success ? '#e8f5e8' : '#ffebee'
          }}>
            <strong>{result.timestamp} - {result.test}: {result.success ? '✅ Success' : '❌ Failed'}</strong>
            <pre style={{ fontSize: '12px', marginTop: '5px' }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugPanel;
