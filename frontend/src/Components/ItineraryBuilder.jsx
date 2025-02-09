import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/ItineraryBuilder.module.css"; // Import CSS Module

const ItineraryBuilder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const itinerary = location.state?.itinerary || {};

    if (!Object.keys(itinerary).length) {
        return (
            <div className={styles.container}>
                <h2>🚨 No itinerary available!</h2>
                <button onClick={() => navigate("/quiz")} className={styles.backButton}>Go Back</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Your Personalized Travel Itinerary ✈️</h1>
            <div className={styles.cards}>
                {Object.entries(itinerary).map(([day, activities], index) => (
                    <div key={index} className={styles.card}>
                        <h2 className={styles.cardTitle}>{day}</h2>
                        <div className={styles.activity}>
                            <h3 className={styles.activityTitle}>🌅 Morning</h3>
                            <p className={styles.activityText}>{activities.Morning?.Activity || "No activity planned."}</p>
                        </div>
                        <div className={styles.activity}>
                            <h3 className={styles.activityTitle}>🌞 Afternoon</h3>
                            <p className={styles.activityText}>{activities.Afternoon?.Activity || "No activity planned."}</p>
                        </div>
                        <div className={styles.activity}>
                            <h3 className={styles.activityTitle}>🌙 Night</h3>
                            <p className={styles.activityText}>{activities.Night?.Activity || "No activity planned."}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button className={styles.backButton} onClick={() => navigate("/quiz")}>
                🔙 Back to Quiz
            </button>
        </div>
    );
};

export default ItineraryBuilder;
