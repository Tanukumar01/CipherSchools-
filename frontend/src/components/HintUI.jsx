import React, { useState } from 'react';
import './HintUI.scss';

/**
 * Hint UI Component
 * Allows users to request and view AI-generated hints
 */
const HintUI = ({ onRequestHint, loading }) => {
    const [hintLevel, setHintLevel] = useState('low');
    const [hintData, setHintData] = useState(null);
    const [showHint, setShowHint] = useState(false);

    const handleRequestHint = async () => {
        setShowHint(false);
        const result = await onRequestHint(hintLevel);
        if (result) {
            setHintData(result);
            setShowHint(true);
        }
    };

    return (
        <div className="hint-ui">
            <div className="hint-ui__controls">
                <h3>Need Help?</h3>

                <div className="hint-ui__level-selector">
                    <label>Hint Level:</label>
                    <div className="radio-group">
                        {['low', 'medium', 'high'].map(level => (
                            <label key={level} className="radio-option">
                                <input
                                    type="radio"
                                    value={level}
                                    checked={hintLevel === level}
                                    onChange={(e) => setHintLevel(e.target.value)}
                                />
                                <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    className="hint-ui__button"
                    onClick={handleRequestHint}
                    disabled={loading}
                >
                    {loading ? 'Generating Hint...' : 'Get Hint'}
                </button>
            </div>

            {showHint && hintData && (
                <div className="hint-ui__content">
                    <div className="hint-ui__section">
                        <h4>💡 Hint</h4>
                        <p>{hintData.hint}</p>
                    </div>

                    {hintData.nextSteps && hintData.nextSteps.length > 0 && (
                        <div className="hint-ui__section">
                            <h4>📝 Next Steps</h4>
                            <ol>
                                {hintData.nextSteps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {hintData.explainWhy && (
                        <div className="hint-ui__section">
                            <h4>🤔 Why?</h4>
                            <p>{hintData.explainWhy}</p>
                        </div>
                    )}
                </div>
            )}

            {hintData && hintData.error && (
                <div className="hint-ui__error">
                    {hintData.error}
                </div>
            )}
        </div>
    );
};

export default HintUI;
