import React from 'react';
import './ResultsPanel.scss';

/**
 * Results Panel Component
 * Displays query execution results in a table format
 * Also displays errors if the query failed
 */
const ResultsPanel = ({ results, loading, error }) => {
    if (loading) {
        return (
            <div className="results-panel">
                <div className="results-panel__loading">
                    <div className="spinner"></div>
                    <p>Executing query...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="results-panel">
                <div className="results-panel__error">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                        <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                    </svg>
                    <h3>Query Error</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!results || results.rows.length === 0) {
        return (
            <div className="results-panel">
                <div className="results-panel__empty">
                    <p>No results yet. Write a query and click "Run" to see results.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="results-panel">
            <div className="results-panel__header">
                <h3>Results</h3>
                <span className="results-panel__count">
                    {results.rowCount} {results.rowCount === 1 ? 'row' : 'rows'}
                </span>
            </div>

            <div className="results-panel__table-container">
                <table className="results-panel__table">
                    <thead>
                        <tr>
                            {results.fields.map((field, index) => (
                                <th key={index}>{field.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {results.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {results.fields.map((field, colIndex) => (
                                    <td key={colIndex}>
                                        {row[field.name] !== null && row[field.name] !== undefined
                                            ? String(row[field.name])
                                            : <span className="null-value">NULL</span>
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsPanel;
