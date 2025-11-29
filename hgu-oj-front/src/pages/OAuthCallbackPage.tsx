import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

const OAuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getProfile } = useAuthStore();
    const [error, setError] = useState<string | null>(null);
    const processedRef = useRef(false);

    useEffect(() => {
        const processCallback = async () => {
            if (processedRef.current) return;
            processedRef.current = true;

            const searchParams = new URLSearchParams(location.search);
            const code = searchParams.get('code');

            if (!code) {
                setError('Authorization code is missing');
                return;
            }

            try {
                const result = await authService.googleLoginCallback(code);
                if (result.success) {
                    // Login successful, fetch profile and redirect
                    await getProfile();
                    navigate('/');
                } else {
                    setError(result.message || 'Login failed');
                }
            } catch (err) {
                console.error('Google login error:', err);
                setError('An error occurred during login');
            }
        };

        processCallback();
    }, [location, navigate, getProfile]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Login Failed</h2>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing login...</p>
            </div>
        </div>
    );
};

export default OAuthCallbackPage;
