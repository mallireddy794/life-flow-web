import urllib.request
import sys

req = urllib.request.Request("http://localhost:5000/donors/nearby?lat=17.385&lng=78.4867&blood_group=ALL")
with urllib.request.urlopen(req) as response:
    print(response.read().decode('utf-8'))
