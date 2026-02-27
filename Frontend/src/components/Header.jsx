import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Menu, X, User, LogOut, Trophy, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userProgress, setUserProgress] = useState(null);

  React.useEffect(() => {
    if (currentUser) {
      const allProgress = JSON.parse(localStorage.getItem('userProgress') || '[]');
      const progress = allProgress.find(p => p.userId === currentUser.id);
      setUserProgress(progress || {
        totalPoints: 0,
        rank: allProgress.length + 1
      });
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Target },
    { name: 'Challenges', path: '/challenges', icon: Code2 },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy }
  ];

  const isAdmin = currentUser?.role === 'admin';
  const accentColor = isAdmin ? 'emerald' : 'amber';

  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-[#3f3f46]/30 shadow-lg shadow-black/20">
      {isAdmin && (
        <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
      )}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className={`p-1.5 rounded-lg ${isAdmin ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}
            >
              <Code2 className={`w-7 h-7 ${isAdmin ? 'text-emerald-400' : 'text-amber-400'}`} />
            </motion.div>
            <span className="text-xl font-bold text-[#f4f4f5] tracking-tight">
              Code<span className={`${isAdmin ? 'text-emerald-400' : 'text-amber-400'}`}>Master</span>
            </span>
            {isAdmin && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md uppercase tracking-wider">
                Admin
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative group"
              >
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[#a1a1aa] transition-all duration-300 hover:text-[#f4f4f5] hover:bg-[#27272a]/50`}>
                  <link.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{link.name}</span>
                </div>
                <motion.div
                  className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${isAdmin ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileHover={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                />
              </Link>
            ))}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative ml-3">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-[#d4d4d8] transition-all duration-300 border ${isAdmin
                      ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30'
                      : 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/30'
                    }`}
                >
                  <div className="flex items-center gap-2 pr-2 border-r border-[#3f3f46]/40">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isAdmin ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                      {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium">{currentUser?.displayName}</span>
                  </div>
                  {!isAdmin && userProgress && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                      <Trophy className="w-3 h-3" />
                      {userProgress.totalPoints} pts
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 glass-card rounded-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-[#3f3f46]/30 bg-[#0f0f12]/60">
                        <p className="text-sm text-[#d4d4d8] font-medium truncate">{currentUser?.email}</p>
                        {!isAdmin && userProgress && (
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#a1a1aa]">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Target className="w-3 h-3" /> Rank #{userProgress.rank}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-3 text-[#d4d4d8] hover:bg-amber-500/5 hover:text-amber-300 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profile</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-3 text-[#d4d4d8] hover:bg-emerald-500/5 hover:text-emerald-300 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Menu className="w-4 h-4" />
                          <span className="text-sm">Admin Dashboard</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-[#d4d4d8] hover:bg-rose-500/5 hover:text-rose-400 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="ml-3">
                <button className="btn-primary px-5 py-2 text-sm rounded-lg">
                  Sign In
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-[#f4f4f5] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-[#3f3f46]/20"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-[#f4f4f5] transition-all duration-300"
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-[#f4f4f5] transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">Profile</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#a1a1aa] hover:bg-emerald-500/5 hover:text-emerald-300 transition-all"
                      >
                        <Menu className="w-4 h-4" />
                        <span className="text-sm font-medium">Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#a1a1aa] hover:bg-rose-500/5 hover:text-rose-400 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2"
                  >
                    <button className="w-full btn-primary py-2.5 text-sm rounded-lg">
                      Sign In
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;