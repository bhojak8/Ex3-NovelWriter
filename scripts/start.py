#!/usr/bin/env python3
"""
Cross-platform startup script for Ex3 Novel Writer
Avoids ps command issues by using Python's built-in process management
"""

import subprocess
import sys
import os
import time
import signal
import platform
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import uvicorn
        import fastapi
        print("✓ Backend dependencies found")
    except ImportError as e:
        print(f"❌ Missing backend dependency: {e}")
        print("Please run: pip install -r backend/requirements.txt")
        return False
    
    # Check if Node.js is available
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✓ Node.js found: {result.stdout.strip()}")
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False
    
    return True

def start_backend():
    """Start the backend server"""
    backend_dir = Path(__file__).parent.parent / "backend"
    
    print("🔧 Starting backend server...")
    
    # Use Python directly to avoid shell command issues
    backend_process = subprocess.Popen([
        sys.executable, "-m", "uvicorn", "app:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ], cwd=backend_dir)
    
    return backend_process

def start_frontend():
    """Start the frontend development server"""
    project_root = Path(__file__).parent.parent
    
    print("🎨 Starting frontend server...")
    
    # Use npm directly
    frontend_process = subprocess.Popen([
        "npm", "run", "dev"
    ], cwd=project_root)
    
    return frontend_process

def main():
    """Main startup function"""
    print("🚀 Ex3 Novel Writer - Starting Application")
    print("=" * 50)
    
    if not check_dependencies():
        sys.exit(1)
    
    backend_process = None
    frontend_process = None
    
    try:
        # Start backend
        backend_process = start_backend()
        time.sleep(3)  # Give backend time to start
        
        # Start frontend
        frontend_process = start_frontend()
        
        print("\n✅ Application started successfully!")
        print("📱 Frontend: http://localhost:5173")
        print("🔧 Backend: http://localhost:8000")
        print("📚 API Docs: http://localhost:8000/docs")
        print("\nPress Ctrl+C to stop all servers")
        
        # Wait for processes
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            if backend_process.poll() is not None:
                print("❌ Backend process stopped unexpectedly")
                break
            
            if frontend_process.poll() is not None:
                print("❌ Frontend process stopped unexpectedly")
                break
                
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        
        # Terminate processes gracefully
        if backend_process:
            backend_process.terminate()
            try:
                backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                backend_process.kill()
        
        if frontend_process:
            frontend_process.terminate()
            try:
                frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                frontend_process.kill()
        
        print("✅ All servers stopped")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()