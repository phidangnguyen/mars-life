import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { BUNDLER_ENDPOINT } from '@/constants/constant';

const AuthCallback = () => {
  const [status, setStatus] = useState('Processing authentication...');
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL search params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        console.log("code::  ", code);
        console.log("state::  ", state);
        

        if (!code || !state) {
          setStatus('Error: Missing parameters');
          return;
        }

        // Decode state parameter
        const decodedState = JSON.parse(atob(state));
        console.log('Decoded state:', decodedState);

        // Call your backend
        const response = await fetch(`${BUNDLER_ENDPOINT}auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-signature': decodedState['x-signature'],
            'x-timestamp': decodedState['x-timestamp'],
            'x-api-key': decodedState['x-api-key'],
            'origin': decodedState.origin
          },
          body: JSON.stringify({ code })
        });

        console.log("response: ", response);
        

        if (!response.ok) {
          throw new Error('Failed to exchange code');
        }

        const rs = await response.json();
        setStatus('Authentication successful!');
        // Store authentication data
        localStorage.setItem('token', rs.data.accessToken);
        localStorage.setItem('userData', JSON.stringify(rs.data.user));

        // Redirect back to the game
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('Authentication failed');
      }
    };
    
    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Universal Account</h1>
        <div className="space-y-4">
          <Loader2 className="animate-spin mx-auto" size={24} />
          <p className="text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
