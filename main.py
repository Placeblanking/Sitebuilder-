from flask import Flask, request, jsonify, send_from_directory, redirect, url_for
from flask_cors import CORS
import google.generativeai as genai
import json
import os
import config
from pathlib import Path
import tempfile
import speech_recognition as sr
from pydub import AudioSegment
import requests

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure paths
BASE_DIR = Path(__file__).resolve().parent.parent  
FRONTEND_DIR = BASE_DIR / 'frontend'
FRONTEND_DIR.mkdir(parents=True, exist_ok=True)  # Ensure frontend directory exists
STRAPI_BASE_URL = "http://localhost:1337/api"  # Update if hosted elsewhere

# Initialize model
model = config.MODEL_NAME
chat_model = genai.GenerativeModel(model)

# File to store conversation history
HISTORY_FILE = "conversation_history.json"

# Load conversation history
def load_conversation_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r") as file:
                return json.load(file)
        except json.JSONDecodeError:
            return []
    return []

# Save conversation history
def save_conversation_history(history):
    with open(HISTORY_FILE, "w") as file:
        json.dump(history, file, indent=4)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '').strip()
    
    if not user_message:
        return jsonify({'error': 'Empty message'}), 400
    
    conversation_history = load_conversation_history()
    conversation_history.append({"role": "user", "parts": [{"text": user_message}]})

    try:
        response = chat_model.generate_content(conversation_history)
        bot_response = response.text.strip() if response.text else "I'm not sure how to respond."
        conversation_history.append({"role": "assistant", "parts": [{"text": bot_response}]})
        save_conversation_history(conversation_history)
        return jsonify({'response': bot_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice-to-text', methods=['POST'])
def voice_to_text():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    try:
        # Save audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_path = temp_file.name
            audio_file.save(temp_path)

        print(f"Temp file path: {temp_path}")
        print(f"File exists: {os.path.exists(temp_path)}")
        
        # Ensure the file exists
        if not os.path.exists(temp_path):
            return jsonify({'error': 'Temporary audio file not found'}), 500

        # Check if ffmpeg is installed
        if not AudioSegment.converter:
            return jsonify({'error': 'ffmpeg not found. Install it and add to PATH.'}), 500

        # Convert to WAV if necessary
        try:
            with sr.AudioFile(temp_path) as source:
                pass  # If it doesn't throw an error, the file is a valid WAV
        except Exception:
            converted_path = temp_path.replace(".wav", "_converted.wav")
            audio = AudioSegment.from_file(temp_path)
            audio.export(converted_path, format="wav")
            os.remove(temp_path)  # Remove original invalid file
            temp_path = converted_path  # Update path to converted file

        # Process Speech Recognition
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_path) as source:
            recognizer.adjust_for_ambient_noise(source)
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
        
        os.remove(temp_path)  # Cleanup temporary file
        return jsonify({'text': text, 'status': 'success'})

    except sr.UnknownValueError:
        return jsonify({'error': 'Could not understand audio', 'status': 'error'}), 400
    except sr.RequestError as e:
        return jsonify({'error': f'Speech recognition service error: {str(e)}', 'status': 'error'}), 500
    except Exception as e:
        import traceback
        print(f"Voice processing error: {traceback.format_exc()}")
        return jsonify({'error': f'Error processing audio: {str(e)}', 'status': 'error'}), 500

@app.route('/')
def home():
    return redirect(url_for('serve_register'))

@app.route('/register')
def serve_register():
    return send_from_directory(str(FRONTEND_DIR), 'register.html')

@app.route('/chatbot')
def serve_chatbot():
    return send_from_directory(str(FRONTEND_DIR), 'index.html')


@app.route('/api/faqs', methods=['GET'])
def get_faqs():
    try:
        response = requests.get(f"{STRAPI_BASE_URL}/faqs")
        response.raise_for_status()
        data = response.json()
        return jsonify({'faqs': data.get('data', [])})
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to fetch FAQs from CMS', 'details': str(e)}), 500

@app.route('/api/blogs', methods=['GET'])
def get_blogs():
    try:
        response = requests.get(f"{STRAPI_BASE_URL}/blogs")
        response.raise_for_status()
        data = response.json()
        return jsonify({'blogs': data.get('data', [])})
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to fetch blogs from CMS', 'details': str(e)}), 500


@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(str(FRONTEND_DIR), filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)