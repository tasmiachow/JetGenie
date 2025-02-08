import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuizPage from "./src/pages/QuizPage.jsx";

function App() {
    return (
        <div className="App">
            <h1>Vacation Planner</h1>
            <Router>
                <Routes>
                    <Route path="/" element={<QuizPage />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
