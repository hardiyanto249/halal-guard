#!/usr/bin/env python3
"""
Simple test to check if the issue is with the loading state
"""
import urllib.request
import json
import re

print("=" * 80)
print("INVESTIGATING DATA DISPLAY ISSUE")
print("=" * 80)
print()

# Step 1: Check API data
print("STEP 1: Checking API Data")
print("-" * 80)
try:
    req = urllib.request.Request('https://halal-guard.centonk.my.id/api/transactions')
    with urllib.request.urlopen(req, timeout=10) as response:
        transactions = json.loads(response.read().decode())
        print(f"✅ API has {len(transactions)} transactions")
        
        if len(transactions) > 0:
            print(f"\nFirst transaction:")
            print(f"  ID: {transactions[0]['id']}")
            print(f"  Description: {transactions[0]['description']}")
            print(f"  Amount: Rp {transactions[0]['amount']:,}")
            print(f"  Has analysis: {'Yes' if transactions[0].get('analysis') else 'No'}")
            
            if transactions[0].get('analysis'):
                analysis = transactions[0]['analysis']
                print(f"  Status: {analysis.get('status', 'N/A')}")
                print(f"  Violation: {analysis.get('violationType', 'N/A')}")
except Exception as e:
    print(f"❌ Failed to fetch API data: {e}")

print()
print()

# Step 2: Check frontend HTML
print("STEP 2: Checking Frontend HTML")
print("-" * 80)
try:
    req = urllib.request.Request('https://halal-guard.centonk.my.id/')
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode()
        
        # Extract JS bundle path
        match = re.search(r'src="(/assets/[^"]+\.js)"', html)
        if match:
            js_path = match.group(1)
            print(f"✅ JS bundle: {js_path}")
        else:
            print("❌ No JS bundle found in HTML")
        
        # Check for important elements
        if '<div id="root">' in html:
            print("✅ Root div found")
        else:
            print("❌ Root div not found")
            
except Exception as e:
    print(f"❌ Failed to fetch HTML: {e}")

print()
print()

# Step 3: Check JS bundle for API calls
print("STEP 3: Checking JS Bundle for API Configuration")
print("-" * 80)
try:
    req = urllib.request.Request('https://halal-guard.centonk.my.id/')
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode()
        match = re.search(r'src="(/assets/[^"]+\.js)"', html)
        
        if match:
            js_url = f'https://halal-guard.centonk.my.id{match.group(1)}'
            req2 = urllib.request.Request(js_url)
            
            with urllib.request.urlopen(req2, timeout=10) as js_response:
                js_content = js_response.read().decode()
                
                # Check for API URL
                if 'halal-guard.centonk.my.id/api' in js_content:
                    print("✅ Production API URL found in bundle")
                    
                    # Count occurrences
                    count = js_content.count('halal-guard.centonk.my.id/api')
                    print(f"   Found {count} references to API URL")
                else:
                    print("❌ Production API URL NOT found in bundle")
                
                # Check for localhost
                if 'localhost:8087' in js_content:
                    print("⚠️  WARNING: localhost API URL found in bundle!")
                else:
                    print("✅ No localhost references (good)")
                
                # Check for getAllTransactions function
                if 'getAllTransactions' in js_content or 'transactions' in js_content:
                    print("✅ Transaction fetching code found")
                else:
                    print("⚠️  Transaction fetching code might be missing")
                
                # Check for useEffect
                if 'useEffect' in js_content:
                    print("✅ useEffect found (for loading data on mount)")
                else:
                    print("⚠️  useEffect not found")
                    
except Exception as e:
    print(f"❌ Failed to check JS bundle: {e}")

print()
print()

# Step 4: Diagnosis
print("STEP 4: Diagnosis & Recommendations")
print("-" * 80)
print("""
Based on the tests above, here are possible issues:

1. If API has data but frontend doesn't show it:
   - Check browser console for errors
   - Verify that useEffect is running on component mount
   - Check if isLoading state is stuck on true

2. If API URL is wrong in bundle:
   - Need to rebuild frontend with correct .env.production
   - Run: cd frontend && npm run build

3. If no errors but data still not showing:
   - Check if the view is set to 'dashboard' or 'analysis'
   - Verify that data state is being updated correctly
   - Check if there's a conditional rendering issue

Next steps:
1. Open browser console at https://halal-guard.centonk.my.id/
2. Check for any JavaScript errors
3. Check Network tab for API calls to /api/transactions
4. Verify that the response contains data
""")

print("=" * 80)
print("INVESTIGATION COMPLETE")
print("=" * 80)
