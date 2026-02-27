import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, Save, AlertCircle, CheckCircle, Clock, Database, Terminal, FlaskConical, Lightbulb, ChevronDown, ChevronUp, Bot, Sparkles, X, Swords, Trophy, Skull, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import DevoraPanel from '@/components/DevoraPanel';
import Editor from '@monaco-editor/react';
import monokaiTheme from 'monaco-themes/themes/Monokai.json';
import githubLightTheme from 'monaco-themes/themes/GitHub Light.json';
import draculaTheme from 'monaco-themes/themes/Dracula.json';
import cobaltTheme from 'monaco-themes/themes/Cobalt.json';
import { api, SubmissionStatus } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { socket } from '@/services/socket';

const HintItem = ({ hint, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-[#27272a] rounded-xl overflow-hidden bg-[#18181b]/60">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-[#18181b] text-[#d4d4d8] hover:bg-[#27272a] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-sm">Hint {index + 1}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#858585] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 text-[#a1a1aa] text-sm border-t border-[#27272a] whitespace-pre-wrap bg-[#09090b]">
              {hint}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const getDefaultBoilerplate = (language) => {
  switch (language) {
    case 'java':
      return `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`;
    case 'cpp':
      return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`;
    case 'python':
      return `def solution():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    solution()`;
    case 'javascript':
      return `function solution() {\n    // Write your code here\n}\n\nsolution();`;
    default:
      return `// Write your code here`;
  }
};

const InterviewTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' or 'countdown'
  const [time, setTime] = useState(0); // in seconds
  const [initialTime, setInitialTime] = useState(300); // 5 mins default
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (mode === 'countdown' && prevTime <= 1) {
            setIsActive(false);
            return 0; // Timer finished
          }
          return mode === 'countdown' ? prevTime - 1 : prevTime + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, mode]);

  const toggleTimer = () => {
    if (!isActive && time === 0 && mode === 'countdown') {
      setTime(initialTime); // Restart if it was at 0
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(mode === 'countdown' ? initialTime : 0);
  };

  const setCountdownTime = (mins) => {
    setInitialTime(mins * 60);
    setTime(mins * 60);
    setMode('countdown');
    setIsActive(false);
    setShowSettings(false);
  };

  const setStopwatchMode = () => {
    setMode('stopwatch');
    setTime(0);
    setIsActive(false);
    setShowSettings(false);
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex items-center gap-2 bg-[#18181b] px-3 py-1.5 rounded-lg border border-[#27272a] select-none">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="focus:outline-none flex items-center justify-center p-1 rounded hover:bg-[#27272a] transition-colors"
        title="Timer Settings"
      >
        <Clock className="w-4 h-4 text-amber-400" />
      </button>
      <span className={`font-mono font-semibold w-[45px] text-center tracking-wider ${time === 0 && mode === 'countdown' ? 'text-rose-400 animate-pulse' : 'text-[#d4d4d8]'}`}>
        {formatTime(time)}
      </span>

      <div className="flex items-center gap-1 border-l border-[#27272a] pl-2 ml-1">
        <button onClick={toggleTimer} className="text-[#52525b] hover:text-white p-1 rounded hover:bg-[#27272a] transition-colors">
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button onClick={resetTimer} className="text-[#52525b] hover:text-white p-1 rounded hover:bg-[#27272a] transition-colors" title="Reset Timer">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {showSettings && (
        <div className="absolute top-10 right-0 z-50 bg-[#18181b] border border-[#27272a] rounded-xl shadow-xl p-2 w-48 shadow-black/50">
          <h3 className="text-xs font-semibold text-[#52525b] uppercase tracking-wider mb-2 px-2">Interview Timer</h3>
          <div className="flex flex-col gap-1">
            <button onClick={() => setCountdownTime(5)} className={`text-left text-sm px-2 py-1.5 rounded hover:bg-[#27272a] ${mode === 'countdown' && initialTime === 300 ? 'text-amber-400' : 'text-[#d4d4d8]'}`}>
              5 Min Countdown
            </button>
            <button onClick={() => setCountdownTime(15)} className={`text-left text-sm px-2 py-1.5 rounded hover:bg-[#27272a] ${mode === 'countdown' && initialTime === 900 ? 'text-amber-400' : 'text-[#d4d4d8]'}`}>
              15 Min Countdown
            </button>
            <button onClick={() => setCountdownTime(30)} className={`text-left text-sm px-2 py-1.5 rounded hover:bg-[#27272a] ${mode === 'countdown' && initialTime === 1800 ? 'text-amber-400' : 'text-[#d4d4d8]'}`}>
              30 Min Countdown
            </button>
            <button onClick={setStopwatchMode} className={`text-left text-sm px-2 py-1.5 rounded hover:bg-[#27272a] ${mode === 'stopwatch' ? 'text-amber-400' : 'text-[#d4d4d8]'}`}>
              Stopwatch Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CodeEditorPage = () => {
  const { currentUser } = useAuth();
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');
  const collabRoomId = searchParams.get('roomId');
  const { toast } = useToast();

  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [battleResult, setBattleResult] = useState(null); // 'victory', 'defeat', 'opponent_left'
  const isReceivingCodeRef = useRef(false); // To prevent infinite echo in collab
  const [isPeerConnected, setIsPeerConnected] = useState(false);

  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [runResult, setRunResult] = useState(null);

  const [theme, setTheme] = useState('vs-dark');
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const cursorDecorationsRef = useRef([]);
  const collabRoomIdRef = useRef(collabRoomId);

  useEffect(() => {
    collabRoomIdRef.current = collabRoomId;
  }, [collabRoomId]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e) => {
      if (collabRoomIdRef.current && socket.connected) {
        socket.emit('cursor_change', {
          roomId: collabRoomIdRef.current,
          position: e.position,
          username: currentUser?.username || 'Peer'
        });
      }
    });
  };

  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('testcases');
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);

  const [leftWidth, setLeftWidth] = useState(40);
  const [rightWidth, setRightWidth] = useState(30);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [bottomHeight, setBottomHeight] = useState(40); // Percentage
  const [isVerticalDragging, setIsVerticalDragging] = useState(false);
  const containerRef = useRef(null);
  const rightPanelRef = useRef(null);

  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' }
  ];

  // Fetch problem details and user submission
  useEffect(() => {
    const fetchProblemAndSubmission = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [problemData, submissionData] = await Promise.all([
          api.fetchProblemById(challengeId),
          currentUser ? api.fetchUserSubmission(challengeId).catch(() => null) : Promise.resolve(null)
        ]);

        setProblem(problemData);

        if (submissionData && submissionData.code) {
          setSelectedLanguage(submissionData.language || 'javascript');
          setCode(submissionData.code);
        } else {
          // Set starter code if available, otherwise default
          const starter = problemData.starter_code?.[selectedLanguage] ||
            (problemData.starterCode ? problemData.starterCode[selectedLanguage] : null) ||
            getDefaultBoilerplate(selectedLanguage);
          setCode(starter);
        }
      } catch (err) {
        setError('Failed to load problem details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (challengeId) {
      fetchProblemAndSubmission();
    }
  }, [challengeId, currentUser]);

  // Matchmaking AND Collaboration Socket Listeners
  useEffect(() => {
    // Both features need socket connection
    if ((matchId || collabRoomId) && !socket.connected) {
      socket.connect();
    }

    if (matchId) {
      const onMatchOver = (data) => {
        if (data.winnerId === currentUser?.id) {
          setBattleResult('victory');
        } else {
          setBattleResult('defeat');
        }
      };

      const onOpponentDisconnected = () => {
        setBattleResult('opponent_left');
      };

      socket.on('match_over', onMatchOver);
      socket.on('opponent_disconnected', onOpponentDisconnected);

      return () => {
        socket.off('match_over', onMatchOver);
        socket.off('opponent_disconnected', onOpponentDisconnected);
      };
    }

    if (collabRoomId) {
      socket.emit('join_collaboration', { roomId: collabRoomId });

      const onCollabUserJoined = (data) => {
        setIsPeerConnected(true);
        toast({ title: "User Joined", description: `A peer has joined the collaboration room.`, className: "bg-[#007acc] text-white border-0" });
        // The host sends the current state to the newcomer
        if (code) {
          socket.emit('code_change', { roomId: collabRoomId, code: code });
        }
        socket.emit('language_change', { roomId: collabRoomId, language: selectedLanguage });
        socket.emit('collab_presence', { roomId: collabRoomId });
      };

      const onCollabPresence = () => {
        setIsPeerConnected(true);
      };

      const onCollabUserLeft = (data) => {
        setIsPeerConnected(false);
        toast({ title: "User Left", description: `A peer has left the room.` });

        // Remove their cursor
        if (editorRef.current && cursorDecorationsRef.current.length > 0) {
          cursorDecorationsRef.current = editorRef.current.deltaDecorations(cursorDecorationsRef.current, []);
        }
      };

      const onCodeUpdate = (data) => {
        isReceivingCodeRef.current = true;
        setCode(data.code);
        // Reset flag shortly after render
        setTimeout(() => { isReceivingCodeRef.current = false; }, 50);
      };

      const onLanguageUpdate = (data) => {
        setSelectedLanguage(data.language);
      };

      const onCursorUpdate = (data) => {
        const { position, username } = data;
        if (editorRef.current && monacoRef.current) {
          cursorDecorationsRef.current = editorRef.current.deltaDecorations(
            cursorDecorationsRef.current,
            [
              {
                range: new monacoRef.current.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                options: {
                  className: 'remote-cursor',
                  hoverMessage: { value: `**${username}**` }
                }
              }
            ]
          );
        }
      };

      socket.on('collab_user_joined', onCollabUserJoined);
      socket.on('collab_presence', onCollabPresence);
      socket.on('collab_user_left', onCollabUserLeft);
      socket.on('code_update', onCodeUpdate);
      socket.on('language_update', onLanguageUpdate);
      socket.on('cursor_update', onCursorUpdate);

      return () => {
        socket.emit('leave_collaboration', { roomId: collabRoomId });
        socket.off('collab_user_joined', onCollabUserJoined);
        socket.off('collab_presence', onCollabPresence);
        socket.off('collab_user_left', onCollabUserLeft);
        socket.off('code_update', onCodeUpdate);
        socket.off('language_update', onLanguageUpdate);
        socket.off('cursor_update', onCursorUpdate);
      };
    }
  }, [matchId, collabRoomId, currentUser, toast]);

  // Emit code changes (but don't echo back what we just received)
  const handleCodeChange = (value) => {
    setCode(value || '');
    if (collabRoomId && socket.connected && !isReceivingCodeRef.current) {
      socket.emit('code_change', { roomId: collabRoomId, code: value });
    }
  };

  // Emit language changes
  const handleLanguageChange = (langId) => {
    setSelectedLanguage(langId);
    if (problem) {
      const starter = problem.starter_code?.[langId] ||
        (problem.starterCode ? problem.starterCode[langId] : null) ||
        getDefaultBoilerplate(langId);
      setCode(starter);
      // Wait for setCode to propagate, or just send the new language directly
      if (collabRoomId && socket.connected) {
        socket.emit('language_change', { roomId: collabRoomId, language: langId });
        socket.emit('code_change', { roomId: collabRoomId, code: starter });
      }
    } else {
      if (collabRoomId && socket.connected) {
        socket.emit('language_change', { roomId: collabRoomId, language: langId });
      }
    }
  };

  const handleStartCollaboration = () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "You must be logged in to collaborate.", variant: "destructive" });
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 9);
    const collabUrl = `${window.location.origin}/editor/${challengeId}?roomId=${newRoomId}`;

    // Copy to clipboard
    navigator.clipboard.writeText(collabUrl).then(() => {
      toast({
        title: "Collaboration Link Copied!",
        description: "Share this link with a friend to code together in real-time.",
        className: "bg-green-600 text-white border-0"
      });
      // Navigate to the room ourselves
      navigate(`/editor/${challengeId}?roomId=${newRoomId}`, { replace: true });
    }).catch(err => {
      console.error("Failed to copy", err);
      toast({ title: "Error", description: "Failed to copy link to clipboard.", variant: "destructive" });
    });
  };

  const handleJoinCollaboration = () => {
    if (!joinRoomCode.trim()) return;
    if (!currentUser) {
      toast({ title: "Login Required", description: "You must be logged in to collaborate.", variant: "destructive" });
      return;
    }
    navigate(`/editor/${challengeId}?roomId=${joinRoomCode.trim()}`, { replace: true });
    setShowJoinInput(false);
    setJoinRoomCode('');
  };

  const handleLeaveMatch = () => {
    navigate('/challenges');
  };

  // Handle panel resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        const maxAvailableWidth = isAiPanelOpen ? 100 - rightWidth - 10 : 90;
        setLeftWidth(Math.min(Math.max(newWidth, 20), maxAvailableWidth));
      } else if (isRightDragging) {
        const newRightWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
        const maxAvailableRightWidth = 100 - leftWidth - 10;
        setRightWidth(Math.min(Math.max(newRightWidth, 15), maxAvailableRightWidth));
      }

      if (isVerticalDragging && rightPanelRef.current) {
        const rightPanelRect = rightPanelRef.current.getBoundingClientRect();
        const relativeY = e.clientY - rightPanelRect.top;
        const totalHeight = rightPanelRect.height;
        // Calculate height from bottom
        const newHeight = ((totalHeight - relativeY) / totalHeight) * 100;
        setBottomHeight(Math.min(Math.max(newHeight, 10), 85));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsRightDragging(false);
      setIsVerticalDragging(false);
    };

    if (isDragging || isVerticalDragging || isRightDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Disable text selection while dragging
      document.body.style.userSelect = 'none';
      if (isDragging || isRightDragging) {
        document.body.style.cursor = 'col-resize';
      } else {
        document.body.style.cursor = 'row-resize';
      }
    } else {
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';
    };
  }, [isDragging, isVerticalDragging, isRightDragging, leftWidth, rightWidth, isAiPanelOpen]);

  // Editor Power-Ups: Themes & Vim Mode
  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('monokai', monokaiTheme);
    monaco.editor.defineTheme('github-light', githubLightTheme);
    monaco.editor.defineTheme('dracula', draculaTheme);
    monaco.editor.defineTheme('cobalt', cobaltTheme);
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code before running.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setRunResult(null);
    setSubmissionResult(null); // Clear submission result if any
    setIsBottomPanelOpen(true);
    setActiveBottomTab('result');

    try {
      const result = await api.runCode({
        problemId: challengeId,
        code,
        language: selectedLanguage
      });

      setRunResult(result);

      if (result.status === "accepted") {
        toast({
          title: "Run Successful",
          description: "All test cases passed!",
          className: "bg-green-600 border-green-700 text-white"
        });
      } else {
        toast({
          title: "Run Failed",
          description: result.message || "Some test cases failed.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to run code.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    setRunResult(null); // Clear run result if any
    setIsBottomPanelOpen(true);
    setActiveBottomTab('result');

    try {
      const result = await api.submitSolution({
        problemId: challengeId,
        code,
        language: selectedLanguage
      });

      setSubmissionResult(result);

      if (result.status === SubmissionStatus.ACCEPTED) {
        toast({
          title: "Accepted! 🎉",
          description: "Congratulations! All test cases passed.",
          className: "bg-green-600 border-green-700 text-white"
        });
      } else {
        toast({
          title: "Submission Failed",
          description: result.message || "Some test cases failed.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit solution.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (problem) {
      const starter = problem.starter_code?.[selectedLanguage] ||
        (problem.starterCode ? problem.starterCode[selectedLanguage] : null) ||
        getDefaultBoilerplate(selectedLanguage);
      setCode(starter);
      setSubmissionResult(null);
      setRunResult(null);
      toast({
        title: "Code reset",
        description: "Your code has been reset to the starter template.",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case SubmissionStatus.ACCEPTED: return 'text-green-400';
      case SubmissionStatus.WRONG_ANSWER: return 'text-red-400';
      case SubmissionStatus.RUNTIME_ERROR: return 'text-orange-400';
      case SubmissionStatus.TIME_LIMIT_EXCEEDED: return 'text-yellow-400';
      case 'accepted': return 'text-green-400';
      case 'wrong_answer': return 'text-red-400';
      case 'runtime_error': return 'text-orange-400';
      case 'compilation_error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-[#d4d4d8]">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl text-[#d4d4d8] mb-2">Error Loading Problem</h2>
          <p className="text-[#52525b] mb-4">{error || "Problem not found"}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  const activeResult = submissionResult || runResult;

  return (
    <>
      <Helmet>
        <title>{problem.title} - CodeMaster</title>
        <meta name="description" content={problem.description?.slice(0, 160)} />
      </Helmet>

      <div className="h-screen flex flex-col bg-[#09090b]">
        {/* Battle Result Modal */}
        <AnimatePresence>
          {battleResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#18181b] border border-[#27272a] p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl"
              >
                {battleResult === 'victory' && (
                  <>
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                      <Trophy className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Victory!</h2>
                    <p className="text-[#858585] mb-6">You passed all test cases before your opponent.</p>
                  </>
                )}
                {battleResult === 'defeat' && (
                  <>
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50 flex-shrink-0">
                      <Skull className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Defeat!</h2>
                    <p className="text-[#858585] mb-6">Your opponent solved it first.</p>
                  </>
                )}
                {battleResult === 'opponent_left' && (
                  <>
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/50 flex-shrink-0">
                      <AlertCircle className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Opponent Left</h2>
                    <p className="text-[#858585] mb-6">Your opponent abandoned the match.</p>
                  </>
                )}
                <Button
                  onClick={handleLeaveMatch}
                  className="w-full btn-primary py-6 text-lg rounded-xl"
                >
                  Return to Challenges
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f0f12] border-b border-[#27272a]">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#f4f4f5]">{problem.title}</h1>
            {matchId && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded border bg-purple-500/20 text-purple-400 border-purple-500/30 flex items-center gap-1 animate-pulse">
                <Swords className="w-3 h-3" />
                1v1 Battle
              </span>
            )}
            {collabRoomId && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded border bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Pair Programming
                {isPeerConnected && <span className="ml-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" title="Peer Connected" />}
              </span>
            )}
            <span className={`px-2 py-0.5 text-xs rounded border ${problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
              {problem.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <InterviewTimer />

            {showJoinInput ? (
              <div className="flex items-center bg-[#0f0f12] border border-amber-500/40 rounded-lg overflow-hidden ml-2 h-8">
                <input
                  type="text"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinCollaboration()}
                  placeholder="Enter Room Code"
                  className="bg-transparent text-[#d4d4d8] text-xs px-2 py-1 outline-none w-32"
                  autoFocus
                />
                <button
                  onClick={handleJoinCollaboration}
                  className="bg-amber-500 hover:bg-amber-600 text-black p-1.5 h-full flex items-center justify-center transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowJoinInput(false)}
                  className="bg-[#27272a] hover:bg-rose-500/80 text-[#d4d4d8] p-1.5 h-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-1 ml-2">
                <Button
                  onClick={handleStartCollaboration}
                  variant="outline"
                  size="sm"
                  className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 h-8 text-xs px-3"
                  title="Create a new Pair Programming room"
                >
                  <Users className="w-3.5 h-3.5 mr-1" />
                  New Room
                </Button>
                <Button
                  onClick={() => setShowJoinInput(true)}
                  variant="outline"
                  size="sm"
                  className="border-[#27272a] text-[#52525b] hover:bg-[#27272a] hover:text-[#d4d4d8] h-8 text-xs px-3"
                  title="Join existing room with code"
                >
                  Join Room
                </Button>
              </div>
            )}

            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="border-[#27272a] text-[#d4d4d8] hover:bg-[#27272a]"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>

            <Button
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              variant="outline"
              size="sm"
              className={`border-[#27272a] hover:bg-[#27272a] flex items-center gap-1 w-12 px-0 ${isAiPanelOpen ? 'bg-[#27272a] text-white' : 'text-[#d4d4d8]'}`}
              title="Ask AI"
            >
              <div className="relative flex items-center justify-center w-full h-full">
                <Bot className="w-5 h-5 absolute" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
              </div>
            </Button>

            <Button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              size="sm"
              className="bg-[#18181b] hover:bg-[#27272a] text-white border border-[#27272a]"
            >
              {isRunning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <>
                  <FlaskConical className="w-4 h-4 mr-1" />
                  Run
                </>
              )}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isRunning}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-black min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content with Manual Resize Support */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Problem Statement */}
          <div
            style={{ width: `${leftWidth}%` }}
            className="flex flex-col border-r border-[#27272a] overflow-hidden bg-[#09090b]"
          >
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#27272a]">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-[#f4f4f5] text-xl font-semibold mb-4">Description</h2>
                <div className="text-[#a1a1aa] mb-6 whitespace-pre-wrap">{problem.description}</div>

                {problem.input_format && (
                  <>
                    <h3 className="text-[#f4f4f5] text-lg font-semibold mb-2">Input Format</h3>
                    <div className="bg-[#18181b] p-3 rounded-lg text-[#a1a1aa] mb-4 font-mono text-sm whitespace-pre-wrap">
                      {problem.input_format}
                    </div>
                  </>
                )}

                {problem.output_format && (
                  <>
                    <h3 className="text-[#f4f4f5] text-lg font-semibold mb-2">Output Format</h3>
                    <div className="bg-[#18181b] p-3 rounded-lg text-[#a1a1aa] mb-4 font-mono text-sm whitespace-pre-wrap">
                      {problem.output_format}
                    </div>
                  </>
                )}

                {problem.examples && problem.examples.length > 0 && (
                  <div className="mb-8 mt-6">
                    {problem.examples.map((example, index) => (
                      <div key={index} className="mb-6">
                        <h3 className="text-white font-bold mb-3">Example {index + 1}:</h3>
                        <div className="border-l-2 border-amber-500/30 pl-4 py-1">
                          <div className="font-mono text-sm mb-1">
                            <span className="text-white font-bold">Input:</span> <br /><span className="text-[#c5c5c5] whitespace-pre-wrap">{example.display_input || example.input}</span>
                          </div>
                          <div className="font-mono text-sm">
                            <span className="text-white font-bold">Output:</span> <br /><span className="text-[#c5c5c5] whitespace-pre-wrap">{example.expected_output}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints && (
                  <>
                    <h3 className="text-[#d4d4d4] text-lg font-semibold mb-2">Constraints</h3>
                    <ul className="list-disc list-inside space-y-1 text-[#a1a1aa] mb-6">
                      {Array.isArray(problem.constraints)
                        ? problem.constraints.map((c, i) => <li key={i}>{c}</li>)
                        : <li className="whitespace-pre-wrap">{problem.constraints}</li>
                      }
                    </ul>
                  </>
                )}

                {problem.hints && problem.hints.length > 0 && (
                  <>
                    <h3 className="text-[#f4f4f5] text-lg font-semibold mb-3">Hints</h3>
                    <div className="space-y-3 mb-6">
                      {problem.hints.map((hint, index) => (
                        <HintItem key={index} hint={hint} index={index} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Horizontal Resizer */}
          <div
            className="w-1 bg-[#27272a] hover:bg-amber-500 cursor-col-resize transition-colors z-10"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
          />

          {/* Middle Panel - Code Editor & Results */}
          <div
            ref={rightPanelRef}
            style={{ width: isAiPanelOpen ? `${100 - leftWidth - rightWidth}%` : `${100 - leftWidth}%` }}
            className="flex flex-col overflow-hidden bg-[#09090b]"
          >
            {/* Top Part: Language Selector + Code Editor */}
            <div
              style={isBottomPanelOpen ? { height: `${100 - bottomHeight}%` } : {}}
              className={`flex flex-col overflow-hidden ${!isBottomPanelOpen ? 'flex-1' : ''}`}
            >
              {/* Language Selector & Power-Ups */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#0f0f12] border-b border-[#27272a] flex-shrink-0">
                <div className="flex items-center gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`px-3 py-1 text-sm rounded transition-all ${selectedLanguage === lang.id
                        ? 'bg-amber-500 text-black font-medium'
                        : 'bg-[#18181b] text-[#d4d4d8] hover:bg-[#27272a]'
                        }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="bg-[#18181b] text-[#d4d4d8] text-sm px-2 py-1.5 rounded border border-[#27272a] outline-none hover:bg-[#27272a] transition-colors"
                  >
                    <option value="vs-dark">VS Dark</option>
                    <option value="monokai">Monokai</option>
                    <option value="github-light">GitHub Light</option>
                    <option value="dracula">Dracula</option>
                    <option value="cobalt">Cobalt</option>
                  </select>
                </div>
              </div>

              {/* Code Editor */}
              <div className={`flex-1 overflow-hidden relative flex flex-col transition-all duration-300 ${isPeerConnected ? 'border-2 border-amber-500/40 shadow-glow-amber' : ''}`}>
                <div className="flex-1 relative">
                  <Editor
                    height="100%"
                    language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                    theme={theme}
                    value={code}
                    onChange={handleCodeChange}
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorDidMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      padding: { top: 16 }
                    }}
                    loading={<div className="flex h-full items-center justify-center text-[#52525b]">Loading editor...</div>}
                  />
                </div>
              </div>
            </div>

            {/* Vertical Resizer */}
            {isBottomPanelOpen && (
              <div
                className="h-1 bg-[#27272a] hover:bg-amber-500 cursor-row-resize transition-colors z-10 flex-shrink-0"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsVerticalDragging(true);
                }}
              />
            )}

            {/* Bottom Part: Results & Testcases Toggle */}
            <div className="flex flex-col bg-[#09090b] flex-shrink-0" style={isBottomPanelOpen ? { height: `${bottomHeight}%` } : { height: '36px' }}>
              {/* Tab Header */}
              <div className="flex items-center justify-between px-4 bg-[#0f0f12] border-t border-[#27272a] flex-shrink-0" style={{ height: '36px' }}>
                <div className="flex items-center gap-2 h-full">
                  <button
                    onClick={() => { setIsBottomPanelOpen(true); setActiveBottomTab('testcases'); }}
                    className={`flex items-center gap-2 px-3 h-full text-sm font-medium transition-colors ${activeBottomTab === 'testcases' && isBottomPanelOpen ? 'text-white border-t-2 border-amber-500 bg-[#09090b]' : 'text-[#52525b] hover:text-white border-t-2 border-transparent'}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Testcases
                  </button>
                  <button
                    onClick={() => { setIsBottomPanelOpen(true); setActiveBottomTab('result'); }}
                    className={`flex items-center gap-2 px-3 h-full text-sm font-medium transition-colors ${activeBottomTab === 'result' && isBottomPanelOpen ? 'text-white border-t-2 border-amber-500 bg-[#09090b]' : 'text-[#52525b] hover:text-white border-t-2 border-transparent'}`}
                  >
                    <Terminal className="w-4 h-4" />
                    Test Result
                  </button>
                </div>
                <button
                  onClick={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
                  className="text-[#52525b] hover:text-[#d4d4d8] p-1 rounded hover:bg-[#27272a]"
                >
                  {isBottomPanelOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {/* Tab Content */}
              {isBottomPanelOpen && (
                <div className="flex-1 overflow-y-auto bg-[#09090b]">
                  {activeBottomTab === 'testcases' ? (
                    <div className="p-4 h-full">
                      {problem?.examples && problem.examples.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex gap-2">
                            {problem.examples.map((ex, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveTestCaseIndex(i)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTestCaseIndex === i ? 'bg-[#27272a] text-white' : 'bg-[#18181b] text-[#52525b] hover:bg-[#27272a] hover:text-white'}`}
                              >
                                Case {i + 1}
                              </button>
                            ))}
                          </div>

                          {problem.examples[activeTestCaseIndex] && (
                            <div className="flex flex-col gap-4">
                              <div>
                                <div className="text-xs text-[#52525b] mb-2 font-semibold">Input</div>
                                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3 font-mono text-sm text-[#d4d4d8] whitespace-pre-wrap">
                                  {problem.examples[activeTestCaseIndex].display_input || problem.examples[activeTestCaseIndex].input}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-[#52525b] mb-2 font-semibold">Expected Output</div>
                                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3 font-mono text-sm text-[#d4d4d8] whitespace-pre-wrap">
                                  {problem.examples[activeTestCaseIndex].expected_output}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[#52525b] text-sm flex items-center justify-center h-full">No test cases available.</div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full">
                      {activeResult ? (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col"
                          >
                            <div className="flex-1 overflow-y-auto p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <Terminal className="w-5 h-5 text-[#52525b]" />
                                  <h3 className="font-semibold text-[#d4d4d8]">{submissionResult ? "Submission Result" : "Test Run Result"}</h3>
                                </div>
                                <span className={`text-lg font-bold ${getStatusColor(activeResult.status)} uppercase`}>
                                  {activeResult.status.replace('_', ' ')}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-4">
                                {activeResult.execution_time && (
                                  <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a] flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-400" />
                                    <span className="text-[#52525b] text-sm">Time:</span>
                                    <span className="text-[#d4d4d8] font-mono">{activeResult.execution_time}</span>
                                  </div>
                                )}
                                {activeResult.memory_used && (
                                  <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a] flex items-center gap-2">
                                    <Database className="w-4 h-4 text-amber-400" />
                                    <span className="text-[#52525b] text-sm">Memory:</span>
                                    <span className="text-[#d4d4d8] font-mono">{activeResult.memory_used}</span>
                                  </div>
                                )}
                              </div>

                              {activeResult.error && (
                                <div className="bg-red-900/20 border border-red-900/40 p-3 rounded mb-4">
                                  <h4 className="text-red-400 font-semibold mb-1 text-sm">Error Message:</h4>
                                  <pre className="text-red-300/80 text-xs font-mono whitespace-pre-wrap">{activeResult.error}</pre>
                                </div>
                              )}

                              {activeResult.reference_solution && activeResult.status === SubmissionStatus.ACCEPTED && (
                                <div className="bg-[#09090b] p-4 rounded-lg border border-[#27272a]">
                                  <h4 className="text-amber-400 font-semibold mb-2 text-sm">Reference Solution:</h4>
                                  <pre className="text-[#d4d4d8] text-xs font-mono overflow-x-auto">
                                    {activeResult.reference_solution}
                                  </pre>
                                </div>
                              )}

                              {activeResult.first_failed && (
                                <div className="bg-[#09090b] p-4 rounded-lg border border-[#27272a] mb-4">
                                  <h4 className="text-red-400 font-semibold mb-2 text-sm">Failed Test Case:</h4>
                                  <div className="grid gap-2 text-xs font-mono">
                                    <div>
                                      <span className="text-[#52525b]">Input:</span>
                                      <div className="bg-[#18181b] p-2 rounded mt-1 text-[#d4d4d8]">{activeResult.first_failed.display_input || activeResult.first_failed.input}</div>
                                    </div>
                                    <div>
                                      <span className="text-[#52525b]">Expected:</span>
                                      <div className="bg-[#18181b] p-2 rounded mt-1 text-emerald-400">{activeResult.first_failed.expected}</div>
                                    </div>
                                    <div>
                                      <span className="text-[#52525b]">Output:</span>
                                      <div className="bg-[#18181b] p-2 rounded mt-1 text-rose-400">{activeResult.first_failed.output}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-between mt-4 border-t border-[#27272a] pt-4">
                                {(activeResult.status !== SubmissionStatus.ACCEPTED && activeResult.status !== 'accepted') ? (
                                  <Button
                                    onClick={() => {
                                      setSubmissionResult(null); // Clear result first to free up screen real-estate
                                      setRunResult(null);
                                      setIsAiPanelOpen(true);
                                    }}
                                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                                  >
                                    <Bot className="w-4 h-4" />
                                    Get Help from AI
                                  </Button>
                                ) : (
                                  <div></div>
                                )}
                                <Button
                                  onClick={() => {
                                    setSubmissionResult(null);
                                    setRunResult(null);
                                    setIsBottomPanelOpen(false);
                                  }}
                                  variant="ghost"
                                  className="text-[#52525b] hover:text-[#d4d4d8] hover:bg-[#27272a]"
                                >
                                  Close Results
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-[#52525b] h-full">
                          <Terminal className="w-8 h-8 mb-3 opacity-50" />
                          <p className="text-sm">Run or submit your code to see results.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Panel Resizer & AI Panel */}
          {isAiPanelOpen && (
            <>
              {/* Vertical right side resizer */}
              <div
                className="w-1 bg-[#27272a] hover:bg-violet-500 cursor-col-resize transition-colors z-10 flex-shrink-0"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsRightDragging(true);
                }}
              />
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: `${rightWidth}%`, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col border-l border-[#27272a] bg-[#09090b] overflow-hidden"
              >
                <div className="flex justify-between items-center p-2 border-b border-[#27272a] bg-[#0f0f12]">
                  <div className="flex items-center gap-2 px-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-[#d4d4d8]">Devora AI Assistant</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAiPanelOpen(false)}
                    className="h-8 w-8 p-0 text-[#52525b] hover:text-white hover:bg-[#27272a]"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <DevoraPanel challengeId={challengeId} code={code} />
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CodeEditorPage;
