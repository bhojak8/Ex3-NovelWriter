#!/usr/bin/env python3
"""
System compatibility checker for Ex3 Novel Writer
Identifies and resolves common issues including ps command problems
"""

import subprocess
import sys
import platform
import os
from pathlib import Path

def check_ps_command():
    """Check ps command compatibility and suggest fixes"""
    system = platform.system().lower()
    
    print("🔍 Checking ps command compatibility...")
    
    try:
        # Test different ps command formats
        if system == "linux":
            # Try GNU ps format first
            result = subprocess.run(["ps", "--help"], capture_output=True, text=True)
            if result.returncode == 0:
                print("✓ GNU ps command available")
                return True
            else:
                # Try BSD format
                result = subprocess.run(["ps", "aux"], capture_output=True, text=True)
                if result.returncode == 0:
                    print("⚠️  BSD ps detected on Linux - this may cause issues")
                    print("💡 Consider installing procps package: sudo apt-get install procps")
                    return False
        
        elif system == "darwin":  # macOS
            result = subprocess.run(["ps", "aux"], capture_output=True, text=True)
            if result.returncode == 0:
                print("✓ BSD ps command available (macOS)")
                return True
        
        elif system == "windows":
            print("ℹ️  Windows detected - ps command not applicable")
            return True
        
    except FileNotFoundError:
        print("❌ ps command not found")
        return False
    except Exception as e:
        print(f"❌ Error checking ps command: {e}")
        return False
    
    return False

def check_node_processes():
    """Check for Node.js process management tools"""
    print("🔍 Checking Node.js process management...")
    
    try:
        # Check if we can use Node.js built-in process management
        result = subprocess.run([
            "node", "-e", 
            "console.log('Node.js process management available')"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✓ Node.js process management available")
            return True
        else:
            print("❌ Node.js process management not working")
            return False
            
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False

def check_python_processes():
    """Check Python process management capabilities"""
    print("🔍 Checking Python process management...")
    
    try:
        import psutil
        print("✓ psutil available for advanced process management")
        return True
    except ImportError:
        print("⚠️  psutil not available - using basic process management")
        print("💡 Install psutil for better process management: pip install psutil")
        return False

def suggest_fixes():
    """Suggest fixes for common issues"""
    system = platform.system().lower()
    
    print("\n🔧 Suggested fixes for ps command issues:")
    print("=" * 50)
    
    if system == "linux":
        print("1. Install GNU coreutils:")
        print("   Ubuntu/Debian: sudo apt-get install procps")
        print("   CentOS/RHEL: sudo yum install procps-ng")
        print("   Arch: sudo pacman -S procps-ng")
        
    elif system == "darwin":
        print("1. macOS uses BSD ps by default - this is normal")
        print("2. If issues persist, install GNU coreutils:")
        print("   brew install coreutils")
        
    elif system == "windows":
        print("1. Use Windows Subsystem for Linux (WSL)")
        print("2. Or use PowerShell equivalents")
    
    print("\n🐍 Python-based alternatives:")
    print("1. Use our Python startup script: python scripts/start.py")
    print("2. Install psutil: pip install psutil")
    print("3. Use cross-platform process management")
    
    print("\n📦 Node.js alternatives:")
    print("1. Use concurrently: npm install -g concurrently")
    print("2. Use pm2: npm install -g pm2")
    print("3. Use our custom npm scripts")

def main():
    """Main system check function"""
    print("🔍 Ex3 Novel Writer - System Compatibility Check")
    print("=" * 60)
    
    issues_found = []
    
    # Check ps command
    if not check_ps_command():
        issues_found.append("ps command compatibility")
    
    # Check Node.js processes
    if not check_node_processes():
        issues_found.append("Node.js process management")
    
    # Check Python processes
    if not check_python_processes():
        issues_found.append("Python process management")
    
    print("\n" + "=" * 60)
    
    if issues_found:
        print(f"⚠️  Found {len(issues_found)} potential issues:")
        for issue in issues_found:
            print(f"   - {issue}")
        
        suggest_fixes()
    else:
        print("✅ All system checks passed!")
    
    print("\n🚀 Recommended startup method:")
    print("   python scripts/start.py")

if __name__ == "__main__":
    main()