#!/usr/bin/env python3
import uvicorn
import os
import sys
import subprocess
import signal
import platform
from pathlib import Path

def check_port_available(port):
    """Check if a port is available using cross-platform method"""
    try:
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', port))
            return True
    except OSError:
        return False

def kill_process_on_port(port):
    """Kill process on port using cross-platform method"""
    try:
        system = platform.system().lower()
        
        if system == "windows":
            # Windows netstat command
            result = subprocess.run(
                ["netstat", "-ano"], 
                capture_output=True, 
                text=True, 
                check=True
            )
            
            for line in result.stdout.split('\n'):
                if f':{port}' in line and 'LISTENING' in line:
                    parts = line.split()
                    if len(parts) >= 5:
                        pid = parts[-1]
                        try:
                            subprocess.run(["taskkill", "/F", "/PID", pid], check=True)
                            print(f"Killed process {pid} on port {port}")
                        except subprocess.CalledProcessError:
                            pass
        else:
            # Unix-like systems (Linux, macOS) - use lsof instead of ps
            try:
                result = subprocess.run(
                    ["lsof", "-ti", f":{port}"], 
                    capture_output=True, 
                    text=True, 
                    check=True
                )
                
                for pid in result.stdout.strip().split('\n'):
                    if pid.strip():
                        try:
                            subprocess.run(["kill", "-9", pid.strip()], check=True)
                            print(f"Killed process {pid.strip()} on port {port}")
                        except subprocess.CalledProcessError:
                            pass
            except (subprocess.CalledProcessError, FileNotFoundError):
                # If lsof is not available, try netstat
                try:
                    if system == "darwin":  # macOS
                        result = subprocess.run(
                            ["netstat", "-anp", "tcp"], 
                            capture_output=True, 
                            text=True, 
                            check=True
                        )
                    else:  # Linux
                        result = subprocess.run(
                            ["netstat", "-tlnp"], 
                            capture_output=True, 
                            text=True, 
                            check=True
                        )
                    
                    for line in result.stdout.split('\n'):
                        if f':{port}' in line:
                            # Extract PID from netstat output
                            parts = line.split()
                            for part in parts:
                                if '/' in part:
                                    pid = part.split('/')[0]
                                    if pid.isdigit():
                                        try:
                                            subprocess.run(["kill", "-9", pid], check=True)
                                            print(f"Killed process {pid} on port {port}")
                                        except subprocess.CalledProcessError:
                                            pass
                except subprocess.CalledProcessError:
                    print(f"Could not automatically kill process on port {port}")
                    print("Please manually stop any process using this port")
                    
    except Exception as e:
        print(f"Error checking/killing process on port {port}: {e}")

def start_server():
    """Start the FastAPI server with cross-platform process management"""
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    port = 8000
    
    # Check if port is in use and try to free it
    if not check_port_available(port):
        print(f"Port {port} is in use. Attempting to free it...")
        kill_process_on_port(port)
        
        # Wait a moment and check again
        import time
        time.sleep(2)
        
        if not check_port_available(port):
            print(f"Warning: Port {port} may still be in use")
    
    print("=" * 60)
    print("🚀 Starting Ex3 Novel Writer Backend Server")
    print("=" * 60)
    print(f"Server URL: http://localhost:{port}")
    print(f"Health check: http://localhost:{port}/health")
    print(f"API docs: http://localhost:{port}/docs")
    print(f"Interactive docs: http://localhost:{port}/redoc")
    print("=" * 60)
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        # Start the server
        uvicorn.run(
            "app:app", 
            host="0.0.0.0", 
            port=port, 
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()