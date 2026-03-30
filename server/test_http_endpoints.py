import urllib.request
import json
import traceback

def test():
    try:
        url_all = "http://127.0.0.1:5000/donors/nearby?blood_group=ALL&lat=13.0827&lng=80.2707&radius_km=50000"
        url_opos = "http://127.0.0.1:5000/donors/nearby?blood_group=O%2B&lat=13.0827&lng=80.2707&radius_km=50000"
        url_req = "http://127.0.0.1:5000/donor/requests/nearby?lat=13.0827&lng=80.2707&radius_km=50000"
        
        print("Testing ALL donors...")
        req = urllib.request.urlopen(url_all)
        res = json.loads(req.read().decode())
        print(f"Found: {len(res)}")
        
        print("Testing O+ donors...")
        req = urllib.request.urlopen(url_opos)
        res = json.loads(req.read().decode())
        print(f"Found: {len(res)}")

        print("Testing requests nearby...")
        req = urllib.request.urlopen(url_req)
        res = json.loads(req.read().decode())
        print(f"Found: {len(res)}")
        
    except Exception as e:
        print("ERROR:", traceback.format_exc())

if __name__ == "__main__":
    test()
