import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, CheckCircle, AlertCircle, Save, X, ChevronDown, ChevronUp, Search, Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
    const [problems, setProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingProblem, setIsAddingProblem] = useState(false);
    const [editingProblemId, setEditingProblemId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('problems'); // 'problems' | 'settings'
    const [adminCode, setAdminCode] = useState('');
    const [isSavingCode, setIsSavingCode] = useState(false);
    const { toast } = useToast();

    const [newProblem, setNewProblem] = useState({
        title: '',
        description: '',
        input_format: '',
        output_format: '',
        constraints: '',
        difficulty: 'Easy',
        tags: '',
        source: '',
        is_validated: true,
        reference_solution: ''
    });

    const [testCases, setTestCases] = useState([{ input: '', display_input: '', expected_output: '' }]);
    const [hints, setHints] = useState([{ hint_text: '', hint_order: 1 }]);

    useEffect(() => {
        fetchProblems();
        fetchAdminSettings();
    }, []);

    const fetchAdminSettings = async () => {
        try {
            const data = await api.getAdminSettings();
            if (data && data.adminCode) {
                setAdminCode(data.adminCode);
            }
        } catch (error) {
            console.error("Failed to load admin settings:", error);
        }
    };

    const handleSaveAdminCode = async () => {
        setIsSavingCode(true);
        try {
            await api.updateAdminSettings({ adminCode });
            toast({ title: "Success", description: "Admin access code updated successfully.", className: "bg-green-600 text-white" });
        } catch (error) {
            toast({ title: "Error", description: error.message || "Failed to update code.", variant: "destructive" });
        } finally {
            setIsSavingCode(false);
        }
    };

    const fetchProblems = async () => {
        setIsLoading(true);
        try {
            const data = await api.fetchProblems();
            setProblems(data);
        } catch (error) {
            toast({
                title: "Error fetching problems",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditProblem = async (problem) => {
        try {
            // Fetch full details including test cases and hints
            const data = await api.getAdminProblem(problem.id);

            setNewProblem({
                title: data.problem.title,
                description: data.problem.description,
                input_format: data.problem.input_format,
                output_format: data.problem.output_format,
                constraints: data.problem.constraints,
                difficulty: data.problem.difficulty,
                tags: Array.isArray(data.problem.tags) ? data.problem.tags.join(', ') : data.problem.tags,
                source: data.problem.source || '',
                is_validated: data.problem.is_validated,
                reference_solution: data.problem.reference_solution || ''
            });

            // Set Test Cases (ensure at least one empty if none exist)
            if (data.testCases && data.testCases.length > 0) {
                setTestCases(data.testCases.map(tc => ({ input: tc.input, display_input: tc.display_input || '', expected_output: tc.expected_output })));
            } else {
                setTestCases([{ input: '', display_input: '', expected_output: '' }]);
            }

            // Set Hints (ensure at least one empty if none exist)
            if (data.hints && data.hints.length > 0) {
                setHints(data.hints.map(h => ({ hint_text: h.hint_text, hint_order: h.hint_order })));
            } else {
                setHints([{ hint_text: '', hint_order: 1 }]);
            }

            setEditingProblemId(problem.id);
            setIsAddingProblem(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            toast({ title: "Error fetching problem details", description: error.message, variant: "destructive" });
        }
    };

    const cancelEdit = () => {
        setIsAddingProblem(false);
        setEditingProblemId(null);
        setNewProblem({
            title: '',
            description: '',
            input_format: '',
            output_format: '',
            constraints: '',
            difficulty: 'Easy',
            tags: '',
            source: '',
            is_validated: true,
            reference_solution: ''
        });
        setTestCases([{ input: '', display_input: '', expected_output: '' }]);
        setHints([{ hint_text: '', hint_order: 1 }]);
    };

    const handleAddProblem = async () => {
        try {
            if (!newProblem.title || !newProblem.description) {
                toast({ title: "Validation Error", description: "Title and Description are required", variant: "destructive" });
                return;
            }

            const problemPayload = {
                problem: {
                    ...newProblem,
                    tags: newProblem.tags.split(',').map(tag => tag.trim())
                },
                testCases: testCases.filter(tc => tc.input && tc.expected_output),
                hints: hints.filter(h => h.hint_text)
            };

            if (editingProblemId) {
                await api.updateProblem(editingProblemId, problemPayload);
                toast({ title: "Success", description: "Problem updated successfully", className: "bg-green-600 text-white" });
            } else {
                await api.addProblem(problemPayload);
                toast({ title: "Success", description: "Problem added successfully", className: "bg-green-600 text-white" });
            }

            cancelEdit();
            fetchProblems();

        } catch (error) {
            toast({ title: "Error saving problem", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteProblem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this problem?")) return;
        try {
            await api.deleteProblem(id);
            toast({ title: "Problem Deleted", description: "Problem has been removed." });
            fetchProblems();
        } catch (error) {
            toast({ title: "Error deleting problem", description: error.message, variant: "destructive" });
        }
    };

    const filteredProblems = problems.filter(prob =>
        prob.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prob.tags && prob.tags.toString().toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const stats = {
        total: problems.length,
        easy: problems.filter(p => p.difficulty === 'Easy').length,
        medium: problems.filter(p => p.difficulty === 'Medium').length,
        hard: problems.filter(p => p.difficulty === 'Hard').length
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard - CodeMaster</title>
            </Helmet>

            <div className="min-h-screen bg-[#1e1e1e] p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <Link to="/">
                                <Button variant="outline" size="icon" className="border-[#3e3e42] text-[#d4d4d4] hover:bg-[#3e3e42]">
                                    <Home className="h-5 w-5" />
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold text-[#d4d4d4]">Admin Dashboard</h1>

                            <div className="ml-8 flex bg-[#252526] rounded-md p-1 border border-[#3e3e42]">
                                <button
                                    onClick={() => setActiveTab('problems')}
                                    className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${activeTab === 'problems' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#d4d4d4]'}`}
                                >
                                    Problems
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`px-4 py-1.5 rounded-sm text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'settings' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#d4d4d4]'}`}
                                >
                                    <Settings className="w-4 h-4" /> Settings
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {activeTab === 'problems' && (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#858585]" />
                                        <input
                                            type="text"
                                            placeholder="Search problems..."
                                            className="pl-9 pr-4 py-2 bg-[#252526] border border-[#3e3e42] rounded-md text-[#d4d4d4] focus:outline-none focus:border-emerald-500 w-64 transition-colors shadow-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={() => {
                                        if (isAddingProblem) cancelEdit();
                                        else setIsAddingProblem(true);
                                    }} className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-lg shadow-emerald-500/20">
                                        {isAddingProblem ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                        {isAddingProblem ? "Cancel" : "Add Problem"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats Overview */}
                    {activeTab === 'problems' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-[#252526] p-4 rounded-lg border border-[#3e3e42] text-center shadow-sm">
                                    <h3 className="text-[#858585] text-sm uppercase font-semibold tracking-wider">Total Problems</h3>
                                    <p className="text-3xl font-bold text-[#d4d4d4] mt-2">{stats.total}</p>
                                </div>
                                <div className="bg-[#252526] p-4 rounded-lg border border-b-4 border-[#3e3e42] border-b-green-500 text-center shadow-sm">
                                    <h3 className="text-[#858585] text-sm uppercase font-semibold tracking-wider">Easy</h3>
                                    <p className="text-3xl font-bold text-green-500 mt-2">{stats.easy}</p>
                                </div>
                                <div className="bg-[#252526] p-4 rounded-lg border border-b-4 border-[#3e3e42] border-b-yellow-500 text-center shadow-sm">
                                    <h3 className="text-[#858585] text-sm uppercase font-semibold tracking-wider">Medium</h3>
                                    <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.medium}</p>
                                </div>
                                <div className="bg-[#252526] p-4 rounded-lg border border-b-4 border-[#3e3e42] border-b-red-500 text-center shadow-sm">
                                    <h3 className="text-[#858585] text-sm uppercase font-semibold tracking-wider">Hard</h3>
                                    <p className="text-3xl font-bold text-red-500 mt-2">{stats.hard}</p>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isAddingProblem && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-[#252526] p-6 rounded-lg mb-8 border border-emerald-500/30 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                    >
                                        <h2 className="text-xl text-[#d4d4d4] mb-4 font-semibold border-b border-[#3e3e42] pb-2">
                                            {editingProblemId ? "Edit Problem" : "Add New Problem"}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label className="block text-[#d4d4d4] mb-2">Title</label>
                                                <input
                                                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] p-2 rounded text-[#d4d4d4]"
                                                    value={newProblem.title}
                                                    onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[#d4d4d4] mb-2">Difficulty</label>
                                                <select
                                                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] p-2 rounded text-[#d4d4d4]"
                                                    value={newProblem.difficulty}
                                                    onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                                                >
                                                    <option>Easy</option>
                                                    <option>Medium</option>
                                                    <option>Hard</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[#d4d4d4] mb-2">Description</label>
                                                <textarea
                                                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] p-2 rounded text-[#d4d4d4] h-32"
                                                    value={newProblem.description}
                                                    onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[#d4d4d4] mb-2">Input Format</label>
                                                <textarea
                                                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] p-2 rounded text-[#d4d4d4]"
                                                    value={newProblem.input_format}
                                                    onChange={(e) => setNewProblem({ ...newProblem, input_format: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[#d4d4d4] mb-2">Output Format</label>
                                                <textarea
                                                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] p-2 rounded text-[#d4d4d4]"
                                                    value={newProblem.output_format}
                                                    onChange={(e) => setNewProblem({ ...newProblem, output_format: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[#d4d4d4] mb-2">Constraints</label>
                                                <textarea
                                                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] p-2 rounded text-[#d4d4d4]"
                                                    value={newProblem.constraints}
                                                    onChange={(e) => setNewProblem({ ...newProblem, constraints: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[#d4d4d4] mb-2">Tags (comma separated)</label>
                                                <input
                                                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] p-2 rounded text-[#d4d4d4]"
                                                    value={newProblem.tags}
                                                    onChange={(e) => setNewProblem({ ...newProblem, tags: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Test Cases */}
                                        <div className="mb-6">
                                            <h3 className="text-[#d4d4d4] font-semibold mb-2">Test Cases</h3>
                                            {testCases.map((tc, idx) => (
                                                <div key={idx} className="flex flex-col gap-2 mb-4 bg-[#1e1e1e] p-3 rounded border border-[#3e3e42]">
                                                    <div className="flex gap-4">
                                                        <input
                                                            placeholder="Execution Input (passed to code)"
                                                            className="flex-1 bg-[#252526] border border-[#3e3e42] p-2 rounded text-[#d4d4d4]"
                                                            value={tc.input}
                                                            onChange={(e) => {
                                                                const newTCs = [...testCases];
                                                                newTCs[idx].input = e.target.value;
                                                                setTestCases(newTCs);
                                                            }}
                                                        />
                                                        <input
                                                            placeholder="Expected Output"
                                                            className="flex-1 bg-[#252526] border border-[#3e3e42] p-2 rounded text-[#d4d4d4]"
                                                            value={tc.expected_output}
                                                            onChange={(e) => {
                                                                const newTCs = [...testCases];
                                                                newTCs[idx].expected_output = e.target.value;
                                                                setTestCases(newTCs);
                                                            }}
                                                        />
                                                    </div>
                                                    <textarea
                                                        placeholder="Display Input (Optional, shown beautifully to user)"
                                                        className="w-full bg-[#252526] border border-[#3e3e42] p-2 rounded text-[#d4d4d4] h-20"
                                                        value={tc.display_input}
                                                        onChange={(e) => {
                                                            const newTCs = [...testCases];
                                                            newTCs[idx].display_input = e.target.value;
                                                            setTestCases(newTCs);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setTestCases([...testCases, { input: '', display_input: '', expected_output: '' }])}
                                                className="text-[#d4d4d4]"
                                            >
                                                + Add Test Case
                                            </Button>
                                        </div>

                                        {/* Hints */}
                                        <div className="mb-6">
                                            <h3 className="text-[#d4d4d4] font-semibold mb-2">Hints</h3>
                                            {hints.map((h, idx) => (
                                                <div key={idx} className="flex gap-4 mb-2">
                                                    <input
                                                        placeholder={`Hint ${idx + 1}`}
                                                        className="flex-1 bg-[#1e1e1e] border border-[#3e3e42] p-2 rounded text-[#d4d4d4]"
                                                        value={h.hint_text}
                                                        onChange={(e) => {
                                                            const newHints = [...hints];
                                                            newHints[idx].hint_text = e.target.value;
                                                            newHints[idx].hint_order = idx + 1;
                                                            setHints(newHints);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setHints([...hints, { hint_text: '', hint_order: hints.length + 1 }])}
                                                className="text-[#d4d4d4]"
                                            >
                                                + Add Hint
                                            </Button>
                                        </div>

                                        <Button onClick={handleAddProblem} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                            <Save className="mr-2 h-4 w-4" /> {editingProblemId ? "Update Problem" : "Save Problem"}
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid gap-4">
                                {filteredProblems.map((prob) => (
                                    <motion.div
                                        key={prob.id}
                                        whileHover={{ y: -2 }}
                                        className="bg-[#252526] p-5 rounded-lg border border-[#3e3e42] border-l-4 border-l-emerald-500 flex flex-col md:flex-row justify-between items-start md:items-center transition-all hover:bg-[#2d2d30] shadow-sm hover:shadow-md"
                                    >
                                        <div className="mb-4 md:mb-0">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-[#d4d4d4]">{prob.title}</h3>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${prob.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                    prob.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    }`}>
                                                    {prob.difficulty}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                {prob.tags && (Array.isArray(prob.tags) ? prob.tags : prob.tags.split(',')).slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="text-xs text-[#858585] bg-[#1e1e1e] px-2 py-1 rounded inline-block border border-[#3e3e42]">
                                                        {typeof tag === 'string' ? tag.trim() : tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-[#d4d4d4] hover:bg-[#3e3e42]"
                                                onClick={() => handleEditProblem(prob)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteProblem(prob.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#252526] p-6 rounded-lg border border-[#3e3e42] shadow-sm max-w-2xl mx-auto mt-8"
                        >
                            <h2 className="text-xl text-[#d4d4d4] mb-4 font-semibold border-b border-[#3e3e42] pb-2 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-emerald-500" /> Administrative Security
                            </h2>
                            <div className="mb-6">
                                <label className="block text-[#d4d4d4] mb-2 font-medium">New Admin Access Code</label>
                                <p className="text-sm text-[#858585] mb-4">This code is required when a new user signs up and selects the "Admin / Instructor" role.</p>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        className="flex-1 bg-[#1e1e1e] border border-[#3e3e42] p-3 rounded-md text-[#d4d4d4] focus:outline-none focus:border-[#007acc] transition-colors"
                                        value={adminCode}
                                        onChange={(e) => setAdminCode(e.target.value)}
                                        placeholder="Enter secure passcode"
                                    />
                                    <Button
                                        onClick={handleSaveAdminCode}
                                        disabled={isSavingCode || !adminCode}
                                        className="bg-[#007acc] hover:bg-[#005a9e] text-white px-8"
                                    >
                                        {isSavingCode ? "Saving..." : "Save Code"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboardPage;
