import MySQLdb
import json

def test():
    conn = MySQLdb.connect(host="localhost", user="root", password="", database="lifeflow_db")
    cur = conn.cursor(MySQLdb.cursors.DictCursor)

    print("=== 1. All DONOR users with location ===")
    cur.execute("""
        SELECT u.id, u.name, u.role, u.latitude, u.longitude,
               d.blood_group, d.is_available, d.is_eligible
        FROM users u
        LEFT JOIN donors d ON d.user_id = u.id
        WHERE u.role = 'donor'
    """)
    donors = cur.fetchall()
    for d in donors:
        print(d)

    print("\n=== 2. All PATIENT users with location ===")
    cur.execute("""
        SELECT u.id, u.name, u.role, u.latitude, u.longitude
        FROM users u WHERE u.role = 'patient'
    """)
    patients = cur.fetchall()
    for p in patients:
        print(p)

    print("\n=== 3. All blood_requests ===")
    cur.execute("""
        SELECT br.id, br.patient_id, br.blood_group, br.units_required, br.urgency_level, br.status,
               p.user_id, u.latitude, u.longitude
        FROM blood_requests br
        JOIN patients p ON p.id = br.patient_id
        JOIN users u ON u.id = p.user_id
        ORDER BY br.id DESC LIMIT 10
    """)
    reqs = cur.fetchall()
    for r in reqs:
        print(r)

    print("\n=== 4. Haversine test between donor and patient ===")
    cur.execute("""
        SELECT
            u_d.id AS donor_id, u_d.name AS donor_name,
            u_d.latitude AS d_lat, u_d.longitude AS d_lng,
            u_p.id AS patient_id, u_p.name AS patient_name,
            u_p.latitude AS p_lat, u_p.longitude AS p_lng,
            (6371 * 2 * ASIN(SQRT(GREATEST(0,
                POWER(SIN((RADIANS(u_d.latitude - u_p.latitude)) / 2), 2) +
                COS(RADIANS(u_p.latitude)) * COS(RADIANS(u_d.latitude)) *
                POWER(SIN((RADIANS(u_d.longitude - u_p.longitude)) / 2), 2)
            )))) AS distance_km
        FROM users u_d
        JOIN donors d ON d.user_id = u_d.id
        JOIN users u_p ON u_p.role = 'patient'
        WHERE u_d.role = 'donor'
          AND u_d.latitude IS NOT NULL
          AND u_p.latitude IS NOT NULL
    """)
    distances = cur.fetchall()
    for dist in distances:
        print(dist)

    cur.close()
    conn.close()

if __name__ == "__main__":
    test()
