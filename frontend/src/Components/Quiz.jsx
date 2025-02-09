import React, { useState } from "react";
import Question from "./Question";
import ProgressBar from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import "../styles/quiz.css";

const questions = [
    { id: 1, text: "Where are you traveling to?", type: "searchable" }, // Searchable location input
    {
        id: 2,
        text: "When are you going?",
        type: "date-range",
        description: "Choose a date range, up to 7 days."
    },
    {
        id: 3,
        text: "Who’s going on this trip?",
        type: "single-select",
        options: ["Solo Trip", "Partner Trip", "Friends Trip", "Family Trip"]
    },
    { id: 4, text: "What’s your budget? (per person)", type: "usd-number" },
    {
        id: 5,
        text: "What are your travel preferences?",
        type: "multi-select",
        options: [
            "Must-see Attractions", "Hiking", "Beach", "Great Food", "Hidden Gems", "Walk through iconic architecture", "Art Museums",
            "Architectural Landmarks", "Live Music", "Sports Games", "Nightlife", "Historic Sites"
        ]
    }
];

const Quiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    const handleAnswer = (answer) => {
        const questionId = questions[currentQuestion].id;
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = async () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            console.log("✅ Final Answers Before Sending:", answers); // Log quiz data for debugging
    
            try {
                const response = await fetch("http://127.0.0.1:5000/generate-itinerary", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(answers),
                });
    
                if (!response.ok) {
                    throw new Error("Failed to send data to the backend");
                }
    
                const itineraryData = await response.json();
                console.log("✅ Received Itinerary from Flask:", itineraryData); // Log backend response
    
                navigate("/itinerary-builder", { state: { itinerary: itineraryData.itinerary } });
            } catch (error) {
                console.error("❌ Error sending data to backend:", error);
            }
        }
    };    
    const handleBack = () => {
        if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
    };

    return (
        <div className="quiz-container">
            <ProgressBar step={currentQuestion + 1} totalSteps={questions.length} />
            <Question
                data={questions[currentQuestion]}
                answer={answers[questions[currentQuestion].id]}
                onAnswer={handleAnswer}
            />
            <div className="quiz-buttons">
                <button className={`back-btn ${currentQuestion === 0 ? "hidden" : ""}`} onClick={handleBack}>
                    Back
                </button>
                <button className="next-btn" onClick={handleNext}>Next</button>
            </div>
        </div>
    );
};

export default Quiz;
