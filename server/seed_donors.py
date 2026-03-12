
import MySQLdb
from MySQLdb.cursors import DictCursor
from werkzeug.security import generate_password_hash
import random
from datetime import datetime

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'lifeflow_db'
}

def seed_donors():
    try:
        conn = MySQLdb.connect(
            host=db_config['host'],
            user=db_config['user'],
            passwd=db_config['password'],
            db=db_config['database']
        )
        cursor = conn.cursor()

        # Some Indian cities approximately around a central point (for testing distance)
        # Assuming user is at (17.3850, 78.4867) [Hyderabad]
        cities = [
            ("Suresh Reddy", "A+", "Hyderabad", 17.3850, 78.4867, "9876543210"),
            ("Anjali Sharma", "B+", "Secunderabad", 17.4411, 78.4900, "9876543211"),
            ("Mohit Kumar", "O-", "Gachibowli", 17.4401, 78.3489, "9876543212"),
            ("Priya Patel", "AB+", "Kukatpally", 17.4948, 78.3996, "9876543213"),
            ("Vikram Singh", "A-", "Banjara Hills", 17.4151, 78.4413, "9876543214"),
            ("Sneha Rao", "O+", "Jubilee Hills", 17.4326, 78.4071, "9876543215"),
            ("Rahul Gupta", "B-", "Ameerpet", 17.4375, 78.4482, "9876543216"),
            ("Deepa Nair", "A+", "Madhapur", 17.4483, 78.3915, "9876543217"),
        ]

        password_hash = generate_password_hash("password123")

        for name, bg, city, lat, lng, phone in cities:
            email = f"{name.lower().replace(' ', '.')}@example.com"
            
            # Check if user exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                print(f"User {email} already exists, skipping...")
                continue

            # Insert User
            cursor.execute(
                "INSERT INTO users (name, email, password, role, latitude, longitude) VALUES (%s, %s, %s, 'donor', %s, %s)",
                (name, email, password_hash, lat, lng)
            )
            user_id = cursor.lastrowid

            # Insert Donor
            cursor.execute(
                "INSERT INTO donors (user_id, phone, blood_group, city, is_available, is_eligible) VALUES (%s, %s, %s, %s, 1, 1)",
                (user_id, phone, bg, city)
            )
            print(f"Seeded donor: {name} ({bg})")

        conn.commit()
        print("Successfully seeded donors!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    seed_donors()
