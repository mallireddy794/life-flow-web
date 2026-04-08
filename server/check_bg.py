import MySQLdb
try:
    db = MySQLdb.connect(host='localhost', user='root', passwd='', db='lifeflow_db')
    cur = db.cursor()
    cur.execute("SELECT blood_group, COUNT(*) FROM donors WHERE is_available=1 AND is_eligible=1 GROUP BY blood_group")
    rows = cur.fetchall()
    print("\nBlood Group Distribution:")
    for row in rows:
        print(f"{row[0]}: {row[1]}")
    
    cur.close()
    db.close()
except Exception as e:
    print(f"Error: {e}")
