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
    city = user_data.get("1", "New York City")
    date_range = user_data.get("2", {})
    start_date = date_range.get("startDate", "2025-02-15")
    end_date = date_range.get("endDate", "2025-02-17")
    group_type = user_data.get("3", "Solo Trip")
    budget = user_data.get("4", "10000")
    preferences = user_data.get("5", ["Sports Games", "Nightlife", "Must-see Attractions"])

    # Build a better structured prompt
    prompt = f"""
    You are a travel assistant. Create a **detailed** {group_type.lower()} travel itinerary for {city} from {start_date} to {end_date}.
    The traveler has a budget of {budget} per person and is interested in: {', '.join(preferences)}.

    **Response Requirements:**
    - **ONLY** return JSON. Do **not** add explanations, comments, or any extra text.
    - Ensure the JSON **is fully complete** and properly formatted.

    **JSON Structure:**
    {{
        "Day 1": {{
            "Morning": {{"Activity": "Example Morning Activity", "Location": "Location Name", "Transportation": "Transport Info", "Food Recommendation": "Restaurant Name"}},
            "Afternoon": {{"Activity": "Example Afternoon Activity"}},
            "Night": {{"Activity": "Example Night Activity"}}
        }},
        "Day 2": {{ ... }}
    }}

    **Important Notes:**
    - The response **must be valid JSON** with **all necessary closing brackets**.
    - **If you do not follow these instructions, the response will be invalid.**
    """

    print("\n📜 Prompt Sent to Groq:")
    print(prompt)

    try:
        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}]
        )

        itinerary_text = response.choices[0].message.content.strip()

        # Debugging: Print raw response from Groq
        print("\n💡 Raw Itinerary Response from Groq:")
        print(itinerary_text)

        # Validate JSON
        itinerary_json = json.loads(itinerary_text)
        return itinerary_json

    except json.JSONDecodeError:
        print("\n❌ ERROR: Groq returned an invalid JSON format.")
        return {"error": "Groq returned an invalid response. Please try again."}

    except Exception as e:
        print("\n🔥 Error from Groq:", e)
        return {"error": f"Failed to generate itinerary. Error: {str(e)}"}


@app.route("/")
def home():
    return "Flask backend is running!"

@app.route("/generate-itinerary", methods=["POST"])
def get_itinerary():
    """Receives quiz answers from React and returns a travel itinerary."""
    user_data = request.json  # Receive JSON data from frontend

    # Debugging log: Check received data
    print("\n📩 Received user data from React:")
    print(json.dumps(user_data, indent=4))

    # Generate itinerary using user data
    itinerary = generate_itinerary(user_data)
    
    # Debugging log: Check generated itinerary
    print("\n🗺️ Generated Itinerary:")
    print(json.dumps(itinerary, indent=4))

    return jsonify({"itinerary": itinerary})
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
