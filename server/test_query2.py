import MySQLdb

db = MySQLdb.connect(host="localhost", user="root", passwd="", db="lifeflow_db")
cur = db.cursor(MySQLdb.cursors.DictCursor)

lat = 17.385
lng = 78.4867
radius = 15.0

query = """
SELECT 
    br.id, br.blood_group, br.units_required, br.urgency_level, br.status, br.city,
    p.hospital_name, br.patient_id, u.latitude, u.longitude,
    (6371 * 2 * ASIN(SQRT(
        GREATEST(0, POWER(SIN((RADIANS(u.latitude - %s)) / 2), 2) +
        COS(RADIANS(%s)) * COS(RADIANS(u.latitude)) *
        POWER(SIN((RADIANS(u.longitude - %s)) / 2), 2))
    ))) AS distance_km
FROM blood_requests br
JOIN patients p ON p.id = br.patient_id
JOIN users u ON u.id = p.user_id
"""
query += " WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL AND br.status IN ('PENDING', 'Pending', 'Approved', 'Urgent') "
query += " HAVING distance_km <= %s ORDER BY distance_km ASC LIMIT 50 "

cur.execute(query, (lat, lat, lng, radius))
rows = cur.fetchall()

print("FOUND BLOOD REQUEST ROWS:", len(rows))
for r in rows:
    print(r)

cur.close()
db.close()
