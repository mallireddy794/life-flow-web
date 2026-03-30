import urllib.request
# Check if the server has the new debug print endpoint
req = urllib.request.Request("http://127.0.0.1:5000/donors/nearby?lat=17.385&lng=78.4867&blood_group=o%2B")
try:
    with urllib.request.urlopen(req) as response:
        print("CODE:", response.getcode())
        print("BODY:", response.read().decode('utf-8'))
except Exception as e:
    print("ERROR:", e)
