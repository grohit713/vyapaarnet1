import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { WifiOff, Loader2 } from 'lucide-react';

export const FirebaseConnectionCheck: React.FC = () => {
 const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const checkConnection = async () => {
   try {
    // Try to fetch a single document from any collection to check connectivity
    const q = query(collection(db, 'users'), limit(1));
    await getDocs(q);
    setStatus('connected');
   } catch (err: any) {
    console.error("Firebase Connection Check Failed:", err);
    setStatus('error');
    setError(err.message || 'Unknown connection error');
   }
  };

  checkConnection();
 }, []);

 if (status === 'connected') return null; // Don't show anything if connected

 return (
  <div style={{
   position: 'fixed',
   bottom: '1rem',
   right: '1rem',
   zIndex: 9999,
   padding: '1rem',
   borderRadius: '0.75rem',
   backgroundColor: status === 'error' ? '#fef2f2' : '#f0f9ff',
   border: `1px solid ${status === 'error' ? '#ef4444' : '#0ea5e9'}`,
   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
   maxWidth: '300px',
   display: 'flex',
   alignItems: 'center',
   gap: '0.75rem'
  }}>
   {status === 'checking' ? (
    <Loader2 className="animate-spin text-blue-500" size={20} />
   ) : (
    <WifiOff className="text-red-500" size={20} />
   )}
   <div>
    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: status === 'error' ? '#b91c1c' : '#0369a1' }}>
     {status === 'checking' ? 'Connecting to Database...' : 'Database Connection Error'}
    </div>
    {status === 'error' && (
     <div style={{ fontSize: '0.75rem', color: '#7f1d1d', marginTop: '0.25rem' }}>
      {error?.includes('permission-denied')
       ? 'Check Firestore Rules in console.'
       : `Error: ${error || 'Network/Firewall issue'}`}
     </div>
    )}
   </div>
  </div>
 );
};
