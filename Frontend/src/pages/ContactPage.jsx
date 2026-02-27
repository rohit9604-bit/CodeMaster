import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { PhoneCall, Mail, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';

const ContactPage = () => {
    return (
        <>
            <Helmet>
                <title>Contact Us - CodeMaster</title>
                <meta name="description" content="Contact CodeMaster support team." />
            </Helmet>
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[70vh] flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="glass-card p-12 text-center max-w-2xl w-full"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-glow-amber">
                                <PhoneCall className="w-7 h-7 text-black" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-[#f4f4f5] mb-3">Get in Touch</h1>
                        <p className="text-[#52525b] mb-8 leading-relaxed max-w-md mx-auto">
                            Have a question or feedback? We'd love to hear from you. Reach out and we'll get back within 48-72 hours.
                        </p>

                        <div className="space-y-4 max-w-sm mx-auto">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0f0f12] border border-[#27272a] text-left">
                                <div className="p-2 rounded-lg bg-amber-500/10">
                                    <Mail className="w-4 h-4 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#52525b] mb-0.5">Email</p>
                                    <a href="mailto:rohitmandan09@gmail.com" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
                                        rohitmandan09@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0f0f12] border border-[#27272a] text-left">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#52525b] mb-0.5">Phone</p>
                                    <p className="text-[#d4d4d8] text-sm font-medium">+91 9604399743</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Layout>
        </>
    );
};

export default ContactPage;
