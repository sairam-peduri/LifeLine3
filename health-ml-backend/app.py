from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS
from scipy import stats
import pandas as pd
from groq import Groq
from dotenv import load_dotenv
import os
from pymongo import MongoClient
import re

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
MONGO_URI = os.getenv("MONGO_URI")

# Groq API Setup
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
if not GROQ_API_KEY:
    print("⚠️ GROQ_API_KEY is not set. AI routes will return an error until configured.")

# MongoDB Setup
client = MongoClient(MONGO_URI)
db = client["lifeline"]
users_collection = db["users"]

try:
    client.server_info()
    print("✅ Connected to MongoDB")
except Exception as e:
    print(f"❌ MongoDB connection failed: {str(e)}")


def generate_groq_response(system_prompt, user_prompt):
    if not groq_client:
        raise RuntimeError("GROQ_API_KEY is not configured")

    completion = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3
    )

    if not completion.choices or not completion.choices[0].message:
        return ""

    content = completion.choices[0].message.content
    return content.strip() if content else ""

# Load ML models and data
try:
    svm_model = pickle.load(open("svm_model.pkl", "rb"))
    nb_model = pickle.load(open("nb_model.pkl", "rb"))
    rf_model = pickle.load(open("rf_model.pkl", "rb"))
    encoder = pickle.load(open("encoder.pkl", "rb"))

    with open("symptoms.pkl", "rb") as f:
        valid_symptoms = pickle.load(f)
        valid_symptoms = [s.lower() for s in valid_symptoms]

    with open("disease_symptom_map.pkl", "rb") as f:
        disease_symptom_map = pickle.load(f)

    print("✅ Models and data loaded successfully!")

except Exception as e:
    print(f"❌ Failed to load models or data: {e}")
    valid_symptoms = []
    disease_symptom_map = {}

# Root check
@app.route('/', methods=['GET'])
def home():
    return "Lifeline API is up and running!"

# GET: List of symptoms
@app.route('/api/get_symptoms', methods=['GET'])
def get_symptoms():
    try:
        if not valid_symptoms:
            raise ValueError("Symptoms data not loaded.")
        return jsonify({"symptoms": valid_symptoms})
    except Exception as e:
        print("❌ Symptoms loading error:", e)
        return jsonify({"error": str(e)}), 500

# POST: Predict disease
@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        user_symptoms = [s.lower().replace(" ", "_") for s in data.get('symptoms', [])]
        user_email = data.get('email')
        user_uid = data.get('uid')  # fallback if email fails

        print("📥 Incoming prediction for email:", user_email)
        print("📥 Symptoms:", user_symptoms)

        filtered_symptoms = [s for s in user_symptoms if s in valid_symptoms]
        if not filtered_symptoms:
            return jsonify({"message": "No valid symptoms provided", "chatbot_suggested": True}), 400

        symptoms_dict = {symptom: int(symptom in filtered_symptoms) for symptom in valid_symptoms}
        symptoms_array = pd.DataFrame([symptoms_dict])

        svm_pred = svm_model.predict(symptoms_array)
        nb_pred = nb_model.predict(symptoms_array)
        rf_pred = rf_model.predict(symptoms_array)

        mode_result = stats.mode([svm_pred[0], nb_pred[0], rf_pred[0]], keepdims=True)
        final_pred = mode_result.mode[0]
        disease_name = encoder.inverse_transform([final_pred])[0]

        possible_diseases = [
            disease for disease, symptoms in disease_symptom_map.items()
            if all(sym in symptoms for sym in filtered_symptoms)
        ]
        final_disease = possible_diseases[0] if len(possible_diseases) == 1 else disease_name

        from datetime import datetime
        history_entry = {
            "disease": final_disease,
            "symptoms": filtered_symptoms,
            "timestamp": datetime.utcnow().isoformat()
        }

        result = None

        if user_email:
            result = users_collection.update_one(
                {"email": user_email},
                {
                    "$push": {
                        "predictionHistory": {
                            "$each": [history_entry],
                            "$slice": -10
                        }
                    }
                }
            )
            print(f"📌 Update with email result: matched={result.matched_count}, modified={result.modified_count}")

        if (not result or result.matched_count == 0) and user_uid:
            result = users_collection.update_one(
                {"uid": user_uid},
                {
                    "$push": {
                        "predictionHistory": {
                            "$each": [history_entry],
                            "$slice": -10
                        }
                    }
                }
            )
            print(f"📌 Update with UID result: matched={result.matched_count}, modified={result.modified_count}")

        return jsonify({"disease": final_disease})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/details', methods=['POST'])
def disease_details():
    try:
        data = request.get_json()
        disease = data.get('disease', '').strip()
        if not disease:
            return jsonify({"error": "No disease provided"}), 400

        prompt = (
        f"Explain the disease '{disease}' in simple terms. "
        "Structure the response using clear headings (like 'Symptoms:', 'Causes:', etc.) followed by numbered or hyphen-style bullet points (without using asterisks at any where). "
        "Use only clean formatting like:\n"
        "Symptoms:\n- ...\n- ...\nCauses:\n- ...\n"
        "Place every line on seperate line."
        "Do not use asterisks or markdown symbols like *, **, #, etc."
        )

        raw_text = generate_groq_response(
            "You are a helpful health assistant who provides clear, structured medical information for educational use.",
            prompt
        )
        print("🔍 Groq raw response:", raw_text)

        if not raw_text:
            return jsonify({"error": "AI returned no text"}), 500

        headings = ["Symptoms", "Causes", "Diagnosis", "Treatment", "Prevention"]
        structured = {}
        for heading in headings:
            pattern = re.compile(rf"{heading}[:\n]?(.*?)(?=\n[A-Z][a-z]+:|\Z)", re.IGNORECASE | re.DOTALL)
            match = pattern.search(raw_text)
            if match:
                structured[heading] = match.group(1).strip()

        if not structured:
            structured["summary"] = raw_text

        return jsonify({"details": structured})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get("message", "").strip()
        if not user_message:
            return jsonify({"response": "Please enter a message."}), 400

        response_text = generate_groq_response(
            "You are a helpful health assistant. Keep answers concise, safe, and easy to understand.",
            user_message
        )

        if not response_text:
            return jsonify({"response": "AI did not return a response."}), 500

        return jsonify({"response": response_text})

    except Exception as e:
        print("❌ Chat error:", e)
        return jsonify({"response": "An error occurred while processing your message."}), 500


@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        user_email = request.args.get("email", "").strip()
        if not user_email:
            return jsonify({"error": "Email is required"}), 400

        user = users_collection.find_one({"email": user_email})
        if user and "predictionHistory" in user:
            return jsonify({"history": user["predictionHistory"][-10:]})
        return jsonify({"history": []})

    except Exception as e:
        print("❌ History error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=True, host="0.0.0.0", port=port)
