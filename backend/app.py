import os
import json
import groq  # Using Groq's API
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")

if not API_KEY:
    raise ValueError("GROQ_API_KEY is missing from .env file")

# Configure Groq client
client = groq.Client(api_key=API_KEY)

app = Flask(__name__)
CORS(app)
# Dictionary to track refresh limits per user
refresh_limits = {}
MAX_REFRESHES = 2  # Only 2 refreshes per time slot

def generate_itinerary(user_data):
    """Generates a structured travel itinerary using Groq based on user inputs."""
    
    city = user_data.get("city", "Tokyo")
    dates = user_data.get("dates", "March 15 - March 20")
    group_type = user_data.get("group_type", "Solo Trip")
    budget = user_data.get("budget", "Mid-range")
    preferences = user_data.get("preferences", ["Food", "Culture", "Adventure"])

    # Prompt that FORCES Groq to return JSON
    prompt = f"""
    Create a detailed {group_type.lower()} travel itinerary for {city} from {dates}.
    The traveler has a {budget.lower()} budget and is interested in: {', '.join(preferences)}.

    **IMPORTANT**: Your response MUST be in **valid JSON format**.
    The itinerary should be structured with **morning, afternoon, and night activities** for each day.

    Return JSON ONLY, with NO explanations. Use this format:
    {{
        "Day 1": {{
            "Morning": {{"Activity": "Example Morning Activity"}},
            "Afternoon": {{"Activity": "Example Afternoon Activity"}},
            "Night": {{"Activity": "Example Night Activity"}}
        }},
        "Day 2": {{...}}
    }}
    """

    try:
        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}]
        )

        itinerary_text = response.choices[0].message.content.strip()


        # Ensure valid JSON
        try:
            itinerary_json = json.loads(itinerary_text)
        except json.JSONDecodeError:
            itinerary_json = {"error": "Invalid response format from Groq. Try again!"}

    except Exception as e:
        itinerary_json = {"error": "Failed to generate itinerary"}

    return itinerary_json

@app.route("/")
def home():
    return "Flask backend is running!"

@app.route("/generate-itinerary", methods=["POST"])
def get_itinerary():
    """Receives quiz answers from React and returns a travel itinerary."""
    user_data = request.json  # Receive JSON data from frontend
    
    # Debugging log to check received data
    print("Received user data:", user_data)

    itinerary = generate_itinerary(user_data)
    return jsonify({"itinerary": itinerary})

@app.route("/refresh-activity", methods=["POST"])
def refresh_activity():
    """Refreshes an activity for a specific day and time of day."""
    data = request.json
    user_id = data.get("user_id", "default_user")
    day = data.get("day", "Day 1")
    time_of_day = data.get("time_of_day", "morning")
    city = data.get("city", "Tokyo")
    budget = data.get("budget", "Mid-range")
    preferences = data.get("preferences", ["Food", "Culture", "Adventure"])

    # Ensure user_id exists in refresh tracking
    if user_id not in refresh_limits:
        refresh_limits[user_id] = {}

    if day not in refresh_limits[user_id]:
        refresh_limits[user_id][day] = {"morning": 0, "afternoon": 0, "night": 0}

    # Check refresh limit
    if refresh_limits[user_id][day][time_of_day] >= MAX_REFRESHES:
        return jsonify({"error": "Refresh limit reached"}), 403

    # Generate new activity
    prompt = f"""
    Suggest a new {time_of_day.lower()} activity for {day} in {city}.
    The traveler has a {budget.lower()} budget and enjoys {', '.join(preferences)}.
    Provide a **specific location** and a short description.
    Format the response as: {{"Activity": "New activity suggestion"}}
    """

    try:
        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}]
        )

        new_activity = response.choices[0].message.content.strip()
        print("💡 Raw Refresh Response from Groq:", new_activity)  # Debugging

        # Ensure valid JSON response
        try:
            new_activity_json = json.loads(new_activity)
        except json.JSONDecodeError:
            print("❌ ERROR: Refresh response was not valid JSON!")
            new_activity_json = {"Activity": "Error generating new activity, please try again!"}

    except Exception as e:
        print("\n🔥 Error from Groq:", e)
        return jsonify({"error": "Failed to refresh activity"}), 500

    # Increment refresh count
    refresh_limits[user_id][day][time_of_day] += 1

    return jsonify({
        time_of_day: new_activity_json["Activity"],
        "remaining_refreshes": MAX_REFRESHES - refresh_limits[user_id][day][time_of_day]
    })

if __name__ == "__main__":
    app.run(debug=True)
