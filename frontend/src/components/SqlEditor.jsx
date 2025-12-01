import React from 'react';
import Editor from '@monaco-editor/react';
import './SqlEditor.scss';

/**
 * Monaco SQL Editor Component
 * Provides syntax highlighting and autocomplete for SQL
 */
const SqlEditor = ({ value, onChange, height = '400px', readOnly = false }) => {
    const editorOptions = {
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        readOnly: readOnly,
        automaticLayout: true,
        theme: 'vs-dark',
        padding: { top: 16, bottom: 16 },
    };

    return (
        <div className="sql-editor">
            <Editor
                height={height}
                defaultLanguage="sql"
                value={value}
                onChange={onChange}
                theme="vs-dark"
                options={editorOptions}
                loading={<div className="sql-editor__loading">Loading editor...</div>}
            />
        </div>
    );
};

export default SqlEditor;
