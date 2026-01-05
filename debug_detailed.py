#!/usr/bin/env python3
import urllib.request
import json
import sys

print("=" * 70)
print("DETAILED DEBUGGING: HalalGuard Application")
print("=" * 70)
print()

# Test 1: Get the HTML page
print("TEST 1: Fetching Homepage HTML")
print("-" * 70)
try:
    req = urllib.request.Request('https://halal-guard.centonk.my.id/')
    req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode()
        
        print(f"✅ Status Code: {response.status}")
        print(f"✅ Content-Type: {response.headers.get('Content-Type')}")
        print(f"✅ Content-Length: {len(html)} bytes")
        print()
        
        # Check critical elements
        print("Checking critical elements:")
        checks = {
            '<div id="root">': 'Root div',
            'cdn.tailwindcss.com': 'Tailwind CDN',
            '/assets/index-': 'Main JS bundle',
            'index.css': 'CSS reference (should NOT exist)',
            'react': 'React import',
            'HalalGuard': 'App title'
        }
        
        for pattern, description in checks.items():
            if pattern in html:
                if pattern == 'index.css':
                    print(f"   ❌ {description}: FOUND (This is BAD!)")
                else:
                    print(f"   ✅ {description}: Found")
            else:
                if pattern == 'index.css':
                    print(f"   ✅ {description}: Not found (Good!)")
                else:
                    print(f"   ❌ {description}: NOT FOUND")
        
        print()
        print("First 1000 characters of HTML:")
        print("-" * 70)
        print(html[:1000])
        print("-" * 70)
        
except Exception as e:
    print(f"❌ FAILED: {e}")
    import traceback
    traceback.print_exc()

print()
print()

# Test 2: Check if JS bundle exists
print("TEST 2: Checking Main JavaScript Bundle")
print("-" * 70)
try:
    # First, extract the JS bundle path from HTML
    import re
    req = urllib.request.Request('https://halal-guard.centonk.my.id/')
    req.add_header('User-Agent', 'Mozilla/5.0')
    
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode()
        
        # Find the script src
        match = re.search(r'src="(/assets/[^"]+\.js)"', html)
        if match:
            js_path = match.group(1)
            print(f"Found JS bundle: {js_path}")
            
            # Try to fetch it
            js_url = f'https://halal-guard.centonk.my.id{js_path}'
            req2 = urllib.request.Request(js_url)
            req2.add_header('User-Agent', 'Mozilla/5.0')
            
            with urllib.request.urlopen(req2, timeout=10) as js_response:
                js_content = js_response.read().decode()
                print(f"✅ JS bundle loaded successfully ({len(js_content)} bytes)")
                
                # Check if API URL is in the bundle
                if 'halal-guard.centonk.my.id/api' in js_content:
                    print("✅ Production API URL found in bundle")
                elif 'localhost:8087' in js_content:
                    print("❌ WARNING: localhost API URL found in bundle!")
                else:
                    print("⚠️  No API URL pattern found in bundle")
        else:
            print("❌ No JS bundle path found in HTML")
            
except Exception as e:
    print(f"❌ FAILED: {e}")

print()
print()

# Test 3: Check API endpoint
print("TEST 3: Testing API Endpoint")
print("-" * 70)
try:
    req = urllib.request.Request('https://halal-guard.centonk.my.id/api/transactions')
    req.add_header('User-Agent', 'Mozilla/5.0')
    
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode())
        print(f"✅ API Status: {response.status}")
        print(f"✅ Transactions found: {len(data)}")
        if len(data) > 0:
            print(f"✅ First transaction ID: {data[0]['id']}")
            print(f"✅ Has analysis: {'Yes' if data[0].get('analysis') else 'No'}")
        
except Exception as e:
    print(f"❌ FAILED: {e}")

print()
print("=" * 70)
print("DEBUGGING COMPLETE")
print("=" * 70)
