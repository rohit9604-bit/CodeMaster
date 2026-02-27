import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';

const sections = [
    {
        title: '1. Information We Collect',
        content: 'We collect information you provide directly to us, such as when you create or modify your account, participate in coding challenges, or communicate with us. This may include your name, email address, and any other information you choose to provide.'
    },
    {
        title: '2. How We Use Your Information',
        content: 'We use the information we collect to operate and improve our platform, personalize your learning experience, and communicate with you about updates and new features.'
    },
    {
        title: '3. Data Security',
        content: 'We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. However, no internet or email transmission is ever fully secure or error-free.'
    },
    {
        title: '4. Third-Party Services',
        content: "Our platform may contain links to third-party web sites or services that are not owned or controlled by CodeMaster. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party web sites or services."
    },
    {
        title: '5. Contact Us',
        content: null
    },
];

const PrivacyPolicyPage = () => {
    return (
        <>
            <Helmet>
                <title>Privacy Policy - CodeMaster</title>
                <meta name="description" content="CodeMaster Privacy Policy." />
            </Helmet>
            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl font-bold mb-4">
                            <span className="text-[#f4f4f5]">Privacy </span>
                            <span className="text-gradient">Policy</span>
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
                                        If you have any questions about this Privacy Policy, please contact us at{' '}
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

export default PrivacyPolicyPage;
