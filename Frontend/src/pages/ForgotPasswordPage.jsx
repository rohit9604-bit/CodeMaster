import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

const ForgotPasswordPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!username || !email || !newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'All fields are required.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.resetPassword(username, email, newPassword);
            setMessage({ type: 'success', text: response.message || 'Password reset successful! Redirecting to login...' });

            setTimeout(() => {
                navigate('/login');
            }, 2500);

        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Invalid username or email combination.' });
        } finally {
            setIsLoading(false);
        }
    };

    const InputField = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, required = true }) => (
        <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">{label}</label>
            <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className="input-luxe"
                    placeholder={placeholder}
                    required={required}
                />
            </div>
        </div>
    );

    return (
        <>
            <Helmet>
                <title>Forgot Password - CodeMaster</title>
                <meta name="description" content="Reset your forgotten CodeMaster password." />
            </Helmet>

            <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
                {/* Floating gradient orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[25%] right-[20%] w-72 h-72 bg-amber-500/15 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            y: [0, 15, 0],
                            opacity: [0.08, 0.15, 0.08]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-[20%] left-[15%] w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md relative z-10"
                >
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block">
                            <motion.div
                                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-5 shadow-glow-amber"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Code2 className="w-8 h-8 text-black" />
                            </motion.div>
                        </Link>
                        <h1 className="text-3xl font-bold text-[#f4f4f5] mb-2">Reset Password</h1>
                        <p className="text-[#52525b]">Enter your credentials to verify your account</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-8"
                    >
                        <AnimatePresence mode="wait">
                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${message.type === 'error'
                                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                        }`}
                                >
                                    {message.type === 'error' ? (
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                    )}
                                    <p className="text-sm font-medium">{message.text}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <InputField
                                label="Username"
                                icon={User}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your exact username"
                            />

                            <InputField
                                label="Email Address"
                                icon={Mail}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@example.com"
                            />

                            <InputField
                                label="New Password"
                                icon={Lock}
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Create a new password (min 6 chars)"
                            />

                            <InputField
                                label="Confirm New Password"
                                icon={Lock}
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                            />

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full btn-primary py-3.5 text-base font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            Resetting...
                                        </span>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center border-t border-[#3f3f46]/20 pt-6">
                            <Link
                                to="/login"
                                className="text-[#52525b] hover:text-amber-400 text-sm font-medium transition-colors"
                            >
                                &larr; Back to Login
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
};

export default ForgotPasswordPage;
