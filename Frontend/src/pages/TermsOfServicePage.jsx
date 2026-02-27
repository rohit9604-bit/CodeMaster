import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';

const sections = [
    {
        title: '1. Acceptance of Terms',
        content: "By accessing or using the CodeMaster platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
    },
    {
        title: '2. Use License',
        content: "Permission is granted to temporarily download one copy of the materials (information or software) on CodeMaster's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."
    },
    {
        title: '3. User Conduct',
        content: "You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website. Prohibited behavior includes harassing or causing distress or inconvenience to any other user."
    },
    {
        title: '4. Code Submissions',
        content: 'When you submit code to CodeMaster, you retain ownership of your code, but you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display your submissions in connection with the service.'
    },
    {
        title: '5. Disclaimer',
        content: "The materials on CodeMaster's website are provided on an 'as is' basis. CodeMaster makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose."
    },
    {
        title: '6. Contact Us',
        content: null
    },
];

const TermsOfServicePage = () => {
    return (
        <>
            <Helmet>
                <title>Terms of Service - CodeMaster</title>
                <meta name="description" content="CodeMaster Terms of Service." />
            </Helmet>
            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl font-bold mb-4">
                            <span className="text-[#f4f4f5]">Terms of </span>
                            <span className="text-gradient">Service</span>
                        </h1>
                        <p className="text-[#3f3f46] text-sm mb-10">Last updated: {new Date().toLocaleDateString()}</p>
                    </motion.div>

                    <div className="space-y-8">
                        {sections.map((section, i) => (
                            <motion.section
                                key={section.title}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                            >
                                <h2 className="text-xl font-semibold text-[#f4f4f5] mb-3">{section.title}</h2>
                                {section.content ? (
                                    <p className="text-[#a1a1aa] leading-relaxed">{section.content}</p>
                                ) : (
                                    <p className="text-[#a1a1aa] leading-relaxed">
                                        If you have any questions about these Terms, please contact us at{' '}
                                        <a href="mailto:rohitmandan09@gmail.com" className="text-amber-400 hover:text-amber-300 transition-colors">
                                            rohitmandan09@gmail.com
                                        </a>.
                                    </p>
                                )}
                            </motion.section>
                        ))}
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default TermsOfServicePage;
