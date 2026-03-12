import MySQLdb
from werkzeug.security import generate_password_hash
import sys

try:
    db = MySQLdb.connect(host='localhost', user='root', passwd='', db='lifeflow_db')
    cursor = db.cursor()

    # Hashed password for 'password123'
    hp = generate_password_hash('password123')

    # Cleanup existing test data to avoid duplicates if re-run
    # (Optional, but good for testing)
    test_emails = ['john@donor.com', 'jane@donor.com', 'mike@donor.com', 'sarah@patient.com']
    format_strings = ','.join(['%s'] * len(test_emails))
    cursor.execute(f"DELETE FROM users WHERE email IN ({format_strings})", test_emails)
    db.commit()

    # 1. Create Donors
    donors_data = [
        ('John Donor', 'john@donor.com', 'donor', 17.3850, 78.4867, 'A+'),
        ('Jane Donor', 'jane@donor.com', 'donor', 17.3910, 78.4907, 'A+'),
        ('Mike Donor', 'mike@donor.com', 'donor', 17.4000, 78.5000, 'O+')
    ]

    for name, email, role, lat, lng, bg in donors_data:
        cursor.execute('INSERT INTO users (name, email, password, role, latitude, longitude) VALUES (%s, %s, %s, %s, %s, %s)', 
                       (name, email, hp, role, lat, lng))
        uid = cursor.lastrowid
        cursor.execute('INSERT INTO donors (user_id, blood_group, is_available, is_eligible, city) VALUES (%s, %s, 1, 1, %s)', 
                       (uid, bg, 'Hyderabad'))

    # 2. Create Patient
    cursor.execute('INSERT INTO users (name, email, password, role, latitude, longitude) VALUES (%s, %s, %s, %s, %s, %s)', 
                   ('Sarah Patient', 'sarah@patient.com', hp, 'patient', 17.3890, 78.4887))
    pid = cursor.lastrowid
    cursor.execute('INSERT INTO patients (user_id, blood_group, hospital_name, city) VALUES (%s, %s, %s, %s)', 
                   (pid, 'A+', 'City Hospital', 'Hyderabad'))
    patient_id_in_table = cursor.lastrowid

    # 3. Create Blood Request for the Patient
    cursor.execute('INSERT INTO blood_requests (patient_id, blood_group, units_required, urgency_level, status, city) VALUES (%s, %s, %s, %s, %s, %s)', 
                   (patient_id_in_table, 'A+', 2, 'High', 'Pending', 'Hyderabad'))

    db.commit()
    print("Mock data (3 Donors, 1 Patient with matching Request) successfully inserted into lifeflow_db!")
    
except Exception as e:
    print(f"Error seeding database: {e}")
    sys.exit(1)
finally:
    if 'db' in locals():
        db.close()
