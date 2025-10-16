'use client';

import { useAuth } from '@/lib/auth-provider';
import { useEffect, useState } from 'react';

export default function DebugEnrollmentPage() {
  const { user, loading } = useAuth();
  const [enrolledBatches, setEnrolledBatches] = useState(null);
  const [error, setError] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);

  const testEnrolledBatches = async () => {
    setFetchLoading(true);
    setError('');
    
    try {
      console.log('Testing enrolled batches API...');
      
      const response = await fetch('/api/student/enrolled-batches', {
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setEnrolledBatches(data);
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        setError(`HTTP ${response.status}: ${errorData}`);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(`Fetch error: ${err.message}`);
    } finally {
      setFetchLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading auth...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Enrollment API</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">User Info</h2>
        {user ? (
          <div className="space-y-1 text-sm">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User Type:</strong> {user.user_metadata?.user_type}</p>
            <p><strong>First Name:</strong> {user.user_metadata?.first_name}</p>
            <p><strong>Class:</strong> {user.user_metadata?.class_type}</p>
            <p><strong>Exam Preference:</strong> {user.user_metadata?.exam_preference}</p>
          </div>
        ) : (
          <p className="text-red-500">No user logged in</p>
        )}
      </div>

      <div className="mb-4">
        <button 
          onClick={testEnrolledBatches}
          disabled={!user || fetchLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {fetchLoading ? 'Testing...' : 'Test Enrolled Batches API'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {enrolledBatches && (
        <div className="p-4 bg-green-100 border border-green-400 rounded">
          <h3 className="font-semibold mb-2">API Response:</h3>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(enrolledBatches, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}