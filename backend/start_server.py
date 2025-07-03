import uvicorn
import ssl
import os
from pathlib import Path

def create_self_signed_cert():
    """Create self-signed certificate if it doesn't exist"""
    cert_file = Path("cert.pem")
    key_file = Path("key.pem")
    
    if not cert_file.exists() or not key_file.exists():
        print("Creating self-signed certificate...")
        try:
            import subprocess
            # Create self-signed certificate
            subprocess.run([
                "openssl", "req", "-x509", "-newkey", "rsa:4096", 
                "-keyout", "key.pem", "-out", "cert.pem", "-days", "365", "-nodes",
                "-subj", "/C=US/ST=State/L=City/O=Organization/CN=localhost"
            ], check=True, cwd="backend")
            print("Self-signed certificate created successfully!")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("OpenSSL not found or failed. Running without SSL...")
            return False
    return True

def start_server():
    """Start the FastAPI server"""
    os.chdir("backend")
    
    # Try to create SSL certificate
    use_ssl = create_self_signed_cert()
    
    if use_ssl and Path("cert.pem").exists() and Path("key.pem").exists():
        print("Starting server with SSL on https://localhost:8000")
        print("\nIMPORTANT: When you first visit https://localhost:8000 in your browser,")
        print("you'll see a security warning. Click 'Advanced' and 'Proceed to localhost (unsafe)'")
        print("to trust the self-signed certificate. This only needs to be done once per session.\n")
        
        uvicorn.run(
            "app:app", 
            host="0.0.0.0", 
            port=8000, 
            ssl_keyfile="key.pem", 
            ssl_certfile="cert.pem",
            reload=True
        )
    else:
        print("Starting server without SSL on http://localhost:8000")
        uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    start_server()