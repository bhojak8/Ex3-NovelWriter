import uvicorn
import os
from pathlib import Path

def start_server():
    """Start the FastAPI server"""
    os.chdir("backend")
    
    print("Starting server on http://localhost:8000")
    print("Backend API will be available at: http://localhost:8000")
    print("Health check endpoint: http://localhost:8000/health")
    print("API documentation: http://localhost:8000/docs\n")
    
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    start_server()