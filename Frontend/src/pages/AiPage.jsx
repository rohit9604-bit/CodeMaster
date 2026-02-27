import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import DevoraPanel from '@/components/DevoraPanel';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AiPage = () => {
    const { challengeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [code] = useState(location.state?.code || '');

    return (
        <>
            <Helmet>
                <title>Devora AI Helper - CodeMaster</title>
            </Helmet>
            <Layout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[85vh] flex flex-col">
                    <div className="mb-4">
                        <Button
                            onClick={() => navigate(`/editor/${challengeId}`)}
                            variant="outline"
                            className="text-[#d4d4d4] border-[#3e3e42] hover:bg-[#3e3e42] hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Editor
                        </Button>
                    </div>
                    <div className="flex-1 border border-[#3e3e42] rounded-lg overflow-hidden flex flex-col bg-[#1e1e1e]">
                        <DevoraPanel challengeId={challengeId} code={code} />
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default AiPage;
