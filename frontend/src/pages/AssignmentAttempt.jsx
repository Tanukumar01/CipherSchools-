import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QuestionPanel from '../components/QuestionPanel';
import SampleDataViewer from '../components/SampleDataViewer';
import SqlEditor from '../components/SqlEditor';
import ResultsPanel from '../components/ResultsPanel';
import HintUI from '../components/HintUI';
import './AssignmentAttempt.scss';

/**
 * Assignment Attempt Page
 * Main workspace for attempting SQL assignments
 */
const AssignmentAttempt = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [sql, setSql] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [hintLoading, setHintLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch assignment details
    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const response = await axios.get(`/api/assignments/${id}`);
                setAssignment(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch assignment:', err);
                setError('Failed to load assignment details');
                setLoading(false);
            }
        };

        fetchAssignment();
    }, [id]);

    // Execute SQL query
    const handleExecuteQuery = async () => {
        if (!sql.trim()) {
            setError('Please write a SQL query first');
            return;
        }

        setExecuting(true);
        setError(null);

        try {
            const response = await axios.post(`/api/assignments/${id}/execute`, { sql });

            if (response.data.success) {
                setResults(response.data);
                setError(null);
            } else {
                setError(response.data.error);
                setResults(null);
            }
        } catch (err) {
            console.error('Query execution failed:', err);
            setError(err.response?.data?.error || 'Failed to execute query');
            setResults(null);
        } finally {
            setExecuting(false);
        }
    };

    // Request hint from LLM
    const handleRequestHint = async (hintLevel) => {
        setHintLoading(true);

        try {
            const response = await axios.post(`/api/assignments/${id}/hint`, {
                sql: sql || null,
                hintLevel
            });

            return response.data;
        } catch (err) {
            console.error('Hint request failed:', err);
            return { error: 'Failed to generate hint. Please try again.' };
        } finally {
            setHintLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="assignment-attempt">
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Loading assignment...</p>
                </div>
            </div>
        );
    }

    if (error && !assignment) {
        return (
            <div className="assignment-attempt">
                <div className="error-screen">
                    <p>{error}</p>
                    <button onClick={() => navigate('/')}>Back to Assignments</button>
                </div>
            </div>
        );
    }

    return (
        <div className="assignment-attempt">
            {/* Header with back button */}
            <header className="assignment-attempt__header">
                <button
                    className="back-button"
                    onClick={() => navigate('/')}
                >
                    ← Back
                </button>
                <h2>{assignment?.title}</h2>
            </header>

            {/* Main layout: 2-column on desktop, stacked on mobile */}
            <div className="assignment-attempt__layout">

                {/* Left sidebar: Question + Schema + Hints */}
                <aside className="assignment-attempt__sidebar">
                    <QuestionPanel assignment={assignment} />
                    <SampleDataViewer schemas={assignment?.sampleSchemas} />
                    <HintUI onRequestHint={handleRequestHint} loading={hintLoading} />
                </aside>

                {/* Right main area: Editor + Results */}
                <main className="assignment-attempt__workspace">

                    {/* SQL Editor */}
                    <section className="assignment-attempt__editor-section">
                        <div className="section-header">
                            <h3>SQL Query</h3>
                            <button
                                className="run-button"
                                onClick={handleExecuteQuery}
                                disabled={executing}
                            >
                                {executing ? 'Running...' : '▶ Run Query'}
                            </button>
                        </div>
                        <SqlEditor
                            value={sql}
                            onChange={(value) => setSql(value || '')}
                            height="300px"
                        />
                    </section>

                    {/* Results Panel */}
                    <section className="assignment-attempt__results-section">
                        <ResultsPanel
                            results={results}
                            loading={executing}
                            error={error}
                        />
                    </section>

                </main>
            </div>
        </div>
    );
};

export default AssignmentAttempt;
