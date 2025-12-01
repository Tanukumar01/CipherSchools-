import React from 'react';
import './QuestionPanel.scss';

/**
 * Question Panel Component
 * Displays the assignment question and description
 */
const QuestionPanel = ({ assignment }) => {
    if (!assignment) {
        return (
            <div className="question-panel">
                <div className="question-panel__loading">Loading assignment...</div>
            </div>
        );
    }

    return (
        <div className="question-panel">
            <div className="question-panel__header">
                <h2>{assignment.title}</h2>
                <span className={`difficulty difficulty--${assignment.difficulty.toLowerCase()}`}>
                    {assignment.difficulty}
                </span>
            </div>

            <div className="question-panel__content">
                <h3>Question</h3>
                <p>{assignment.question}</p>
            </div>
        </div>
    );
};

export default QuestionPanel;
