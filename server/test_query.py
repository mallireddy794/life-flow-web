import MySQLdb

db = MySQLdb.connect(host="localhost", user="root", passwd="", db="lifeflow_db")
cur = db.cursor(MySQLdb.cursors.DictCursor)

lat = 17.385
lng = 78.4867
blood_group = "o+"
radius = 10.0

query = """
SELECT
  u.id,
  u.name,
  d.phone,
  d.blood_group,
  d.city,
  u.latitude,
  u.longitude,
  (
    6371 * 2 * ASIN(
      SQRT(
        GREATEST(0, POWER(SIN((RADIANS(u.latitude - %s)) / 2), 2) +
        COS(RADIANS(%s)) *
        COS(RADIANS(u.latitude)) *
        POWER(SIN((RADIANS(u.longitude - %s)) / 2), 2))
      )
    )
  ) AS distance_km
FROM users u
JOIN donors d ON d.user_id = u.id
WHERE u.role = 'donor'
  AND REPLACE(LOWER(d.blood_group), ' ', '') = REPLACE(LOWER(%s), ' ', '')
  AND d.is_available = 1
  AND d.is_eligible = 1
  AND u.latitude IS NOT NULL
  AND u.longitude IS NOT NULL
HAVING distance_km <= %s
ORDER BY distance_km ASC
LIMIT 50
"""

cur.execute(query, (lat, lat, lng, blood_group, radius))
rows = cur.fetchall()

print("FOUND ROWS:", len(rows))
for r in rows:
    print(r)

cur.close()
db.close()
