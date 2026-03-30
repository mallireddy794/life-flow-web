import MySQLdb
import json

db = MySQLdb.connect(host="localhost", user="root", passwd="", db="lifeflow_db")
cur = db.cursor(MySQLdb.cursors.DictCursor)

data = {}

cur.execute("SELECT id, name, role, latitude, longitude FROM users")
data['users'] = cur.fetchall()

cur.execute("SELECT id, user_id, blood_group, is_available, is_eligible FROM donors")
data['donors'] = cur.fetchall()

cur.execute("SELECT id, user_id, blood_group FROM patients")
data['patients'] = cur.fetchall()

cur.execute("SELECT id, patient_id, blood_group, status FROM blood_requests")
data['blood_requests'] = cur.fetchall()

cur.close()
db.close()

with open('db_dump.json', 'w') as f:
    json.dump(data, f, indent=2, default=str)
