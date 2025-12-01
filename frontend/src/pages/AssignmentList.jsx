import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AssignmentList.scss';

/**
 * Assignment List Page
 * Displays all available SQL assignments
 */
const AssignmentList = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await axios.get('/api/assignments');
                setAssignments(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch assignments:', err);
                setError('Failed to load assignments. Please try again later.');
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    const handleAssignmentClick = (assignmentId) => {
        navigate(`/assignment/${assignmentId}`);
    };

    if (loading) {
        return (
            <div className="assignment-list">
                <h1>SQL Assignments</h1>
                <div className="assignment-list__loading">
                    <div className="spinner"></div>
                    <p>Loading assignments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="assignment-list">
                <h1>SQL Assignments</h1>
                <div className="assignment-list__error">{error}</div>
            </div>
        );
    }

    return (
        <div className="assignment-list">
            <header className="assignment-list__header">
                <h1>SQL Assignments</h1>
                <p>Choose an assignment to practice your SQL skills</p>
            </header>

            <div className="assignment-list__grid">
                {assignments.map(assignment => (
                    <div
                        key={assignment.id}
                        className="assignment-card"
                        onClick={() => handleAssignmentClick(assignment.id)}
                    >
                        <div className="assignment-card__header">
                            <h3>{assignment.title}</h3>
                            <span className={`difficulty difficulty--${assignment.difficulty.toLowerCase()}`}>
                                {assignment.difficulty}
                            </span>
                        </div>
                        <p className="assignment-card__description">
                            {assignment.shortDescription}
                        </p>
                        <div className="assignment-card__footer">
                            <span className="assignment-card__cta">Start Assignment →</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssignmentList;
