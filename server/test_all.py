import urllib.request
import json
import urllib.parse

def test_endpoint(name, url):
    print(f"\n--- Testing {name} ---")
    print(f"URL: {url}")
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = resp.read().decode('utf-8')
            print(f"Status: {resp.getcode()}")
            try:
                parsed = json.loads(data)
                print(f"Rows returned: {len(parsed)}")
                if parsed:
                    print(f"First row: {parsed[0]}")
            except Exception as e:
                print(f"Raw response: {data[:200]}")
    except Exception as e:
        print(f"Error: {e}")

# Donor coords: lat=17.385, lng=78.4867 (Mallikarjuna Reddy user_id=26)
test_endpoint(
    "1. Patient checking nearby Donors (ALL)",
    "http://127.0.0.1:5000/donors/nearby?lat=17.385&lng=78.4867&blood_group=ALL"
)

test_endpoint(
    "2. Patient checking nearby Donors (o+)",
    "http://127.0.0.1:5000/donors/nearby?lat=17.385&lng=78.4867&blood_group=o%2b"
)

test_endpoint(
    "3. Donor checking nearby Requests",
    "http://127.0.0.1:5000/donor/requests/nearby?lat=17.385&lng=78.4867&radius_km=15.0"
)
