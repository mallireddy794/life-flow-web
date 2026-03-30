import urllib.request
import json

# Check raw server response for ALL
url = "http://127.0.0.1:5000/donors/nearby?blood_group=ALL&lat=13.0286444&lng=80.0345369&radius_km=50000"
try:
    r = urllib.request.urlopen(url)
    data = json.loads(r.read().decode())
    print("ALL donors (exact donor location):", len(data), data)
except Exception as e:
    print("ERROR:", e)

# Check with lowercase 'all'
url2 = "http://127.0.0.1:5000/donors/nearby?blood_group=all&lat=13.0286444&lng=80.0345369&radius_km=50000"
try:
    r2 = urllib.request.urlopen(url2)
    data2 = json.loads(r2.read().decode())
    print("all donors (lowercase):", len(data2), data2)
except Exception as e:
    print("ERROR2:", e)
