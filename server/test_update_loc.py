import urllib.request

req = urllib.request.Request("http://localhost:5000/donors/nearby?lat=12&lng=12&blood_group=A")
try:
    with urllib.request.urlopen(req) as response:
        print(response.getcode())
except Exception as e:
    print(e)
