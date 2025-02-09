# Setting up modal

1. ```.venv/bin/python -m pip install modal```
2. ```.venv/bin/python -m modal setup```

# How to set up temp endpoints

```.venv/bin/python -m modal serve app.py```

# How to deploy onto modal

```.venv/bin/python -m modal deploy app.py```


# API

base: ```https://jet-genie--backend-flask-app.modal.run```

## Endpoints
1. ```/api/hotels/search``` 
    ## Query String
    ### Requirements
    1. cityCode: in IATA format
    ### Optional
    1. radius: int
    2. radiusUnit: KM or MILE
    3. rating: 1-5, max of 4
    ### Example
    ```https://jet-genie--backend-flask-app-dev.modal.run/api/hotels/search?cityCode=PAR&radius=5&radiusUnit=MILE&ratings=5```  
    
    returns an array of all locations
