import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();  // Load environment variables

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;
let accessToken = null;
let tokenExpiry = 0;

const getAccessToken = async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    if (accessToken && currentTime < tokenExpiry) {
        return accessToken;
    }

    try {
        const response = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: AMADEUS_API_KEY,
                client_secret: AMADEUS_API_SECRET
            })
        });

        const data = await response.json();
        accessToken = data.access_token;
        tokenExpiry = currentTime + data.expires_in;
        return accessToken;
    } catch (error) {
        console.error("Error getting access token:", error);
        return null;
    }
};

const getCityCode = async (city) => {
    const token = await getAccessToken();
    if (!token) return null;

    try {
        const response = await fetch(
            `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=${encodeURIComponent(city)}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data.map((place) => ({
                name: place.name,
                iataCode: place.iataCode,
                country: place.countryCode
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching city code:", error);
        return [];
    }
};

// Export for ES modules
export { getCityCode };
