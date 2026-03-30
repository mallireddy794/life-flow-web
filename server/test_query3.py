import MySQLdb

db = MySQLdb.connect(host="localhost", user="root", passwd="", db="lifeflow_db")
cur = db.cursor(MySQLdb.cursors.DictCursor)

lat = 17.385
lng = 78.4867
radius = 10.0

query = """
    SELECT
      u.id,
      d.is_available,
      d.is_eligible,
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
      AND d.is_available = 1
      AND d.is_eligible = 1
      AND u.latitude IS NOT NULL
      AND u.longitude IS NOT NULL
"""
params = [lat, lat, lng]
query += " HAVING distance_km <= %s "
params.append(radius)

print("QUERY: ", query)
cur.execute(query, tuple(params))
rows = cur.fetchall()

print("FOUND ROWS:", len(rows))
for r in rows:
    print(r)

cur.close()
db.close()
