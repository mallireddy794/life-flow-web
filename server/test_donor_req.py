import MySQLdb

db = MySQLdb.connect(host="localhost", user="root", passwd="", db="lifeflow_db")
cur = db.cursor()

try:
    cur.execute("INSERT INTO donor_requests (patient_id, donor_id, blood_group, units_needed, urgency, message, status) VALUES (1, 1, 'O+', 1, 'HIGH', 'Test', 'PENDING')")
    db.commit()
    print("SUCCESS")
except Exception as e:
    print("ERROR:", e)

cur.close()
db.close()
