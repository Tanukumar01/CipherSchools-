import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AssignmentList from './pages/AssignmentList';
import AssignmentAttempt from './pages/AssignmentAttempt';
import './styles/main.scss';

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <header className="app-header">
                    <h1 className="app-header__title">CipherSQLStudio</h1>
                </header>

                <main className="app-main">
                    <Routes>
                        <Route path="/" element={<AssignmentList />} />
                        <Route path="/assignment/:id" element={<AssignmentAttempt />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
