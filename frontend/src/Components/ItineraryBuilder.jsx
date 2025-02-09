import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/ItineraryBuilder.module.css"; // Import CSS Module
import { loadGapiInsideDOM } from "gapi-script";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const ItineraryBuilder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const itinerary = location.state?.itinerary || {};

    useEffect(() => {
        loadGapiInsideDOM().then(() => {
            window.gapi.load("client:auth2", async () => {
                await window.gapi.client.init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
                    scope: SCOPES,
                });
            });
        });
    }, []);

    const authenticateAndAddEvent = async (event) => {
        if (!window.gapi || !window.gapi.auth2) {
            console.error("Google API client is not initialized.");
            alert("Google API client is not loaded. Please refresh the page.");
            return;
        }

        const authInstance = window.gapi.auth2.getAuthInstance();
        if (!authInstance.isSignedIn.get()) {
            try {
                await authInstance.signIn();
            } catch (error) {
                console.error("Google Sign-In failed:", error);
                alert("Failed to sign in to Google.");
                return;
            }
        }

        const eventDetails = {
            summary: event.name,
            description: event.description,
            start: {
                dateTime: event.startTime,
                timeZone: "America/New_York",
            },
            end: {
                dateTime: event.endTime,
                timeZone: "America/New_York",
            },
        };

        try {
            const response = await window.gapi.client.calendar.events.insert({
                calendarId: "primary",
                resource: eventDetails,
            });
            console.log("Event added successfully:", response);
            alert("Event added to Google Calendar!");
        } catch (error) {
            console.error("Error adding event:", error);
            alert("Failed to add event to Google Calendar. Please check your permissions.");
        }
    };

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
            <div className={styles.itineraryContainer}>
                <div className={styles.cards}>
                    {Object.entries(itinerary).map(([day, activities], index) => (
                        <div key={index} className={styles.card}>
                            <h2 className={styles.cardTitle}>{day}</h2>
                            {['Morning', 'Afternoon', 'Night'].map((timeOfDay) => (
                                <div key={timeOfDay} className={styles.activity}>
                                    <h3 className={styles.activityTitle}>{timeOfDay}</h3>
                                    <p className={styles.activityText}>{activities[timeOfDay]?.Activity || "No activity planned."}</p>
                                    {activities[timeOfDay]?.Activity && (
                                        <button
                                            className={styles.addButton}
                                            onClick={() => authenticateAndAddEvent({
                                                name: activities[timeOfDay]?.Activity,
                                                description: "Planned activity",
                                                startTime: "2025-02-10T09:00:00-05:00",
                                                endTime: "2025-02-10T10:00:00-05:00"
                                            })}
                                        >
                                            Add to Google Calendar
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className={styles.calendarContainer}>
                    <iframe
                        src="https://calendar.google.com/calendar/embed?src=YOUR_GOOGLE_CALENDAR_ID"
                        style={{ border: 0, width: "100%", height: "600px" }}
                        frameBorder="0"
                        scrolling="no"
                    ></iframe>
                </div>
            </div>
            <button className={styles.backButton} onClick={() => navigate("/quiz")}>🔙 Back to Quiz</button>
        </div>
    );
};

export default ItineraryBuilder;
