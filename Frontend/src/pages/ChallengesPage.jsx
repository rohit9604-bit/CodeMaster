import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Code2, AlertCircle, RefreshCw, CheckCircle2, Swords, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { getDifficultyColor, getDifficultyBgColor } from '@/data/challenges';
import { useAuth } from '@/contexts/AuthContext';
import { socket } from '@/services/socket';

const difficultyStyles = {
  'Easy': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'Medium': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'Hard': 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

const difficultyTopBorder = {
  'Easy': 'from-emerald-500/40 to-transparent',
  'Medium': 'from-amber-500/40 to-transparent',
  'Hard': 'from-rose-500/40 to-transparent',
};

const ChallengesPage = () => {
  const { currentUser } = useAuth();
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const navigate = useNavigate();
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [matchStatus, setMatchStatus] = useState('');

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const fetchProblems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.fetchProblems();
      let problemsArray = [];
      if (Array.isArray(data)) {
        problemsArray = data;
      } else if (data && Array.isArray(data.data)) {
        problemsArray = data.data;
      } else if (data && Array.isArray(data.problems)) {
        problemsArray = data.problems;
      }
      setProblems(problemsArray);

      if (currentUser) {
        try {
          const solvedIds = await api.fetchSolvedProblems();
          setSolvedProblems(solvedIds || []);
        } catch (e) {
          console.error('Failed to fetch solved problems', e);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load challenges. Please check if the backend is running at http://localhost:5000');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = (problem.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (problem.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const problemDifficulty = (problem.difficulty || '').toLowerCase();
    const filterDifficulty = selectedDifficulty.toLowerCase();

    const matchesDifficulty = selectedDifficulty === 'All' ||
      problemDifficulty === filterDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const handleFindMatch = () => {
    if (!currentUser) {
      alert("Please login to play 1v1 matches!");
      return;
    }
    setIsSearchingMatch(true);
    setMatchStatus('Connecting to matchmaking server...');

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setMatchStatus('Joining queue...');
      socket.emit('join_queue', { userId: currentUser.id, username: currentUser?.username || 'Player' });
    };

    const onWaiting = (data) => {
      setMatchStatus(data.message);
    };

    const onMatchFound = (data) => {
      setMatchStatus('Match found! Redirecting...');
      setTimeout(() => {
        cleanupSockets();
        navigate(`/editor/${data.problemId}?matchId=${data.matchId}`);
      }, 1000);
    };

    const onError = (data) => {
      cleanupSockets();
      alert(data.message || 'Error occurred');
    };

    const cleanupSockets = () => {
      socket.off('connect', onConnect);
      socket.off('waiting_for_opponent', onWaiting);
      socket.off('match_found', onMatchFound);
      socket.off('match_error', onError);
      setIsSearchingMatch(false);
      setMatchStatus('');
    };

    socket.on('connect', onConnect);
    socket.on('waiting_for_opponent', onWaiting);
    socket.on('match_found', onMatchFound);
    socket.on('match_error', onError);

    if (socket.connected) {
      onConnect();
    }
  };

  const cancelSearch = () => {
    if (socket.connected) {
      socket.emit('leave_queue');
    }
    socket.off('connect');
    socket.off('waiting_for_opponent');
    socket.off('match_found');
    socket.off('match_error');
    setIsSearchingMatch(false);
    setMatchStatus('');
  };

  return (
    <>
      <Helmet>
        <title>Challenges - CodeMaster</title>
        <meta name="description" content="Browse and solve coding challenges to improve your programming skills." />
      </Helmet>

      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-[#f4f4f5] mb-3">
              Coding <span className="text-gradient">Challenges</span>
            </h1>
            <p className="text-[#52525b] text-lg">
              Practice your skills with carefully curated problems
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challenges..."
                className="input-luxe !pl-11 !rounded-xl"
              />
            </div>

            {/* Difficulty Filter — Pill Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[#52525b] text-sm font-medium">Difficulty:</span>
              {difficulties.map((difficulty) => {
                const isActive = selectedDifficulty === difficulty;
                const pillMap = {
                  'All': isActive ? 'bg-[#27272a] text-[#f4f4f5] border-[#3f3f46]' : 'text-[#52525b] border-[#27272a] hover:border-[#3f3f46]',
                  'Easy': isActive ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'text-[#52525b] border-[#27272a] hover:border-emerald-500/30 hover:text-emerald-400',
                  'Medium': isActive ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'text-[#52525b] border-[#27272a] hover:border-amber-500/30 hover:text-amber-400',
                  'Hard': isActive ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'text-[#52525b] border-[#27272a] hover:border-rose-500/30 hover:text-rose-400',
                };
                return (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all duration-300 ${pillMap[difficulty]}`}
                  >
                    {difficulty}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Matchmaking status card */}
          <AnimatePresence>
            {isSearchingMatch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between glow-border-amber">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="relative flex h-12 w-12 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                      <div className="relative inline-flex rounded-full h-10 w-10 bg-gradient-to-br from-amber-500 to-amber-600 items-center justify-center shadow-glow-amber">
                        <Swords className="w-5 h-5 text-black" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#f4f4f5]">Searching for Opponent</h3>
                      <p className="text-amber-400 animate-pulse text-sm">{matchStatus}</p>
                    </div>
                  </div>
                  <button
                    onClick={cancelSearch}
                    className="px-5 py-2 rounded-xl bg-[#27272a] border border-[#3f3f46]/30 text-[#a1a1aa] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all flex items-center gap-2 font-medium text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Matchmaking Header Button */}
          {!isSearchingMatch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8 flex justify-end"
            >
              <button
                onClick={handleFindMatch}
                className="btn-primary px-6 py-3.5 rounded-xl hover:scale-[1.03] transition-all flex items-center gap-3 text-base font-semibold group"
              >
                <Swords className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Find 1v1 Match
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card p-6 h-56">
                  <div className="h-5 bg-[#27272a] rounded-lg w-3/4 mb-4 animate-pulse"></div>
                  <div className="h-3 bg-[#27272a] rounded-lg w-full mb-2.5 animate-pulse"></div>
                  <div className="h-3 bg-[#27272a] rounded-lg w-full mb-2.5 animate-pulse"></div>
                  <div className="h-3 bg-[#27272a] rounded-lg w-2/3 animate-pulse"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 glass-card p-8 border-rose-500/20">
              <AlertCircle className="w-14 h-14 text-rose-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#f4f4f5] mb-2">Connection Error</h3>
              <p className="text-[#52525b] mb-6 max-w-lg mx-auto text-sm">{error}</p>
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={fetchProblems}
                  className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <p className="text-xs text-[#3f3f46]">
                  Note: Ensure the backend server is running on port 5000
                </p>
              </div>
            </div>
          )}

          {/* Results Count & Grid */}
          {!isLoading && !error && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-5"
              >
                <p className="text-[#3f3f46] text-sm">
                  Showing {filteredProblems.length} of {problems.length} challenges
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${searchQuery}-${selectedDifficulty}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {filteredProblems.map((problem, index) => (
                    <motion.div
                      key={problem.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="glass-card-hover p-0 flex flex-col h-full overflow-hidden group"
                    >
                      {/* Top gradient border per difficulty */}
                      <div className={`h-0.5 bg-gradient-to-r ${difficultyTopBorder[problem.difficulty] || 'from-[#3f3f46] to-transparent'}`} />

                      <div className="p-6 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-[#d4d4d8] group-hover:text-amber-400 transition-colors mb-2 leading-snug">
                              {problem.title}
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                              <span className={`inline-block px-2.5 py-0.5 text-xs rounded-lg font-medium border ${difficultyStyles[problem.difficulty] || 'bg-[#27272a] text-[#a1a1aa] border-[#3f3f46]'
                                }`}>
                                {problem.difficulty}
                              </span>
                              {problem.is_validated && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/20 font-medium">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Validated
                                </span>
                              )}
                              {solvedProblems.includes(problem.id) && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Solved
                                </span>
                              )}
                            </div>
                          </div>
                          <Code2 className="w-4 h-4 text-[#3f3f46] group-hover:text-amber-500/50 transition-colors flex-shrink-0 ml-2 mt-1" />
                        </div>

                        {/* Description */}
                        <p className="text-[#52525b] text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                          {problem.description}
                        </p>

                        {/* Tags */}
                        {problem.tags && (Array.isArray(problem.tags) ? problem.tags : (typeof problem.tags === 'string' ? problem.tags.split(',') : [])).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {(Array.isArray(problem.tags) ? problem.tags : (typeof problem.tags === 'string' ? problem.tags.split(',') : [])).slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs text-[#52525b] bg-[#18181b] border border-[#27272a] px-2 py-0.5 rounded-md">
                                {tag.trim ? tag.trim() : tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#27272a]/50 mt-auto">
                          <div className="flex flex-col gap-1">
                            {problem.source && (
                              <span className="text-xs text-[#3f3f46] italic">
                                Source: {problem.source}
                              </span>
                            )}
                          </div>
                          <Link to={`/editor/${problem.id}`}>
                            <button className="btn-primary px-4 py-1.5 text-sm rounded-lg">
                              Solve
                            </button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* No Results */}
              {filteredProblems.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <Code2 className="w-14 h-14 text-[#27272a] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#d4d4d8] mb-2">No challenges found</h3>
                  <p className="text-[#52525b]">Try adjusting your search or filters</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </Layout>
    </>
  );
};

export default ChallengesPage;