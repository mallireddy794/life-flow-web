import urllib.request
try:
    req = urllib.request.Request("http://127.0.0.1:5000/")
    with urllib.request.urlopen(req) as resp:
        print(f"Status: {resp.getcode()}")
        print(resp.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
