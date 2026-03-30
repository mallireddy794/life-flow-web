import urllib.request, json

# Set patient (user 57) location to same as donor
data = json.dumps({"user_id": 57, "lat": 17.385, "lng": 78.4867}).encode()
req = urllib.request.Request("http://127.0.0.1:5000/update-location", data=data, headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as resp:
        print("Update patient location:", resp.getcode(), resp.read().decode())
except Exception as e:
    print("ERROR:", e)

# Check donors/nearby with o+ (donor's blood group)
req2 = urllib.request.Request("http://127.0.0.1:5000/donors/nearby?lat=17.385&lng=78.4867&blood_group=ALL")
with urllib.request.urlopen(req2) as resp2:
    body = resp2.read().decode()
    data2 = json.loads(body)
    print(f"\nDonors found: {len(data2)}")
    for d in data2:
        print(f"  -> {d['name']} | {d['blood_group']} | dist={d['distance_km']}km")
