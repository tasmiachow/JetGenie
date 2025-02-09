import modal

app = modal.App("backend")
image = modal.Image.debian_slim().pip_install("flask", "flask-cors")
image = image.pip_install("amadeus")
image = image.pip_install("groq")

@app.function(image=image, secrets=[modal.Secret.from_name("secret-keys")])
@modal.wsgi_app()
def flask_app():
    import os
    # import requests
    from flask import Flask, request, jsonify
    from amadeus import Client, ResponseError
    from flask_cors import CORS
    import groq
    import json
    import time
    

    amadeus = Client(
        client_id=os.environ["AMADEUS_CLIENT_ID"],
        client_secret=os.environ["AMADEUS_CLIENT_SECRET"]
    )

    web_app = Flask(__name__)
    client = groq.Client(api_key=os.getenv("GROQ_API_KEY"))
    CORS(web_app)
    
    refresh_limits = {}
    MAX_REFRESHES = 2 

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

    @web_app.get("/")
    def home():
        return "Hello Flask World!"

    @web_app.post("/echo")
    def echo():
        return request.json
    
    
    @web_app.get("/api/cities")
    def cities():
        city = request.args.get("city")
        if not city:
            return jsonify({"error": "City name is required"}), 400
        
        try:
            city_data = amadeus.reference_data.locations.get(keyword=city, subType="CITY")
            return city_data.data
        except ResponseError as error:
            print(error)
            return jsonify({'error': 'Error finding city IATA', 'details': str(error)}), 500
    
    @web_app.get("/api/hotels/search")
    def search_hotels():
        params = {
            'cityCode': request.args.get('cityCode'),
            'radius': request.args.get('radius', default=5, type=int),
            'radiusUnit': request.args.get('radiusUnit', default='MILE'),
            'hotelSource': request.args.get('hotelSource', default='ALL'),
        }
    
        # Optional parameters
        # chain_codes = request.args.getlist('chainCodes')
        # amenities = request.args.getlist('amenities')
        ratings = request.args.get('ratings')
        
        # Validate parameters
        if not params["cityCode"]:
            return jsonify({'error': 'City code is required'}), 400
        
        if params["radiusUnit"] not in ['KM', 'MILE']:
            return jsonify({'error': 'Invalid radius unit'}), 400
        
        if params["hotelSource"] not in ['ALL', 'DIRECTCHAIN', 'BEDBANK']:
            return jsonify({'error': 'Invalid hotel source'}), 400
        
        if ratings:
            rating_list = ratings.split(',')
            if len(rating_list) > 4:
                return jsonify({'error': 'Too many ratings'}), 400
            
            for rating in rating_list:
                try:
                    rating_int = int(rating)
                    if rating_int < 1 or rating_int > 5:
                        return jsonify({'error': 'Invalid rating'}), 400
                except ValueError:
                    return jsonify({'error': 'Invalid rating'}), 400
            params['ratings'] = ratings
            
        try:
            response = amadeus.reference_data.locations.hotels.by_city.get(**params)
            return response.data
        except ResponseError as error:
            print(error)
            return jsonify({'error': 'Error finding hotels', 'details': str(error)}), 500

    
    @web_app.post("/generate-itinerary")
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
    return web_app