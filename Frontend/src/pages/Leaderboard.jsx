import React, { useState, useEffect } from "react";
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import axios from "axios";
import Layout from '@/components/Layout';

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/leaderboard");
                setLeaders(response.data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const rankStyles = [
        { bg: 'from-amber-500/10 to-transparent', border: 'border-amber-500/20', text: 'text-amber-400', icon: Crown, iconColor: 'text-amber-400' },
        { bg: 'from-zinc-400/10 to-transparent', border: 'border-zinc-400/20', text: 'text-zinc-300', icon: Medal, iconColor: 'text-zinc-300' },
        { bg: 'from-amber-700/10 to-transparent', border: 'border-amber-700/20', text: 'text-amber-600', icon: Medal, iconColor: 'text-amber-600' },
    ];

    return (
        <>
            <Helmet>
                <title>Leaderboard - CodeMaster</title>
                <meta name="description" content="See the top coders on CodeMaster ranked by points earned." />
            </Helmet>

            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="text-[#f4f4f5]">Global </span>
                            <span className="text-gradient">Leaderboard</span>
                        </h1>
                        <p className="text-[#52525b]">Top 10 Coders by Points Earned</p>
                    </motion.div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card overflow-hidden"
                        >
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272a]">
                                        <th className="py-4 px-6 font-semibold text-[#52525b] text-xs uppercase tracking-wider">Rank</th>
                                        <th className="py-4 px-6 font-semibold text-[#52525b] text-xs uppercase tracking-wider">Username</th>
                                        <th className="py-4 px-6 text-right font-semibold text-[#52525b] text-xs uppercase tracking-wider">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaders.length > 0 ? (
                                        leaders.map((user, index) => {
                                            const style = rankStyles[index];
                                            const isTopThree = index < 3;
                                            return (
                                                <motion.tr
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 + index * 0.05 }}
                                                    className={`border-b border-[#27272a]/50 transition-colors hover:bg-[#27272a]/30 ${isTopThree ? `bg-gradient-to-r ${style.bg}` : ''
                                                        }`}
                                                >
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            {isTopThree ? (
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-amber-500/15' : index === 1 ? 'bg-zinc-400/15' : 'bg-amber-700/15'
                                                                    }`}>
                                                                    <style.icon className={`w-4 h-4 ${style.iconColor}`} />
                                                                </div>
                                                            ) : (
                                                                <span className="text-[#52525b] font-bold w-8 text-center font-mono">
                                                                    {index + 1}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`font-medium ${isTopThree ? 'text-[#f4f4f5]' : 'text-[#d4d4d8]'}`}>
                                                            {user.username}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <span className={`font-bold font-mono ${isTopThree ? style.text : 'text-amber-500/70'}`}>
                                                            {user.points}
                                                        </span>
                                                        <span className="text-xs text-[#3f3f46] ml-1.5">pts</span>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="py-12 text-center text-[#52525b]">
                                                <Trophy className="w-10 h-10 mx-auto mb-3 text-[#27272a]" />
                                                <p>No data available yet. Be the first to earn points!</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </div>
            </Layout>
        </>
    );
};

export default Leaderboard;
