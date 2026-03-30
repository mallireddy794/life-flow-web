import urllib.request
import json
import traceback

def test():
    try:
        url_all = "http://127.0.0.1:5000/donors/nearby?blood_group=ALL&lat=13.0827&lng=80.2707&radius_km=50000"
        url_o_pos = "http://127.0.0.1:5000/donors/nearby?blood_group=O%2B&lat=13.0827&lng=80.2707&radius_km=50000"
        
        req_all = urllib.request.urlopen(url_all)
        res_all = json.loads(req_all.read().decode())
        print(f"blood_group=ALL count: {len(res_all)}")
        
        req_o = urllib.request.urlopen(url_o_pos)
        res_o = json.loads(req_o.read().decode())
        print(f"blood_group=O+ count: {len(res_o)}")
    except Exception as e:
        print("ERROR:", traceback.format_exc())

if __name__ == "__main__":
    test()
