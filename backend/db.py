
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()  # Load from .env file

# Now you can access
MONGO_URI = os.getenv("MONGO_URI")

# Create a client
client = AsyncIOMotorClient(MONGO_URI)

# Ping to confirm connection
try:
    client.admin.command('ping')
    print("Connected to MongoDB!")
except Exception as e:
    print("Connection failed:", e)

# Export the database you want to use
db = client["health_reports_db"]  # You can rename this as needed

users = db["users"]
report_data = db["report_data"]
