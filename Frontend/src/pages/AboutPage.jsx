import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Code2, Heart, Lightbulb, Rocket } from 'lucide-react';
import Layout from '@/components/Layout';

const features = [
    { icon: Lightbulb, title: 'Innovative', desc: 'Constantly exploring new ideas and modern tech stacks.', color: 'amber' },
    { icon: Heart, title: 'Passionate', desc: 'Deeply committed to the craft of software development.', color: 'rose' },
    { icon: Rocket, title: 'Driven', desc: 'Focused on delivering high-quality, impactful solutions.', color: 'violet' },
    { icon: Code2, title: 'Skilled', desc: 'Mastery over both front-end and back-end ecosystems.', color: 'emerald' },
];

const colorMap = {
    amber: { icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/30' },
    rose: { icon: 'text-rose-400', bg: 'bg-rose-500/10', border: 'hover:border-rose-500/30' },
    violet: { icon: 'text-violet-400', bg: 'bg-violet-500/10', border: 'hover:border-violet-500/30' },
    emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/30' },
};

const AboutPage = () => {
    return (
        <>
            <Helmet>
                <title>About Us - CodeMaster</title>
                <meta name="description" content="Learn more about CodeMaster and its creator, Rohit Mandan." />
            </Helmet>
            <Layout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                            <span className="text-[#f4f4f5]">About </span>
                            <span className="text-gradient">CodeMaster</span>
                        </h1>
                        <p className="text-lg text-[#52525b] max-w-3xl mx-auto leading-relaxed">
                            CodeMaster is a premier coding platform designed to help developers of all levels master their skills
                            through challenging problems, AI-powered assistance, and a structured learning environment.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold text-[#f4f4f5] mb-6 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-amber-500/10">
                                    <Code2 className="w-6 h-6 text-amber-400" />
                                </div>
                                Meet the Developer
                            </h2>
                            <div className="space-y-5 text-[#a1a1aa] leading-relaxed">
                                <p>
                                    This platform was conceptualized and developed entirely by <strong className="text-[#f4f4f5]">Rohit Mandan</strong>.
                                    As a passionate full-stack developer and a visionary tech enthusiast, Rohit combined his love for
                                    clean code, elegant problem-solving, and continuous learning to build CodeMaster from the ground up.
                                </p>
                                <p>
                                    Rohit is known for his exceptional analytical skills and a meticulous approach to software engineering.
                                    He doesn't just write code; he crafts robust, scalable, and user-friendly digital experiences.
                                </p>
                                <p>
                                    Whether designing seamless user interfaces or architecting complex backend systems, Rohit consistently
                                    demonstrates a deep understanding of modern web technologies and a relentless drive for innovation.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {features.map((feat, i) => {
                                const c = colorMap[feat.color];
                                return (
                                    <motion.div
                                        key={feat.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className={`glass-card p-5 transition-all duration-300 ${c.border}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                                            <feat.icon className={`w-5 h-5 ${c.icon}`} />
                                        </div>
                                        <h3 className="text-base font-semibold text-[#f4f4f5] mb-1">{feat.title}</h3>
                                        <p className="text-[#52525b] text-sm leading-relaxed">{feat.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default AboutPage;
