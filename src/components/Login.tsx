import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { createSignature } from '@/utils/signature';
import { BUNDLER_ENDPOINT } from '@/constants/constant';
interface LoginProps {
    onLoginStart?: () => void;
}

const Login = ({ onLoginStart }: LoginProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loginProvider, setLoginProvider] = useState<string | null>(null);

    const handleOAuthLogin = async (provider: string) => {
        if (onLoginStart) {
            onLoginStart();
        }

        setIsLoading(true);

        try {
            const domain = window.location.hostname;
            const requestHeaders = await createSignature(
                domain
            );
            const response = await fetch(`${BUNDLER_ENDPOINT}auth/${provider}`, {
                method: "GET",
                headers: {
                    "x-signature": requestHeaders.signature,
                    "x-timestamp": `${requestHeaders.timestamp}`,
                    "origin": window.location.origin,
                    "x-api-key": requestHeaders.publicKey,
                },
                redirect: "manual", // Prevents auto-following redirects
            });

            const redirectUrl = response.headers.get("Location");
            console.log("redirectUrl: ", redirectUrl);

            if (redirectUrl) {
                console.log(`Redirecting to ${provider} OAuth:`, redirectUrl);
                console.log("Redirecting to:", redirectUrl);
                window.location.href = redirectUrl; // Manually redirect the user
            } else {
                throw new Error("No redirect URL found");
            }
        } catch (error) {
            console.error("Error initiating login:", error);
            setIsLoading(false);
            setLoginProvider(null);
        }
    };

    const handleGoogleLogin = () => handleOAuthLogin('google');
    const handleTwitterLogin = () => handleOAuthLogin('twitter');
    const handleFacebookLogin = () => handleOAuthLogin('facebook');


    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Welcome to Lucky Wheel</h2>
                <p className="text-gray-600 mt-2">
                    Sign in to start playing and winning prizes!
                </p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 border border-gray-300 rounded-lg transition-colors duration-200"
                >
                    {isLoading && loginProvider === 'google' ? (
                        <>
                            <Loader2 className="animate-spin mr-2" size={20} />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>

                <button
                    onClick={handleTwitterLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 border border-gray-300 rounded-lg transition-colors duration-200"
                >
                    {isLoading && loginProvider === 'twitter' ? (
                        <>
                            <Loader2 className="animate-spin mr-2" size={20} />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <X className="text-black" size={20} />
                            Continue with X (Twitter)
                        </>
                    )}
                </button>

                <button
                    onClick={handleFacebookLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 border border-gray-300 rounded-lg transition-colors duration-200"
                >
                    {isLoading && loginProvider === 'facebook' ? (
                        <>
                            <Loader2 className="animate-spin mr-2" size={20} />
                            Connecting...
                        </>
                    ) : (
                        <>
                            {/* Facebook logo SVG */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="#1877F2"
                            >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Continue with Facebook
                        </>
                    )}
                </button>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                <p className="mt-2">All transactions secured on-chain with Universal Account.</p>
            </div>
        </div>
    );
};

export default Login;