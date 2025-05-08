# config.py
import google.generativeai as genai

# Add your Gemini API Key here
API_KEY = "AIzaSyBS47bIMXB9s8foH1uZK4AvIcxIqU3jFhM"

# Configure Gemini API
genai.configure(api_key=API_KEY)

# Model to use
MODEL_NAME = "gemini-1.5-pro-latest"
