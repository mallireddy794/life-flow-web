import urllib.request
try:
    req = urllib.request.Request("http://127.0.0.1:5000/donor/requests/nearby?lat=17.385&lng=78.4867&radius_km=15.0")
    with urllib.request.urlopen(req) as resp:
        print(f"Status: {resp.getcode()}")
        print(resp.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
