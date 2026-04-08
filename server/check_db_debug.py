import MySQLdb
import MySQLdb.cursors

try:
    db = MySQLdb.connect(host='localhost', user='root', passwd='', db='lifeflow_db', cursorclass=MySQLdb.cursors.DictCursor)
    cur = db.cursor()
    
    print("--- LATEST BLOOD REQUEST ---")
    cur.execute("SELECT * FROM blood_requests ORDER BY created_at DESC LIMIT 1")
    row = cur.fetchone()
    if row:
        for k, v in row.items():
            print(f"{k}: {v}")
    else:
        print("No blood requests found.")
        
    print("\n--- PATIENTS ---")
    cur.execute("SELECT * FROM patients")
    patients = cur.fetchall()
    for p in patients:
        print(p)
        
    db.close()
except Exception as e:
    print(f"Error checking DB: {e}")
