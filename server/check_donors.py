import MySQLdb
try:
    db = MySQLdb.connect(host='localhost', user='root', passwd='', db='lifeflow_db')
    cur = db.cursor()
    cur.execute("SELECT COUNT(*) FROM users u JOIN donors d ON d.user_id = u.id WHERE u.role = 'donor' AND d.is_available = 1 AND d.is_eligible = 1")
    count = cur.fetchone()[0]
    print(f"Active and eligible donors: {count}")
    
    cur.execute("SELECT id, name, latitude, longitude FROM users WHERE role = 'donor'")
    donors = cur.fetchall()
    print("\nDonor Coordinates:")
    for donor in donors:
        print(f"ID: {donor[0]}, Name: {donor[1]}, Lat: {donor[2]}, Lng: {donor[3]}")
    
    cur.close()
    db.close()
except Exception as e:
    print(f"Error: {e}")
