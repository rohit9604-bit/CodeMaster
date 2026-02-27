import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Target, Zap, Trophy, TrendingUp, Code2, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

const HomePage = () => {
  const { currentUser } = useAuth();
  const [userProgress, setUserProgress] = useState(null);
  const [featuredChallenges, setFeaturedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedChallenges = async () => {
      try {
        const data = await api.fetchProblems();
        let problems = [];
        if (Array.isArray(data)) {
          problems = data;
        } else if (data && Array.isArray(data.data)) {
          problems = data.data;
        } else if (data && Array.isArray(data.problems)) {
          problems = data.problems;
        }
        setFeaturedChallenges(problems.slice(0, 3));
      } catch (error) {
        console.error("Failed to load featured challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedChallenges();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const allProgress = JSON.parse(localStorage.getItem('userProgress') || '[]');
      const progress = allProgress.find(p => p.userId === currentUser.id);
      setUserProgress(progress || {
        userId: currentUser.id,
        solvedChallenges: [],
        currentStreak: 0,
        maxStreak: 0,
        totalPoints: 0,
        rank: allProgress.length + 1
      });
    }
  }, [currentUser]);

  const stats = [
    {
      icon: Target,
      label: 'Problems Solved',
      value: userProgress?.solvedChallenges?.length || 0,
      color: '#f59e0b',
      gradient: 'from-amber-500/20 to-amber-600/5'
    },
    {
      icon: Zap,
      label: 'Current Streak',
      value: `${userProgress?.currentStreak || 0} days`,
      color: '#10b981',
      gradient: 'from-emerald-500/20 to-emerald-600/5'
    },
    {
      icon: Trophy,
      label: 'Rank',
      value: `#${userProgress?.rank || '-'}`,
      color: '#8b5cf6',
      gradient: 'from-violet-500/20 to-violet-600/5'
    },
    {
      icon: TrendingUp,
      label: 'Total Points',
      value: userProgress?.totalPoints || 0,
      color: '#f43f5e',
      gradient: 'from-rose-500/20 to-rose-600/5'
    }
  ];

  const difficultyStyles = {
    'Easy': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    'Medium': 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    'Hard': 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - CodeMaster</title>
        <meta name="description" content="Your CodeMaster dashboard with coding challenges, progress tracking, and personalized learning." />
      </Helmet>

      <Layout>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background gradient mesh */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 3, -3, 0],
                opacity: [0.12, 0.22, 0.12]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[5%] w-80 h-80 bg-amber-500/15 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{
                y: [0, 25, 0],
                scale: [1, 1.1, 1],
                opacity: [0.08, 0.18, 0.08]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[30%] right-[10%] w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]"
            />
            <motion.div
              animate={{
                y: [0, -15, 0],
                opacity: [0.06, 0.12, 0.06]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute bottom-[10%] left-[40%] w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]"
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 80 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Welcome back, {currentUser?.username}
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                <span className="text-[#f4f4f5]">Master your</span>
                <br />
                <span className="text-gradient">coding skills</span>
              </h1>
              <p className="text-lg text-[#52525b] mb-8 max-w-xl mx-auto leading-relaxed">
                Continue your journey and conquer new challenges. Every line of code brings you closer to mastery.
              </p>
              <Link to="/challenges">
                <button className="btn-primary px-8 py-4 text-lg rounded-xl inline-flex items-center gap-2 group">
                  Start Coding
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6 group relative overflow-hidden"
              >
                {/* Subtle gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div
                    className="p-2.5 rounded-xl transition-colors duration-300"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div className="text-3xl font-bold text-[#f4f4f5] group-hover:scale-105 transition-transform">
                    {stat.value}
                  </div>
                </div>
                <p className="text-[#52525b] text-sm relative z-10">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Featured Challenges Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#f4f4f5]">Featured Challenges</h2>
              <Link to="/challenges" className="text-amber-500/80 hover:text-amber-400 transition-colors text-sm font-medium flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="glass-card-hover p-6 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-base font-semibold text-[#d4d4d8] group-hover:text-amber-400 transition-colors leading-snug">
                      {challenge.title}
                    </h3>
                    <span
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium ml-3 shrink-0 ${difficultyStyles[challenge.difficulty] || 'bg-[#27272a] text-[#a1a1aa]'
                        }`}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-[#52525b] text-sm mb-5 line-clamp-2 leading-relaxed">
                    {challenge.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#3f3f46]">
                      {challenge.acceptanceRate}% acceptance
                    </span>
                    <Link to={`/editor/${challenge.id}`}>
                      <button className="btn-primary px-4 py-2 text-sm rounded-lg">
                        Solve
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative glass-card p-10 overflow-hidden group"
          >
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/10 via-violet-500/5 to-emerald-500/10 animate-gradient opacity-50" />
            <div className="absolute inset-[1px] rounded-2xl bg-[#18181b]/90" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-[#f4f4f5] mb-2">
                  Ready for a Challenge?
                </h3>
                <p className="text-[#52525b]">
                  Test your skills with our curated collection of coding problems
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/challenges">
                  <button className="btn-primary px-6 py-3 rounded-xl">
                    Browse Challenges
                  </button>
                </Link>
                <Link to="/leaderboard">
                  <button className="px-6 py-3 rounded-xl border border-[#3f3f46]/40 text-[#a1a1aa] hover:text-amber-400 hover:border-amber-500/30 transition-all duration-300 font-medium">
                    View Leaderboard
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export default HomePage;