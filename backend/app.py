import modal

app = modal.App("backend")
image = modal.Image.debian_slim().pip_install("flask", "flask-cors")
image = image.pip_install("amadeus")

@app.function(image=image, secrets=[modal.Secret.from_name("secret-keys")])
@modal.wsgi_app()
def flask_app():
    import os
    from flask import Flask, request, jsonify
    from amadeus import Client, ResponseError
    from flask_cors import CORS
    

    amadeus = Client(
        client_id=os.environ["AMADEUS_CLIENT_ID"],
        client_secret=os.environ["AMADEUS_CLIENT_SECRET"]
    )

    web_app = Flask(__name__)
    CORS(web_app)

    @web_app.get("/")
    def home():
        return "Hello Flask World!"

    @web_app.post("/echo")
    def echo():
        return request.json
    
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

    return web_app