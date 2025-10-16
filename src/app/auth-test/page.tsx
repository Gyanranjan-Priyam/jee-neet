'use client';

import { useState } from 'react';

export default function AuthTestPage() {
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEmailOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: 'Test',
          lastName: 'User',
          classType: '12th',
          examPreference: 'JEE',
          password: 'test123456'
        })
      });
      
      const data = await response.json();
      setResults({ type: 'send-otp', ...data });
    } catch (error: any) {
      setResults({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testVerifyOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp
        })
      });
      
      const data = await response.json();
      setResults({ type: 'verify-otp', ...data });
    } catch (error: any) {
      setResults({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/check-user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      setResults({ type: 'user-status', ...data });
    } catch (error: any) {
      setResults({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth & Email Test Page</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Email:</label>
          <input 
            type="email" 
            className="w-full p-2 border border-gray-300 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">OTP (for verification):</label>
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
            placeholder="123456"
          />
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={testEmailOTP}
          disabled={!email || loading}
        >
          {loading ? 'Testing...' : 'Test Send OTP'}
        </button>
        
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          onClick={testVerifyOTP}
          disabled={!email || !otp || loading}
        >
          {loading ? 'Testing...' : 'Test Verify OTP'}
        </button>
        
        <button 
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={checkUserStatus}
          disabled={!email || loading}
        >
          {loading ? 'Checking...' : 'Check User Status'}
        </button>
      </div>
      
      {results && (
        <div className="p-4 bg-gray-100 border border-gray-300 rounded">
          <h3 className="font-bold mb-2">Test Results ({results.type}):</h3>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">🛠️ Fixed Issues:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>✅ Email service now uses SMTP configuration from .env.local</li>
          <li>✅ Fixed nodemailer.createTransporter → createTransport</li>
          <li>✅ Added better email error handling and connection testing</li>
          <li>✅ Auto-login credentials provided after successful registration</li>
          <li>✅ User status checking API for debugging login issues</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">📧 Email Configuration:</h3>
        <p className="text-sm text-blue-700">
          The system is configured to use SMTP settings from your .env.local file:
          <br />• SMTP_HOST=smtp.gmail.com
          <br />• SMTP_USER=contact.gcekbhawanipatna@gmail.com  
          <br />• SMTP_PASS=[configured]
          <br />• SMTP_PORT=587
        </p>
      </div>
    </div>
  );
}