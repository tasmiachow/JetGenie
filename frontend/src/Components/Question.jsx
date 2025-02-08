import React, { useState, useEffect } from "react";
import Select from "react-select";
import MultiSelectQuestion from "./MultiSelectQuestion";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// need to add images of the destinations
const popularDestinations = [
    { name: "New York City", country: "United States", image: "" },
    { name: "Paris", country: "France", image: "" },
    { name: "Tokyo", country: "Japan", image: "" },
    { name: "Barcelona", country: "Spain", image: "" },
    { name: "Dubai", country: "UAE", image: "" },
    { name: "Sydney", country: "Australia", image: "" }
];

const Question = ({ data, answer, onAnswer }) => {
    const [input, setInput] = useState(answer || "");
    const [options, setOptions] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [dateRange, setDateRange] = useState([
        {
            startDate: answer?.startDate || new Date(),
            endDate: answer?.endDate || new Date(),
            key: "selection",
        },
    ]);
    const [noDates, setNoDates] = useState(false);

    useEffect(() => {
        setInput(answer || "");
        if (answer && popularDestinations.some(dest => dest.name === answer)) {
            setSelectedDestination(answer);
        } else {
            setSelectedDestination(null);
        }
    }, [data, answer]);

    const fetchCities = async (searchText) => {
        if (searchText.length < 2) return;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&addressdetails=1&limit=5`
            );
            const data = await response.json();
            const cityOptions = data.map((place) => ({
                label: place.display_name,
                value: place.display_name,
            }));
            setOptions(cityOptions);
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    };

    const handleInputChange = (newValue) => {
        if (newValue) {
            setSelectedDestination(null);
            fetchCities(newValue);
        }
    };

    const handleDestinationSelect = (destination) => {
        if (!input) {
            setSelectedDestination(destination);
            onAnswer(destination);
        }
    };

    return (
        <div className="question-container">
            <h2>{data.text}</h2>
            {data.type === "multi-select" ? (
                <MultiSelectQuestion
                    question={data}
                    selectedOptions={answer || []}
                    onSelect={onAnswer}
                />
            ) : null}
            {data.type === "single-select" ? (
                <div className="single-select-container">
                    {data.options.map((option) => (
                        <button
                            key={option}
                            className={`answer-bubble ${input === option ? "selected" : ""}`}
                            onClick={() => {
                                setInput(option);
                                onAnswer(option);
                            }}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            ) : null}
            {data.type === "date-range" ? (
                <div className="date-picker-container">
                    <DateRange
                        editableDateInputs={true}
                        onChange={(ranges) => {
                            setDateRange([ranges.selection]);
                            onAnswer(ranges.selection);
                        }}
                        moveRangeOnFirstSelection={false}
                        ranges={dateRange}
                        minDate={new Date()}
                        maxDate={new Date(new Date().setDate(new Date().getDate() + 365))}
                        rangeColors={["#5C95FF"]}
                        showDateDisplay={false}
                    />
                    <p
                        className="no-dates-option"
                        onClick={() => {
                            setNoDates(!noDates);
                            onAnswer(noDates ? dateRange[0] : "I don’t know my dates yet");
                        }}
                    >
                        I don’t know my dates yet
                    </p>
                </div>
            ) : null}
            {data.type === "usd-number" ? (
                <div className="usd-input">
                    <span>$</span>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            onAnswer(e.target.value);
                        }}
                        placeholder="Enter budget in USD"
                    />
                </div>
            ) : null}

            {data.id === 1 ? (
                <div>
                    <Select
                        options={options}
                        onInputChange={handleInputChange}
                        onChange={(selectedOption) => {
                            setInput(selectedOption.value);
                            setSelectedDestination(null);
                            onAnswer(selectedOption.value);
                        }}
                        placeholder="Enter a city or country"
                        isSearchable
                        value={input ? { label: input, value: input } : null}
                    />

                    <div className="popular-destinations">
                        <h3>Or get started with a popular destination</h3>
                        <div className="destination-grid">
                            {popularDestinations.map((dest) => (
                                <div
                                    key={dest.name}
                                    className={`destination-card ${selectedDestination === dest.name ? "selected" : ""}`}
                                    onClick={() => handleDestinationSelect(dest.name)}
                                    role="button"
                                    tabIndex="0"
                                    style={{ cursor: input ? "not-allowed" : "pointer", opacity: input ? 0.5 : 1 }}
                                >
                                    <img src={dest.image} alt={dest.name} className="clickable-image" />
                                    <p><strong>{dest.name}</strong></p>
                                    <p>{dest.country}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Question;
