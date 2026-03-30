import urllib.request
req = urllib.request.Request("http://127.0.0.1:5001/donors/nearby?lat=17.385&lng=78.4867&blood_group=ALL")
try:
    with urllib.request.urlopen(req) as response:
        print(response.getcode())
        print(response.read().decode('utf-8'))
except Exception as e:
    print(e)
