import React from "react";
import "../styles/quiz.css";

const MultiSelectQuestion = ({ question, onSelect, selectedOptions }) => {
    const toggleOption = (option) => {
        let updatedSelection;
        if (selectedOptions.includes(option)) {
            updatedSelection = selectedOptions.filter(item => item !== option);
        } else {
            updatedSelection = [...selectedOptions, option];
        }
        onSelect(updatedSelection);
    };

    return (
        <div>
            <h3 className="subtext">{question.text}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                {question.options.map((option) => (
                    <button
                        key={option}
                        className="answer-bubble"
                        onClick={() => toggleOption(option)}
                        style={{
                            background: selectedOptions.includes(option) ? "#5C95FF" : "white",
                            color: selectedOptions.includes(option) ? "white" : "black"
                        }}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MultiSelectQuestion;
