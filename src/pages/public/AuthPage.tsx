import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authService, type UserRole } from '../../services/auth';
import { ArrowLeft, ShoppingBag, Store, Factory, Eye, EyeOff } from 'lucide-react';

export const AuthPage: React.FC = () => {
    const navigate = useNavigate();

    // steps
    const [step, setStep] = useState<'role' | 'auth' | 'details'>('role');
    const [isSignup, setIsSignup] = useState(false);
    const [role, setRole] = useState<UserRole | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        companyName: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /* -------------------- Handlers -------------------- */
    const handleSignin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const existingUser = await authService.signin(formData.email, formData.password);

            if (existingUser) {
                navigate(`/${role || existingUser.role}/dashboard`);
            } else {
                // User exists in auth but not in Firestore, go to details page
                setStep('details');
            }
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                setError('Email not found. Please sign up instead.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password.');
            } else {
                setError(err.message || 'Sign in failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            await authService.signup(formData.email, formData.password);
            setStep('details');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use. Please sign in instead.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email format.');
            } else {
                setError(err.message || 'Sign up failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignin = async () => {
        try {
            setLoading(true);
            setError('');
            const user = await authService.signInWithGoogle();
            if (user) {
                navigate(`/${user.role}/dashboard`);
            } else {
                setStep('details');
            }
        } catch (err: any) {
            setError(err.message || 'Google sign in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        if (!formData.name || !formData.companyName) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const user = await authService.register({
                email: formData.email,
                name: formData.name,
                companyName: formData.companyName,
                role
            });
            navigate(`/${user.role}/dashboard`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* -------------------- UI -------------------- */
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'bg-gray-50' }}>

            {/* Header / Navbar */}
            <div style={{ background: 'white', borderBottom: '1px solid var(--neutral-gray-200)', padding: '1rem 0' }}>
                <div className="container">
                    <div style={{ color: 'var(--primary-teal)', fontWeight: 700, fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                        <ShoppingBag style={{ marginRight: '0.5rem' }} /> VyapaarNet
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8)), url('/images/warehouse-bg.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
                <Card style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}>

                    {/* Card Header: Logo & Back Button */}
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        {step !== 'role' && (
                            <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setStep('role');
                                    setError('');
                                    setIsSignup(false);
                                }}>
                                    <ArrowLeft size={16} /> Back
                                </Button>
                            </div>
                        )}

                        {/* Small Logo on Card */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', opacity: 0.8 }}>
                            <ShoppingBag size={32} color="var(--primary-teal)" />
                        </div>

                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-gray-900)' }}>
                            {step === 'role' && 'How will you use VyapaarNet?'}
                            {step === 'auth' && (isSignup ? 'Create Account' : 'Login')}
                            {step === 'details' && 'Complete Profile'}
                        </h2>
                        <p style={{ color: 'var(--neutral-gray-500)', marginTop: '0.5rem' }}>
                            {step === 'role' && 'Select your primary role to continue'}
                            {step === 'auth' && (isSignup ? 'Sign up with your email' : 'Sign in to your account')}
                            {step === 'details' && 'Tell us a bit about yourself'}
                        </p>
                    </div>

                    {/* ---------------- ROLE ---------------- */}
                    {step === 'role' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div
                                    onClick={() => setRole('buyer')}
                                    className={`role-card ${role === 'buyer' ? 'selected' : ''}`}
                                >
                                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                        <Store size={48} color={role === 'buyer' ? 'var(--primary-teal)' : 'var(--neutral-gray-600)'} />
                                    </div>
                                    <div style={{ fontWeight: 600, color: 'var(--neutral-gray-900)' }}>Buyer</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-500)' }}>Retailer</div>
                                </div>

                                <div
                                    onClick={() => setRole('seller')}
                                    className={`role-card ${role === 'seller' ? 'selected' : ''}`}
                                >
                                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                        <Factory size={48} color={role === 'seller' ? 'var(--primary-teal)' : 'var(--neutral-gray-600)'} />
                                    </div>
                                    <div style={{ fontWeight: 600, color: 'var(--neutral-gray-900)' }}>Seller</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-500)' }}>Manufacturer</div>
                                </div>
                            </div>

                            <Button
                                style={{ width: '100%', marginTop: '2rem' }}
                                disabled={!role}
                                onClick={() => {
                                    setStep('auth');
                                    setIsSignup(false);
                                }}
                                size="lg"
                            >
                                Continue
                            </Button>
                        </>
                    )}

                    {/* ---------------- AUTH (Sign In / Sign Up) ---------------- */}
                    {step === 'auth' && (
                        <form onSubmit={isSignup ? handleSignup : handleSignin}>
                            <Input
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--neutral-gray-900)' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={isSignup ? "At least 6 characters" : "Enter your password"}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem 1rem 0.625rem 1rem',
                                            border: '1px solid var(--neutral-gray-300)',
                                            borderRadius: '0.375rem',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--neutral-gray-500)'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && <p style={{ color: 'var(--danger-red)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

                            <Button type="submit" isLoading={loading} style={{ width: '100%' }} size="lg">
                                {isSignup ? 'Create Account' : 'Sign In'}
                            </Button>

                            <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--neutral-gray-200)' }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-gray-400)', textTransform: 'uppercase' }}>Or</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--neutral-gray-200)' }} />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                                onClick={handleGoogleSignin}
                                disabled={loading}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                                    <path d="M3.964 10.705c-.18-.54-.282-1.117-.282-1.705s.102-1.165.282-1.705V4.963H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.037l3.007-2.332z" fill="#FBBC05" />
                                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.017.957 4.963L3.964 7.295C4.672 5.168 6.656 3.58 9 3.58z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </Button>

                            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--neutral-gray-600)' }}>
                                    {isSignup ? 'Already have an account?' : "Don't have an account?"}
                                    <span
                                        onClick={() => {
                                            setIsSignup(!isSignup);
                                            setError('');
                                            setFormData({ ...formData, password: '' });
                                        }}
                                        style={{ color: 'var(--primary-teal)', cursor: 'pointer', fontWeight: 600, marginLeft: '0.5rem' }}
                                    >
                                        {isSignup ? 'Sign In' : 'Sign Up'}
                                    </span>
                                </p>
                            </div>

                            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--neutral-gray-500)' }}>
                                By continuing, you agree to our <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span> & <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
                            </p>
                        </form>
                    )}

                    {/* ---------------- DETAILS ---------------- */}
                    {step === 'details' && (
                        <form onSubmit={handleRegister}>
                            <Input
                                label={role === 'buyer' ? "Shop / Business Name" : "Company Name"}
                                placeholder="Enter your business name"
                                value={formData.companyName}
                                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                required
                            />
                            <Input
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            {error && <p style={{ color: 'var(--danger-red)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
                            <Button type="submit" isLoading={loading} style={{ width: '100%' }} size="lg">
                                Complete Setup
                            </Button>
                        </form>
                    )}

                </Card>
            </div>
        </div>
    );
};
