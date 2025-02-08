import modal

app = modal.App("backend")
image = modal.Image.debian_slim().pip_install("flask")

@app.function(image=image)
@modal.wsgi_app()
def flask_app():
    from flask import Flask, request

    web_app = Flask(__name__)

    @web_app.get("/")
    def home():
        return "Hello Flask World!"

    @web_app.post("/echo")
    def echo():
        return request.json

    return web_app