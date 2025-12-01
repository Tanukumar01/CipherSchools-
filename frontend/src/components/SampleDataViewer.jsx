import React from 'react';
import './SampleDataViewer.scss';

/**
 * Sample Data Viewer Component
 * Shows the schema structure and sample data for tables in the assignment
 */
const SampleDataViewer = ({ schemas }) => {
    if (!schemas || schemas.length === 0) {
        return null;
    }

    return (
        <div className="sample-data-viewer">
            <h3>Table Schemas</h3>

            {schemas.map((schema, index) => (
                <div key={index} className="sample-data-viewer__table">
                    <h4>{schema.table}</h4>

                    <div className="sample-data-viewer__columns">
                        <strong>Columns:</strong>
                        <div className="column-list">
                            {schema.columns.map((column, colIndex) => (
                                <span key={colIndex} className="column-badge">
                                    {column}
                                </span>
                            ))}
                        </div>
                    </div>

                    {schema.sampleRows && schema.sampleRows.length > 0 && (
                        <div className="sample-data-viewer__sample">
                            <strong>Sample Rows:</strong>
                            <table>
                                <thead>
                                    <tr>
                                        {schema.columns.map((col, colIndex) => (
                                            <th key={colIndex}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {schema.sampleRows.slice(0, 5).map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex}>{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SampleDataViewer;
