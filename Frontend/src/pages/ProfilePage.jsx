import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Trophy, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [solvedCount, setSolvedCount] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const solved = await api.fetchSolvedProblems();
                if (Array.isArray(solved)) {
                    setSolvedCount(solved.length);
                }
            } catch (err) {
                console.error("Failed to fetch user stats", err);
            }
        };
        if (currentUser) {
            fetchStats();
        }
    }, [currentUser]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
            return;
        }

        setIsLoading(true);
        try {
            await api.changePassword(currentPassword, newPassword);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to change password. Please check your current password.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Helmet>
                <title>Profile - CodeMaster</title>
                <meta name="description" content="View your CodeMaster profile and settings." />
            </Helmet>

            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <h1 className="text-4xl font-bold text-[#f4f4f5] mb-2">
                            Your <span className="text-gradient">Profile</span>
                        </h1>
                        <p className="text-[#52525b]">Manage your account and track your progress</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* User Details Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-1"
                        >
                            <div className="glass-card p-6 space-y-6">
                                {/* Avatar & Name */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-2xl font-bold text-black shadow-glow-amber">
                                        {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-[#f4f4f5]">{currentUser.username}</h2>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md mt-1">
                                            <Shield className="w-3 h-3" />
                                            {currentUser.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f0f12] border border-[#27272a]">
                                    <Mail className="w-4 h-4 text-amber-500/70" />
                                    <span className="text-sm text-[#a1a1aa] truncate" title={currentUser.email}>{currentUser.email}</span>
                                </div>

                                {/* Stats */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f0f12] border border-amber-500/10 group hover:border-amber-500/25 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Trophy className="w-4 h-4 text-amber-400" />
                                            <span className="text-sm text-[#a1a1aa]">Points</span>
                                        </div>
                                        <span className="text-xl font-bold text-amber-400">
                                            {currentUser.points || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f0f12] border border-emerald-500/10 group hover:border-emerald-500/25 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span className="text-sm text-[#a1a1aa]">Solved</span>
                                        </div>
                                        <span className="text-xl font-bold text-emerald-400">
                                            {solvedCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Change Password Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-2"
                        >
                            {!showPasswordForm ? (
                                <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                                    <div className="w-16 h-16 rounded-2xl bg-[#0f0f12] border border-amber-500/20 flex items-center justify-center mb-6 shadow-glow-amber">
                                        <KeyRound className="w-8 h-8 text-amber-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#f4f4f5] mb-2">Security Settings</h3>
                                    <p className="text-[#52525b] text-sm max-w-sm mb-8">
                                        Update your password to keep your account secure.
                                    </p>
                                    <button
                                        onClick={() => setShowPasswordForm(true)}
                                        className="btn-primary px-6 py-3 rounded-xl"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            ) : (
                                <div className="glass-card p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                                <KeyRound className="w-5 h-5 text-amber-400" />
                                            </div>
                                            <h2 className="text-lg font-bold text-[#f4f4f5]">Change Password</h2>
                                        </div>
                                        <button
                                            className="text-[#52525b] hover:text-rose-400 text-sm font-medium transition-colors"
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                setMessage({ type: '', text: '' });
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {message.text && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${message.type === 'error'
                                                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                                    }`}
                                            >
                                                {message.type === 'error' ? (
                                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                                ) : (
                                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                                )}
                                                <p className="text-sm font-medium">{message.text}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <form onSubmit={handlePasswordChange} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Current Password</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                                className="input-luxe !pl-4"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Min. 6 characters"
                                                className="input-luxe !pl-4"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                className="input-luxe !pl-4"
                                                required
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-[#27272a]/50 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="btn-primary px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                                        Updating...
                                                    </span>
                                                ) : (
                                                    'Update Password'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default ProfilePage;
