from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import random
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from MySQLdb.cursors import DictCursor
from database import engine
from models import Base

# This will create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = Flask(__name__)
CORS(app)

# ================= DATABASE CONFIG =================
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'lifeflow_db'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor' # Optional: set default cursor

mysql = MySQL(app)

import re

def is_valid_email(email):
    # Matches common email formats and blocks things like @gmail.com or user@gmail
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_strong_password(password):
    # At least 8 characters, 1 uppercase, 1 special character, 1 number
    if len(password) < 8:
        return False
    if not any(c.isupper() for c in password):
        return False
    if not any(c.isdigit() for c in password):
        return False
    if not any(not c.isalnum() for c in password):
        return False
    return True

def is_valid_phone(phone):
    p = str(phone).strip()
    return len(p) == 10 and p.isdigit()

# ================= SIGNUP / REGISTER =================
@app.route('/signup', methods=['GET', 'POST'])
@app.route('/register', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        return jsonify({
            "message": "Signup endpoint exists. Use POST.",
            "required_fields": ["name", "email", "phone", "blood_group", "password", "role"]
        }), 200

    data = request.get_json(force=True)

    name = str(data.get('name', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    phone = str(data.get('phone', '')).strip()
    blood_group = str(data.get('blood_group', '')).strip()
    password = str(data.get('password', '')).strip()
    role = str(data.get('role', '')).strip().lower()

    # Basic validation
    if not all([name, email, password, role]):
        return jsonify({"error": "Name, email, password, and role are required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Enter valid email"}), 400

    if not is_valid_phone(phone):
        return jsonify({"error": "Enter valid 10-digit phone number"}), 400

    if not is_strong_password(password):
        return jsonify({"error": "Password must be 8+ characters, with uppercase, number, and special character"}), 400

    if role not in ["donor", "patient", "hospital"]:
        return jsonify({"error": "Role must be donor, patient, or hospital"}), 400

    # Blood group is required for donors and patients, not necessarily for hospitals
    if role in ["donor", "patient"] and not blood_group:
         return jsonify({"error": "Blood group is required for donors and patients"}), 400

    hashed_password = generate_password_hash(password)
    cursor = mysql.connection.cursor()

    try:
        # Check existing user
        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        existing = cursor.fetchone()
        if existing:
            cursor.close()
            return jsonify({"error": "Email already exists"}), 409

        # Insert into users table
        cursor.execute(
            """
            INSERT INTO users (name, full_name, email, password, role, phone, blood_group)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (name, name, email, hashed_password, role, phone, blood_group)
        )
        mysql.connection.commit()

        user_id = cursor.lastrowid

        # Insert into role tables
        if role == "donor":
            cursor.execute(
                """
                INSERT INTO donors (user_id, phone, blood_group, is_available, is_eligible)
                VALUES (%s, %s, %s, 1, 1)
                """,
                (user_id, phone, blood_group)
            )

        elif role == "patient":
            cursor.execute(
                """
                INSERT INTO patients (user_id, phone, blood_group)
                VALUES (%s, %s, %s)
                """,
                (user_id, phone, blood_group)
            )

        elif role == "hospital":
            cursor.execute(
                """
                INSERT INTO hospitals (user_id, phone)
                VALUES (%s, %s)
                """,
                (user_id, phone)
            )

        mysql.connection.commit()
        cursor.close()

        return jsonify({
            "message": "User registered successfully",
            "user_id": user_id,
            "role": role
        }), 201

    except Exception as e:
        mysql.connection.rollback()
        if cursor: cursor.close()
        return jsonify({"error": f"Signup failed: {str(e)}"}), 500


# ================= LOGIN =================
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(force=True)
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', '')).strip()

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Enter valid email"}), 400

    cursor = mysql.connection.cursor()
    # Using specific index access or dictionary access depends on MYSQL_CURSORCLASS
    # We'll use tuple indices since default is usually tuple in flask_mysqldb 
    # unless configured otherwise. But app.py previously used user[0], so we keep that.
    cursor.execute("SELECT id, name, password, role FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        return jsonify({"error": "User not found"}), 404

    # Handle both Dict and Tuple results if config changes
    u_id = user['id'] if isinstance(user, dict) else user[0]
    u_name = user['name'] if isinstance(user, dict) else user[1]
    u_pass = user['password'] if isinstance(user, dict) else user[2]
    u_role = user['role'] if isinstance(user, dict) else user[3]

    if not check_password_hash(u_pass, password):
        cursor.close()
        return jsonify({"error": "Invalid password"}), 401

    # Determine profile details
    is_profile_complete = False
    profile_details = {}
    
    if u_role == 'donor':
        cursor.execute("SELECT age, city, blood_group, last_donation_date FROM donors WHERE user_id=%s", (u_id,))
        row = cursor.fetchone()
        if row:
            if row['age'] or row['city']:
                is_profile_complete = True
            profile_details = {
                "blood_group": row['blood_group'],
                "last_donation_date": str(row['last_donation_date']) if row['last_donation_date'] else None
            }
    elif u_role == 'patient':
        cursor.execute("SELECT hospital_name, city, blood_group, units_needed, phone FROM patients WHERE user_id=%s", (u_id,))
        row = cursor.fetchone()
        if row:
            if row['hospital_name'] or row['city']:
                is_profile_complete = True
            profile_details = {
                "blood_group": row['blood_group'],
                "units_needed": row['units_needed'],
                "hospital_name": row['hospital_name'],
                "phone": row['phone']
            }
    elif u_role == 'hospital':
        is_profile_complete = True # Hospital has simple registration

    cursor.close()

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": u_id,
            "name": u_name,
            "role": u_role,
            "is_profile_complete": is_profile_complete,
            **profile_details
        }
    }), 200


# ================= FORGOT PASSWORD =================
@app.route('/forgot-password', methods=['POST', 'PUT'])
def forgot_password():
    data = request.get_json(force=True)
    email = str(data.get("email", "")).strip().lower()
    new_password = str(data.get("new_password", "")).strip()

    if not email or not new_password:
        return jsonify({"error": "Email and new password required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Enter valid email"}), 400

    if not is_strong_password(new_password):
        return jsonify({"error": "New password must be 8+ characters, with uppercase, number, and special character"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        return jsonify({"error": "Email not registered"}), 404

    hashed_password = generate_password_hash(new_password)

    cursor.execute(
        "UPDATE users SET password=%s WHERE email=%s",
        (hashed_password, email)
    )
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Password updated successfully"}), 200


# ================= SEND OTP (RECOVERY AGNOSTIC) =================
@app.route('/send-otp', methods=['POST'])
def send_otp():
    try:
        data = request.get_json(force=True)
        email = str(data.get("email", "")).strip().lower()
        role = str(data.get("role", "")).strip().lower()

        if not email:
            return jsonify({"error": "Email required"}), 400

        if not is_valid_email(email):
            return jsonify({"error": "Enter valid email"}), 400

        cursor = mysql.connection.cursor()
        # Search by email only to find the user regardless of the role sent by the app
        cursor.execute("SELECT id, role FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

        if not user:
            cursor.close()
            return jsonify({"error": "Email not registered"}), 404

        # Use the actual role from the DB for logging/returning info
        u_role = user['role'] if isinstance(user, dict) else user[1]

        otp = str(random.randint(100000, 999999))
        expiry_time = datetime.now() + timedelta(minutes=5)

        try:
            cursor.execute(
                "UPDATE users SET otp=%s, otp_expiry=%s WHERE email=%s",
                (otp, expiry_time, email)
            )
            mysql.connection.commit()
        except Exception as e:
            mysql.connection.rollback()
            cursor.close()
            return jsonify({"error": "Database error", "details": str(e)}), 500
        finally:
            cursor.close()

        sender_email = "mallireddy794@gmail.com"
        sender_password = "iscd tkil zwvh wqjz"

        body = f"Hello from LifeFlow,\n\nYour OTP for password reset is: {otp}\nValid for 5 minutes."

        msg = MIMEText(body)
        msg["Subject"] = "LifeFlow Password Reset OTP"
        msg["From"] = sender_email
        msg["To"] = email

        try:
            server = smtplib.SMTP("smtp.gmail.com", 587, timeout=20)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [email], msg.as_string())
            server.quit()
            return jsonify({"message": "OTP sent successfully", "role": u_role}), 200
        except Exception as e_587:
            try:
                server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20)
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, [email], msg.as_string())
                server.quit()
                return jsonify({"message": "OTP sent successfully", "role": u_role}), 200
            except Exception as e_465:
                return jsonify({"error": "Email sending failed", "details": str(e_465)}), 500
    except Exception as ge:
        return jsonify({"error": "Server error", "details": str(ge)}), 500


# ================= VERIFY OTP =================
@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json(force=True)
    email = str(data.get("email", "")).strip().lower()
    otp = str(data.get("otp", "")).strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP required"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT otp, otp_expiry FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        return jsonify({"error": "User not found"}), 404

    # Handle Dict/Tuple
    stored_otp = user['otp'] if isinstance(user, dict) else user[0]
    expiry_time = user['otp_expiry'] if isinstance(user, dict) else user[1]

    if str(stored_otp) != otp:
        cursor.close()
        return jsonify({"error": "Invalid OTP"}), 400

    if datetime.now() > expiry_time:
        cursor.close()
        return jsonify({"error": "OTP expired"}), 400

    cursor.close()
    return jsonify({"message": "OTP verified successfully"}), 200


# ================= RESET PASSWORD =================
@app.route('/reset-password', methods=['POST', 'PUT'])
def reset_password():
    data = request.get_json(force=True)
    email = str(data.get("email", "")).strip().lower()
    new_password = str(data.get("new_password", "")).strip()

    if not email or not new_password:
        return jsonify({"error": "Email and new password required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Enter valid email"}), 400

    if not is_strong_password(new_password):
        return jsonify({"error": "New password must be 8+ characters, with uppercase, number, and special character"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        return jsonify({"error": "Email not registered"}), 404

    hashed_password = generate_password_hash(new_password)

    cursor.execute(
        "UPDATE users SET password=%s, otp=NULL, otp_expiry=NULL WHERE email=%s",
        (hashed_password, email)
    )
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Password updated successfully"}), 200


# ================= DONOR PROFILE =================
@app.route('/donor/profile/<int:user_id>', methods=['GET', 'PUT'])
def donor_profile(user_id):
    cursor = mysql.connection.cursor(DictCursor)
    
    if request.method == 'GET':
        cursor.execute("""
            SELECT u.id, u.name, u.email, d.phone, d.blood_group, d.age, d.city, d.last_donation_date, u.latitude, u.longitude
            FROM users u
            JOIN donors d ON d.user_id = u.id
            WHERE u.id = %s
        """, (user_id,))
        donor = cursor.fetchone()
        cursor.close()
        if not donor:
            return jsonify({"error": "Donor not found"}), 404
        
        # Format date for JSON
        if donor.get("last_donation_date"):
            donor["last_donation_date"] = str(donor["last_donation_date"])
            
        return jsonify(donor), 200

    # PUT logic
    data = request.get_json(force=True)
    
    # 1. Update users table (name)
    if "name" in data:
        cursor.execute("UPDATE users SET name=%s WHERE id=%s", (data.get("name"), user_id))

    # 2. Update donors table
    cursor.execute("""
        UPDATE donors
        SET phone=%s, blood_group=%s, age=%s, city=%s, last_donation_date=%s
        WHERE user_id=%s
    """, (
        data.get("phone"),
        data.get("blood_group"),
        data.get("age"),
        data.get("city"),
        data.get("last_donation_date"),
        user_id
    ))

    # 3. Update location if provided
    if "latitude" in data and "longitude" in data:
        cursor.execute("""
            UPDATE users SET latitude=%s, longitude=%s WHERE id=%s
        """, (data.get("latitude"), data.get("longitude"), user_id))

    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Donor profile updated successfully"}), 200


# ================= DONOR AVAILABILITY =================
@app.route('/donor/availability/<int:user_id>', methods=['PUT'])
def toggle_availability(user_id):
    data = request.get_json(force=True)

    if "is_available" not in data:
        return jsonify({"error": "Missing is_available"}), 400

    is_available = 1 if bool(data["is_available"]) else 0

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT is_eligible FROM donors WHERE user_id=%s", (user_id,))
    donor = cursor.fetchone()

    if not donor:
        cursor.close()
        return jsonify({"error": "Donor not found"}), 404
        
    is_eligible = donor['is_eligible'] if isinstance(donor, dict) else donor[0]

    if is_eligible == 0 and is_available == 1:
        cursor.close()
        return jsonify({"error": "Not eligible to donate"}), 403

    cursor.execute("""
        UPDATE donors
        SET is_available=%s, last_status_update=%s
        WHERE user_id=%s
    """, (is_available, datetime.utcnow(), user_id))

    mysql.connection.commit()
    cursor.close()

    return jsonify({
        "message": "Availability updated successfully",
        "is_available": is_available
    }), 200


# ================= DONOR DONATIONS ADD =================
@app.route('/donor/donations/add', methods=['POST'])
def add_donation():
    data = request.get_json(silent=True)
    print("Donation body received:", data)

    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    # required fields check
    for k in ["donor_id", "donation_date", "units", "blood_group"]:
        if k not in data or data[k] in [None, ""]:
            return jsonify({"error": f"Missing or empty field: {k}"}), 400

    # numeric checks
    try:
        donor_id = int(data["donor_id"])
    except Exception:
        return jsonify({"error": "donor_id must be a number"}), 400

    try:
        units = int(data["units"])
    except Exception:
        return jsonify({"error": "units must be a number"}), 400

    # date parsing
    raw_date = str(data["donation_date"]).strip().replace("T", " ")
    try:
        dt = datetime.strptime(raw_date, "%Y-%m-%d %H:%M:%S")
    except Exception:
        return jsonify({"error": "donation_date must be 'YYYY-MM-DD HH:MM:SS'"}), 400

    cursor = mysql.connection.cursor()

    # check donor exists in users table
    cursor.execute("SELECT id, role FROM users WHERE id=%s", (donor_id,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        return jsonify({"error": f"donor_id {donor_id} not found in users table"}), 400

    # works for tuple cursor and dict cursor
    role = user[1] if isinstance(user, tuple) else user["role"]

    if str(role).lower() != "donor":
        cursor.close()
        return jsonify({"error": f"user id {donor_id} exists but role is not donor"}), 400

    try:
        cursor.execute("""
            INSERT INTO donor_donations
            (donor_id, donation_date, units, blood_group, location, notes)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            donor_id,
            dt,
            units,
            str(data["blood_group"]).strip(),
            data.get("location"),
            data.get("notes")
        ))
        mysql.connection.commit()
        donation_id = cursor.lastrowid
        cursor.close()

        return jsonify({
            "message": "Donation history added",
            "donation_id": donation_id
        }), 201

    except Exception as e:
        mysql.connection.rollback()
        cursor.close()
        return jsonify({"error": str(e)}), 500


# ================= DONOR DONATION HISTORY =================
@app.route('/donor/donations/history', methods=['GET'])
def donation_history():
    user_id = request.args.get("donor_id")

    if not user_id:
        return jsonify({"error": "Missing donor_id (user_id)"}), 400

    cursor = mysql.connection.cursor(DictCursor)
    cursor.execute("""
        SELECT id, donation_date, units, blood_group, location, notes
        FROM donor_donations
        WHERE donor_id = %s
        ORDER BY donation_date DESC
    """, (user_id,))

    history = cursor.fetchall()
    cursor.close()

    for h in history:
        if h.get("donation_date"):
            h["donation_date"] = h["donation_date"].strftime("%Y-%m-%d %H:%M:%S")

    return jsonify({
        "user_id": int(user_id),
        "count": len(history),
        "history": history
    }), 200


# ================= PATIENT PROFILE =================
@app.route('/patient/profile/<int:user_id>', methods=['GET', 'PUT'])
def patient_profile(user_id):
    cursor = mysql.connection.cursor(DictCursor)
    
    if request.method == 'GET':
        cursor.execute("SELECT * FROM patients WHERE user_id=%s", (user_id,))
        patient = cursor.fetchone()
        cursor.close()
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        return jsonify(patient), 200

    # PUT logic
    data = request.get_json(force=True)

    cursor.execute("""
        UPDATE patients
        SET phone=%s, blood_group=%s, hospital_name=%s, city=%s, units_needed=%s
        WHERE user_id=%s
    """, (
        data.get("phone"),
        data.get("blood_group"),
        data.get("hospital_name"),
        data.get("city"),
        data.get("units_needed", 0),
        user_id
    ))

    # Update location in users table
    if "latitude" in data and "longitude" in data:
        cursor.execute("""
            UPDATE users SET latitude=%s, longitude=%s WHERE id=%s
        """, (data.get("latitude"), data.get("longitude"), user_id))

    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Patient profile updated"}), 200


# ================= CREATE BLOOD REQUEST =================
@app.route('/patient/request/<int:user_id>', methods=['POST'])
def create_request(user_id):
    data = request.get_json(force=True)

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id FROM patients WHERE user_id=%s", (user_id,))
    patient = cursor.fetchone()

    if not patient:
        cursor.close()
        return jsonify({"error": "Patient profile not found"}), 404

    patient_id = patient['id'] if isinstance(patient, dict) else patient[0]

    cursor.execute("""
        INSERT INTO blood_requests
        (patient_id, patient_name, hospital_name, contact_number, blood_group, units_required, urgency_level, city, status)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'PENDING')
    """, (
        patient_id,
        data.get("patient_name"),
        data.get("hospital_name"),
        data.get("contact_number"),
        data.get("blood_group"),
        data.get("units_required"),
        data.get("urgency_level"),
        data.get("city")
    ))

    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Blood request created"}), 201


# ================= VIEW PATIENT REQUESTS =================
@app.route('/patient/requests/<int:user_id>', methods=['GET'])
def view_requests(user_id):
    cursor = mysql.connection.cursor()

    cursor.execute("SELECT id FROM patients WHERE user_id=%s", (user_id,))
    patient = cursor.fetchone()

    if not patient:
        cursor.close()
        return jsonify({"error": "Patient not found"}), 404

    patient_id = patient['id'] if isinstance(patient, dict) else patient[0]

    cursor.execute("""
        SELECT id, blood_group, units_required, urgency_level, status, city
        FROM blood_requests
        WHERE patient_id=%s
    """, (patient_id,))

    requests = cursor.fetchall()
    cursor.close()

    result = []
    for r in requests:
        if isinstance(r, dict):
             result.append({
                "request_id": r['id'],
                "blood_group": r['blood_group'],
                "units_required": r['units_required'],
                "urgency_level": r['urgency_level'],
                "status": r['status'],
                "city": r['city']
            })
        else:
            result.append({
                "request_id": r[0],
                "blood_group": r[1],
                "units_required": r[2],
                "urgency_level": r[3],
                "status": r[4],
                "city": r[5]
            })

    return jsonify(result), 200


# ================= ADMIN APPROVE =================
@app.route('/admin/approve/<int:request_id>', methods=['PUT'])
def approve_request(request_id):
    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE blood_requests SET status='Approved' WHERE id=%s", (request_id,))
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": "Request approved"}), 200


# ================= ADMIN REJECT =================
@app.route('/admin/reject/<int:request_id>', methods=['PUT'])
def reject_request(request_id):
    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE blood_requests SET status='Rejected' WHERE id=%s", (request_id,))
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": "Request rejected"}), 200


# ================= HOSPITAL PROFILE UPDATE =================
@app.route('/hospital/profile/<int:user_id>', methods=['PUT'])
def update_hospital_profile(user_id):
    data = request.get_json(force=True)
    hospital_name = data.get("hospital_name")
    phone = data.get("phone")
    city = data.get("city")
    address = data.get("address")

    cursor = mysql.connection.cursor()

    cursor.execute("SELECT id FROM hospitals WHERE user_id=%s", (user_id,))
    hospital = cursor.fetchone()

    if hospital:
        cursor.execute("""
            UPDATE hospitals
            SET hospital_name=%s, phone=%s, city=%s, address=%s
            WHERE user_id=%s
        """, (hospital_name, phone, city, address, user_id))
    else:
        cursor.execute("""
            INSERT INTO hospitals (user_id, hospital_name, phone, city, address)
            VALUES (%s,%s,%s,%s,%s)
        """, (user_id, hospital_name, phone, city, address))

    # Update location in users table
    if "latitude" in data and "longitude" in data:
        cursor.execute("""
            UPDATE users SET latitude=%s, longitude=%s WHERE id=%s
        """, (data.get("latitude"), data.get("longitude"), user_id))

    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Hospital profile saved successfully"}), 200


# ================= VIEW REQUESTS FOR HOSPITAL =================
@app.route('/hospital/requests/<int:user_id>', methods=['GET'])
def view_hospital_requests(user_id):
    cursor = mysql.connection.cursor()

    cursor.execute("SELECT city FROM hospitals WHERE user_id=%s", (user_id,))
    hospital = cursor.fetchone()

    if not hospital:
        cursor.close()
        return jsonify({"error": "Hospital not found"}), 404

    city = hospital['city'] if isinstance(hospital, dict) else hospital[0]

    cursor.execute("""
        SELECT id, blood_group, units_required, urgency_level, status, city, created_at
        FROM blood_requests
        WHERE city=%s
        ORDER BY created_at DESC
    """, (city,))

    requests = cursor.fetchall()
    cursor.close()

    request_list = []
    for r in requests:
        if isinstance(r, dict):
            request_list.append({
                "request_id": r['id'],
                "blood_group": r['blood_group'],
                "units_required": r['units_required'],
                "urgency_level": r['urgency_level'],
                "status": r['status'],
                "city": r['city'],
                "created_at": str(r['created_at']) if r['created_at'] else None
            })
        else:
            request_list.append({
                "request_id": r[0],
                "blood_group": r[1],
                "units_required": r[2],
                "urgency_level": r[3],
                "status": r[4],
                "city": r[5],
                "created_at": str(r[6]) if r[6] else None
            })

    return jsonify(request_list), 200


# ================= CHAT =================
def generate_chat_id(user1: int, user2: int) -> str:
    return f"{min(user1, user2)}_{max(user1, user2)}"


@app.route("/chat/send", methods=["POST"])
def send_message():
    data = request.get_json(force=True)
    sender_id = int(data["sender_id"])
    receiver_id = int(data["receiver_id"])
    message = str(data["message"]).strip()

    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400

    chat_id = generate_chat_id(sender_id, receiver_id)

    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO chat_messages (chat_id, sender_id, receiver_id, message) VALUES (%s,%s,%s,%s)",
        (chat_id, sender_id, receiver_id, message)
    )
    mysql.connection.commit()
    cur.close()

    return jsonify({"status": "Message sent", "chat_id": chat_id}), 201


@app.route("/chat/history", methods=["GET"])
def chat_history():
    try:
        user1 = request.args.get("user1")
        user2 = request.args.get("user2")

        if not user1 or not user2:
            return jsonify({"error": "Missing user1 or user2"}), 400

        user1 = int(user1)
        user2 = int(user2)
        chat_id = generate_chat_id(user1, user2)

        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT id, chat_id, sender_id, receiver_id, message, created_at
            FROM chat_messages
            WHERE chat_id=%s
            ORDER BY created_at ASC
        """, (chat_id,))
        rows = cur.fetchall()
        cur.close()

        # Convert tuples/rows to JSON-serializable dictionaries
        result = []
        for row in rows:
            # Ensure message_dict is always properly formatted for JSON
            message_dict = {
                "id": row[0] if isinstance(row, (tuple, list)) else row.get("id"),
                "chat_id": row[1] if isinstance(row, (tuple, list)) else row.get("chat_id"),
                "sender_id": row[2] if isinstance(row, (tuple, list)) else row.get("sender_id"),
                "receiver_id": row[3] if isinstance(row, (tuple, list)) else row.get("receiver_id"),
                "message": row[4] if isinstance(row, (tuple, list)) else row.get("message"),
                "created_at": (row[5].strftime("%a, %d %b %Y %H:%M:%S %Z") if hasattr(row[5], 'strftime') else str(row[5])) if isinstance(row, (tuple, list)) else (row.get("created_at").strftime("%a, %d %b %Y %H:%M:%S %Z") if hasattr(row.get("created_at"), 'strftime') else str(row.get("created_at")))
            }
            result.append(message_dict)

        return jsonify(result)

    except Exception as e:
        print("chat_history error:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/users/donors", methods=["GET"])
def donors_list():
    cur = mysql.connection.cursor(DictCursor)
    cur.execute("SELECT id, name, email, role, created_at FROM users WHERE role='donor' ORDER BY id DESC")
    rows = cur.fetchall()
    cur.close()
    return jsonify(rows), 200


@app.route("/users/patients", methods=["GET"])
def patients_list():
    cur = mysql.connection.cursor(DictCursor)
    cur.execute("SELECT id, name, email, role, created_at FROM users WHERE role='patient' ORDER BY id DESC")
    rows = cur.fetchall()
    cur.close()
    return jsonify(rows), 200


@app.route("/chat/inbox", methods=["GET"])
def chat_inbox():
    user_id = int(request.args.get("user_id", 0))
    if user_id <= 0:
        return jsonify({"error": "user_id required"}), 400

    cur = mysql.connection.cursor(DictCursor)
    cur.execute("""
        SELECT m.*
        FROM chat_messages m
        JOIN (
            SELECT chat_id, MAX(created_at) AS last_time
            FROM chat_messages
            WHERE sender_id=%s OR receiver_id=%s
            GROUP BY chat_id
        ) t
        ON m.chat_id=t.chat_id AND m.created_at=t.last_time
        ORDER BY m.created_at DESC
    """, (user_id, user_id))

    last_rows = cur.fetchall()
    result = []

    for r in last_rows:
        other_id = r["receiver_id"] if r["sender_id"] == user_id else r["sender_id"]

        # Get other user details
        cur.execute("SELECT id, name, email, role FROM users WHERE id=%s", (other_id,))
        other = cur.fetchone()

        # Get unread count
        cur.execute("""
            SELECT COUNT(*) AS unread
            FROM chat_messages
            WHERE receiver_id=%s AND sender_id=%s AND is_read=0
        """, (user_id, other_id))
        unread_row = cur.fetchone()
        unread = unread_row["unread"] if unread_row else 0

        result.append({
            "chat_id": r["chat_id"],
            "last_message": r["message"],
            "last_time": str(r["created_at"]),
            "unread_count": unread,
            "other_user": other
        })

    cur.close()
    return jsonify(result), 200


@app.route("/chat/mark_read", methods=["POST"])
def mark_read():
    data = request.get_json(force=True)
    sender_id = int(data.get("sender_id", 0))    # The person who sent the messages
    receiver_id = int(data.get("receiver_id", 0)) # Me

    if sender_id <= 0 or receiver_id <= 0:
        return jsonify({"error": "sender_id and receiver_id required"}), 400

    chat_id = generate_chat_id(sender_id, receiver_id)

    cur = mysql.connection.cursor()
    cur.execute("""
        UPDATE chat_messages
        SET is_read=1
        WHERE chat_id=%s AND sender_id=%s AND receiver_id=%s AND is_read=0
    """, (chat_id, sender_id, receiver_id))
    mysql.connection.commit()
    updated = cur.rowcount
    cur.close()

    return jsonify({"status": "ok", "updated": updated}), 200


# ================= NEARBY DONORS =================
@app.route("/donors/nearby", methods=["GET"])
def donors_nearby():
    try:
        data = request.args
        blood_group = data.get("blood_group", "").strip()
        lat_str = data.get("lat")
        lng_str = data.get("lng")
        radius = float(data.get("radius_km", data.get("radius", 10)))

        if not blood_group or not lat_str or not lng_str:
            print(f"DEBUG /donors/nearby FAILED: Missing params - blood_group={blood_group}, lat={lat_str}, lng={lng_str}")
            return jsonify({"error": "Missing blood_group/lat/lng"}), 400

        lat = float(lat_str)
        lng = float(lng_str)

        cur = mysql.connection.cursor(DictCursor)

        blood_filter = ""
        params_inner = [lat, lat, lng]

        if blood_group.lower() != "all":
            blood_filter = " AND REPLACE(LOWER(d.blood_group), ' ', '') = REPLACE(LOWER(%s), ' ', '')"
            params_inner.append(blood_group)

        query = f"""
            SELECT * FROM (
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
                  AND d.is_eligible = 1
                  AND d.is_available = 1
                  AND u.latitude IS NOT NULL
                  AND u.longitude IS NOT NULL
                  {blood_filter}
            ) AS sub
            WHERE sub.distance_km <= %s
            ORDER BY sub.distance_km ASC
            LIMIT 50
        """
        params_inner.append(radius)

        print(f"DEBUG /donors/nearby CALLED - lat={lat}, lng={lng}, blood_group='{blood_group}', radius={radius}")

        cur.execute(query, tuple(params_inner))
        rows = cur.fetchall()
        cur.close()

        print(f"DEBUG /donors/nearby FOUND ROWS: {len(rows)}")

        donors = []
        for r in rows:
            donors.append({
                "donor_user_id": r['id'],
                "name": r['name'],
                "phone": r['phone'],
                "blood_group": r['blood_group'],
                "city": r['city'],
                "latitude": float(r['latitude']),
                "longitude": float(r['longitude']),
                "distance_km": float(r['distance_km']) if r['distance_km'] is not None else None
            })

        return jsonify(donors), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= PATIENT SEND REQUEST =================
@app.route('/patient/send_request', methods=['POST'])
def send_request():
    data = request.get_json(silent=True)
    print("Patient request body received:", data)

    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    patient_id = data.get("patient_id")
    donor_id = data.get("donor_id")
    blood_group = str(data.get("blood_group", "")).strip().upper()
    units_required = data.get("units_required")
    urgency_level = str(data.get("urgency_level", "")).strip().upper()
    city = str(data.get("city", "")).strip()

    # required fields
    if patient_id in [None, ""]:
        return jsonify({"error": "patient_id is required"}), 400
    if donor_id in [None, ""]:
        return jsonify({"error": "donor_id is required"}), 400
    if not blood_group:
        return jsonify({"error": "blood_group is required"}), 400
    if units_required in [None, ""]:
        return jsonify({"error": "units_required is required"}), 400
    if not urgency_level:
        return jsonify({"error": "urgency_level is required"}), 400
    if not city:
        return jsonify({"error": "city is required"}), 400

    try:
        patient_id = int(patient_id)
        donor_id = int(donor_id)
    except Exception:
        return jsonify({"error": "IDs must be a number"}), 400

    try:
        units_required = int(units_required)
    except Exception:
        return jsonify({"error": "units_required must be a number"}), 400

    allowed_urgency = ["LOW", "MEDIUM", "NORMAL", "HIGH", "EMERGENCY"]
    if urgency_level not in allowed_urgency:
        return jsonify({"error": f"Invalid urgency_level. Allowed: {', '.join(allowed_urgency)}"}), 400

    cursor = None
    try:
        # Use common configuration or explicit class
        cursor = mysql.connection.cursor(DictCursor)

        # 1. Fetch patient details for blood_requests
        cursor.execute("""
            SELECT u.name as patient_name, p.hospital_name, p.city, u.role
            FROM patients p 
            JOIN users u ON u.id = p.user_id
            WHERE p.user_id = %s
        """, (patient_id,))
        p_data = cursor.fetchone()

        if not p_data:
            cursor.close()
            return jsonify({"error": f"Patient profile not found for ID {patient_id}. Please complete setup."}), 400
        
        if p_data["role"].lower() != "patient":
            cursor.close()
            return jsonify({"error": f"User ID {patient_id} is not registered as a patient."}), 400

        # 2. check donor exists
        cursor.execute("SELECT id, role FROM users WHERE id=%s", (donor_id,))
        d_user = cursor.fetchone()

        if not d_user:
            cursor.close()
            return jsonify({"error": f"donor_id {donor_id} not found"}), 400

        if d_user["role"].lower() != "donor":
            cursor.close()
            return jsonify({"error": f"User ID {donor_id} is not registered as a donor."}), 400

        # Insert into blood_requests for full tracking support
        cursor.execute("""
            INSERT INTO blood_requests 
            (patient_id, donor_id, patient_name, blood_group, units_required, hospital_name, city, urgency_level, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            patient_id,
            donor_id,
            p_data["patient_name"],
            blood_group,
            units_required,
            p_data["hospital_name"],
            p_data["city"],
            urgency_level,
            "PENDING" 
        ))
        
        # Also insert into legacy donor_requests for compatibility
        cursor.execute("""
            INSERT INTO donor_requests
            (patient_id, donor_id, blood_group, units_needed, urgency, message, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            patient_id,
            donor_id,
            blood_group,
            units_required,
            urgency_level,
            "Direct Request from Map",
            "PENDING"
        ))

        mysql.connection.commit()
        request_id = cursor.lastrowid
        cursor.close()

        return jsonify({
            "message": "Direct blood request sent successfully",
            "request_id": request_id
        }), 201

    except Exception as e:
        if mysql and mysql.connection:
            mysql.connection.rollback()
        if cursor: 
            try: cursor.close()
            except: pass
        return jsonify({"error": str(e)}), 500


@app.route("/donor/requests", methods=["GET"])
def donor_requests_list():
    donor_id = request.args.get("donor_id")
    if not donor_id:
        return jsonify({"error": "Missing donor_id"}), 400

    donor_id = int(donor_id)

    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT id, patient_id, donor_id, blood_group, units_needed, urgency, message, status, created_at
        FROM donor_requests
        WHERE donor_id=%s
        ORDER BY created_at DESC
    """, (donor_id,))
    rows = cur.fetchall()
    cur.close()

    result = []
    for r in rows:
        if isinstance(r, dict):
             result.append({
                "id": r['id'],
                "patient_id": r['patient_id'],
                "donor_id": r['donor_id'],
                "blood_group": r['blood_group'],
                "units_needed": r['units_needed'],
                "urgency": r['urgency'],
                "message": r['message'],
                "status": r['status'],
                "created_at": r['created_at'].strftime("%Y-%m-%d %H:%M:%S") if r['created_at'] else None
            })
        else:
            result.append({
                "id": r[0],
                "patient_id": r[1],
                "donor_id": r[2],
                "blood_group": r[3],
                "units_needed": r[4],
                "urgency": r[5],
                "message": r[6],
                "status": r[7],
                "created_at": r[8].strftime("%Y-%m-%d %H:%M:%S") if r[8] else None
            })

    return jsonify(result), 200


@app.route('/donor/request/update', methods=['PUT'])
def donor_request_update():
    data = request.get_json(silent=True)
    print("Request update body received:", data)

    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    request_id = data.get("request_id")
    status = str(data.get("status", "")).strip().upper()

    if request_id in [None, ""]:
        return jsonify({"error": "request_id is required"}), 400

    try:
        request_id = int(request_id)
    except Exception:
        return jsonify({"error": "request_id must be a number"}), 400

    allowed_status = ["ACCEPTED", "REJECTED", "SCHEDULED", "CONFIRMED"]
    if status not in allowed_status:
        return jsonify({"error": f"Invalid status. Allowed: {', '.join(allowed_status)}"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id FROM blood_requests WHERE id=%s", (request_id,))
    row = cursor.fetchone()

    if not row:
        cursor.close()
        return jsonify({"error": f"request_id {request_id} not found"}), 400

    cursor.execute(
        "UPDATE blood_requests SET status=%s WHERE id=%s",
        (status, request_id)
    )
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Request updated successfully"}), 200


# ================= LOCATION TRACKING =================
@app.route("/update_location", methods=["POST"])
def update_location():
    try:
        data = request.get_json(force=True)
        user_id = data.get("user_id")
        lat = data.get("lat", data.get("latitude"))
        lng = data.get("lng", data.get("longitude"))

        if user_id is None or lat is None or lng is None:
            return jsonify({"error": "Missing user_id, lat/latitude, or lng/longitude"}), 400

        cur = mysql.connection.cursor()
        cur.execute("UPDATE users SET latitude=%s, longitude=%s WHERE id=%s", (lat, lng, user_id))
        mysql.connection.commit()
        cur.close()

        return jsonify({"message": "Location updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= GET USER LOCATION =================
@app.route("/user/location/<int:user_id>", methods=["GET"])
def get_user_location(user_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT latitude, longitude FROM users WHERE id=%s", (user_id,))
        row = cur.fetchone()
        cur.close()
        if not row:
            return jsonify({"error": "User not found"}), 404
        is_dict = isinstance(row, dict)
        lat = row['latitude'] if is_dict else row[0]
        lng = row['longitude'] if is_dict else row[1]
        return jsonify({"latitude": float(lat) if lat else None, "longitude": float(lng) if lng else None}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/donor/requests/nearby", methods=["GET"])
@app.route("/blood-requests/nearby", methods=["GET"])
def donor_requests_nearby():
    try:
        lat_str = request.args.get("lat") or request.args.get("latitude")
        lng_str = request.args.get("lng") or request.args.get("longitude")
        radius = float(request.args.get("radius_km", request.args.get("radius", 10)))
        
        if not lat_str or not lng_str:
            return jsonify({"error": "Missing coordinates (lat/latitude or lng/longitude)"}), 400

        lat = float(lat_str)
        lng = float(lng_str)

        cur = mysql.connection.cursor(DictCursor)
        
        query = """
            SELECT * FROM (
                SELECT 
                    br.id, br.blood_group, br.units_required, br.urgency_level, br.status, br.city,
                    br.hospital_name, br.patient_name, br.patient_id, u.latitude, u.longitude,
                    (6371 * 2 * ASIN(SQRT(
                        GREATEST(0, POWER(SIN((RADIANS(u.latitude - %s)) / 2), 2) +
                        COS(RADIANS(%s)) * COS(RADIANS(u.latitude)) *
                        POWER(SIN((RADIANS(u.longitude - %s)) / 2), 2))
                    ))) AS distance_km
                FROM blood_requests br
                JOIN patients p ON p.user_id = br.patient_id
                JOIN users u ON u.id = p.user_id
                WHERE u.latitude IS NOT NULL 
                  AND u.longitude IS NOT NULL
                  AND UPPER(br.status) IN ('PENDING', 'APPROVED', 'URGENT')
            ) AS requests_sub
            WHERE distance_km <= %s
            ORDER BY distance_km ASC
            LIMIT 50
        """
        params = [lat, lat, lng, radius]

        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        cur.close()

        # Convert to response list
        result = []
        for r in rows:
            # Handle both Dict and Tuple results
            is_dict = isinstance(r, dict)
            result.append({
                "id": r['id'] if is_dict else r[0],
                "blood_group": r['blood_group'] if is_dict else r[1],
                "units_required": r['units_required'] if is_dict else r[2],
                "urgency_level": r['urgency_level'] if is_dict else r[3],
                "status": r['status'] if is_dict else r[4],
                "city": r['city'] if is_dict else r[5],
                "hospital_name": r['hospital_name'] if is_dict else r[6],
                "patient_name": r['patient_name'] if is_dict else r[7],
                "patient_id": r['patient_id'] if is_dict else r[8],
                "latitude": float(r['latitude']) if is_dict else float(r[9]),
                "longitude": float(r['longitude']) if is_dict else float(r[10]),
                "distance_km": float(r['distance_km']) if is_dict else float(r[11]),
                "location": f"{round(r['distance_km'], 1)} km away" if is_dict else f"{round(r[11], 1)} km away"
            })

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/patients/nearby", methods=["GET"])
def patients_nearby():
    try:
        lat_str = request.args.get("lat") or request.args.get("latitude")
        lng_str = request.args.get("lng") or request.args.get("longitude")
        radius = float(request.args.get("radius_km", 10))
        blood_group = request.args.get("blood_group") # Optional filter

        cur = mysql.connection.cursor(DictCursor)
        
        if not lat_str or not lng_str:
            return jsonify({"error": "Missing coordinates (lat/latitude or lng/longitude)"}), 400

        lat = float(lat_str)
        lng = float(lng_str)
        
        query = """
            SELECT 
                u.id, u.name, p.phone, p.blood_group, p.hospital_name, u.latitude, u.longitude,
                (6371 * 2 * ASIN(SQRT(
                    GREATEST(0, POWER(SIN((RADIANS(u.latitude - %s)) / 2), 2) +
                    COS(RADIANS(%s)) * COS(RADIANS(u.latitude)) *
                    POWER(SIN((RADIANS(u.longitude - %s)) / 2), 2))
                ))) AS distance_km
            FROM users u
            JOIN patients p ON p.user_id = u.id
            WHERE u.role = 'patient'
              AND u.latitude IS NOT NULL 
              AND u.longitude IS NOT NULL
              AND u.latitude != 0
        """
        params = [lat, lat, lng]

        if blood_group:
            query += " AND LOWER(p.blood_group) = LOWER(%s)"
            params.append(blood_group)

        query += " HAVING distance_km <= %s ORDER BY distance_km ASC LIMIT 50"
        params.append(radius)

        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        cur.close()

        result = []
        for r in rows:
            is_dict = isinstance(r, dict)
            result.append({
                "id": r['id'] if is_dict else r[0],
                "name": r['name'] if is_dict else r[1],
                "phone": r['phone'] if is_dict else r[2],
                "blood_group": r['blood_group'] if is_dict else r[3],
                "hospital_name": r['hospital_name'] if is_dict else r[4],
                "latitude": float(r['latitude']) if is_dict else float(r[5]),
                "longitude": float(r['longitude']) if is_dict else float(r[6]),
                "distance_km": float(r['distance_km']) if is_dict else float(r[7])
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= ROOT =================
@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "status": "LifeFlow API is running",
        "routes": {
            "POST": [
                "/signup",
                "/register",
                "/login",
                "/send-otp",
                "/verify-otp",
                "/chat/send",
                "/patient/send_request",
                "/donor/donations/add",
                "/reset-password",
                "/update_location"
            ],
            "PUT": [
                "/forgot-password",
                "/donor/availability/<user_id>",
                "/donor/profile/<user_id>",
                "/patient/profile/<user_id>",
                "/hospital/profile/<user_id>",
                "/admin/approve/<request_id>",
                "/admin/reject/<request_id>",
                "/donor/request/update"
            ],
            "GET": [
                "/",
                "/chat/history?user1=1&user2=2",
                "/chat/inbox?user_id=1",
                "/users/donors",
                "/users/patients",
                "/donor/donations/history?donor_id=1",
                "/donor/requests?donor_id=1",
                "/donor/requests/nearby",
                "/patients/nearby",
                "/patient/profile/<user_id>",
                "/patient/tracking/<user_id>"
            ]
        }
    }), 200


# ================= CHAT SYSTEM =================
@app.route('/chat/send', methods=['POST'])
def send_chat_message():
    try:
        data = request.get_json(force=True)
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        message = data.get('message')

        if not all([sender_id, receiver_id, message]):
            return jsonify({"error": "Missing fields"}), 400

        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO messages (sender_id, receiver_id, message)
            VALUES (%s, %s, %s)
        """, (sender_id, receiver_id, message))
        mysql.connection.commit()
        cur.close()

        return jsonify({"message": "Sent successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/chat/inbox', methods=['GET'])
def get_chat_inbox():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        cur = mysql.connection.cursor(DictCursor)
        # Fetch unique users chatted with
        query = """
            SELECT 
                u.id as other_user_id, 
                u.name as name,
                m.message as last_message,
                m.created_at as last_time
            FROM messages m
            JOIN users u ON (u.id = m.sender_id OR u.id = m.receiver_id)
            WHERE (m.sender_id = %s OR m.receiver_id = %s)
              AND u.id != %s
              AND m.id IN (
                  SELECT MAX(id) FROM messages 
                  WHERE sender_id = %s OR receiver_id = %s
                  GROUP BY CASE WHEN sender_id = %s THEN receiver_id ELSE sender_id END
              )
            ORDER BY m.created_at DESC
        """
        cur.execute(query, (user_id, user_id, user_id, user_id, user_id, user_id))
        rows = cur.fetchall()
        cur.close()

        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/chat/history', methods=['GET'])
def get_chat_history():
    try:
        user1 = request.args.get('user1')
        user2 = request.args.get('user2')

        if not user1 or not user2:
            return jsonify({"error": "Missing user IDs"}), 400

        cur = mysql.connection.cursor(DictCursor)
        cur.execute("""
            SELECT * FROM messages 
            WHERE (sender_id = %s AND receiver_id = %s)
               OR (sender_id = %s AND receiver_id = %s)
            ORDER BY created_at ASC
        """, (user1, user2, user2, user1))
        rows = cur.fetchall()
        cur.close()

        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= DONATION HISTORY =================
@app.route('/donor/donations/history', methods=['GET'])
def get_donation_history():
    try:
        donor_id = request.args.get('donor_id')
        if not donor_id:
            return jsonify({"error": "Missing donor_id"}), 400

        cur = mysql.connection.cursor(DictCursor)
        # Fetch donations
        cur.execute("""
            SELECT dh.*, d.blood_group 
            FROM donation_history dh
            JOIN donors d ON d.user_id = dh.donor_id
            WHERE dh.donor_id = %s
            ORDER BY dh.donation_date DESC
        """, (donor_id,))
        rows = cur.fetchall()
        cur.close()

        # Format rows for frontend
        result = []
        for r in rows:
            result.append({
                "id": r['id'],
                "donation_date": r['donation_date'].strftime("%Y-%m-%d") if r['donation_date'] else None,
                "location": r['hospital_name'],
                "units": r['units'],
                "blood_group": r['blood_group'],
                "status": r['status']
            })

        return jsonify({"history": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= APPOINTMENT BOOKING & HISTORY =================
@app.route('/appointment/book', methods=['POST'])
def book_appointment():
    try:
        data = request.get_json(force=True)
        donor_id = data.get('donor_id')
        hospital = data.get('hospital_name')
        units = data.get('units', 1)
        date = data.get('date') # Expected 'YYYY-MM-DD'

        if not donor_id or not hospital:
            return jsonify({"error": "donor_id and hospital_name are required"}), 400

        cur = mysql.connection.cursor()
        
        # 1. Add to donation history
        cur.execute("""
            INSERT INTO donation_history (donor_id, hospital_name, units, donation_date, status)
            VALUES (%s, %s, %s, %s, 'Scheduled')
        """, (donor_id, hospital, units, date))
        
        # 2. Update any pending request to 'Scheduled' if applicable
        # (This is optional but good for consistency)
        cur.execute("""
            UPDATE blood_requests 
            SET status = 'Scheduled' 
            WHERE donor_id = %s AND status = 'Accepted'
            LIMIT 1
        """, (donor_id,))

        mysql.connection.commit()
        cur.close()

        return jsonify({"message": "Appointment booked and stored in history"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= HOSPITALS NEARBY =================
@app.route('/hospitals/nearby', methods=['GET'])
def hospitals_nearby():
    try:
        lat = float(request.args.get('lat', 12.9249))
        lng = float(request.args.get('lng', 80.1))
        radius = float(request.args.get('radius_km', 20))

        # First, try to fetch from DB
        cur = mysql.connection.cursor(DictCursor)
        cur.execute("""
            SELECT h.*, u.latitude, u.longitude 
            FROM hospitals h 
            JOIN users u ON u.id = h.user_id 
            WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL
        """)
        db_hospitals = cur.fetchall()
        cur.close()

        if db_hospitals:
            # Calculate distance and filter
            result = []
            for h in db_hospitals:
                # Basic distance calculation
                dist = abs(float(h['latitude']) - lat) + abs(float(h['longitude']) - lng) # crude
                if dist < 0.5: # Roughly within 50km
                    result.append({
                        "id": h['id'],
                        "name": h['hospital_name'],
                        "address": h['address'],
                        "phone": h['phone'],
                        "latitude": float(h['latitude']),
                        "longitude": float(h['longitude']),
                        "distance": f"{round(dist * 111, 1)} km",
                        "blood_bank": True,
                        "emergency": True
                    })
            if result:
                return jsonify(result), 200

        # If empty, return realistic mock data around the coordinates
        mock_hospitals = [
            {
                "id": 101,
                "name": "General Life Care Center",
                "address": "45 Emergency Rd, Local Circle",
                "phone": "+91 98765 43210",
                "latitude": lat + 0.005,
                "longitude": lng + 0.008,
                "distance": "1.2 km",
                "blood_bank": True,
                "emergency": True
            },
            {
                "id": 102,
                "name": "Saveetha Medical Institute",
                "address": "Thadalam Road, Kanchipuram",
                "phone": "+91 99887 76655",
                "latitude": lat - 0.003,
                "longitude": lng - 0.004,
                "distance": "0.8 km",
                "blood_bank": True,
                "emergency": True
            },
            {
                "id": 103,
                "name": "City Blood & Trauma Center",
                "address": "Main Bazar, Phase 2",
                "phone": "+91 88776 65544",
                "latitude": lat + 0.012,
                "longitude": lng - 0.015,
                "distance": "2.5 km",
                "blood_bank": True,
                "emergency": False
            }
        ]
        return jsonify(mock_hospitals), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= DONOR ACCEPT REQUEST =================
@app.route('/donor/accept_request', methods=['POST'])
def donor_accept_request():
    try:
        data = request.get_json(force=True)
        request_id = data.get('request_id')
        donor_id = data.get('donor_id')

        if not request_id or not donor_id:
            return jsonify({"error": "request_id and donor_id are required"}), 400

        cur = mysql.connection.cursor()
        # Ensure it's still pending
        cur.execute("SELECT status FROM blood_requests WHERE id=%s", (request_id,))
        row = cur.fetchone()
        if not row:
            cur.close()
            return jsonify({"error": "Request not found"}), 404
        
        status = row["status"] if isinstance(row, dict) else row[0]
        if status != "Pending":
             cur.close()
             return jsonify({"error": "Request already accepted or completed"}), 400

        cur.execute("""
            UPDATE blood_requests 
            SET donor_id = %s, status = 'Accepted' 
            WHERE id = %s
        """, (donor_id, request_id))
        
        mysql.connection.commit()
        cur.close()

        return jsonify({"message": "Request accepted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= PATIENT BROADCAST REQUEST =================
@app.route('/patient/request/<int:user_id>', methods=['POST'])
def create_broadcast_request(user_id):
    try:
        data = request.get_json(force=True)
        patient_name = data.get('patient_name', 'Unnamed Patient')
        blood_group = data.get('blood_group')
        units_required = data.get('units_required', 1)
        hospital_name = data.get('hospital_name')
        city = data.get('city')
        contact_number = data.get('contact_number')
        urgency_level = data.get('urgency_level', 'NORMAL')

        if not blood_group or not hospital_name:
            return jsonify({"error": "blood_group and hospital_name are required"}), 400

        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO blood_requests 
            (patient_id, patient_name, blood_group, units_required, hospital_name, city, contact_number, urgency_level, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Pending')
        """, (user_id, patient_name, blood_group, units_required, hospital_name, city, contact_number, urgency_level))
        
        mysql.connection.commit()
        request_id = cur.lastrowid
        cur.close()

        return jsonify({"message": "Emergency request broadcasted", "request_id": request_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= PATIENT TRACKING =================
@app.route("/patient/tracking/<int:user_id>", methods=["GET"])
def patient_tracking(user_id):
    try:
        cur = mysql.connection.cursor(DictCursor)
        
        # 1. Try primary blood_requests table
        cur.execute("""
            SELECT * FROM blood_requests 
            WHERE patient_id = %s
            ORDER BY created_at DESC
            LIMIT 1
        """, (user_id,))
        row = cur.fetchone()
        
        # 2. If not found, try legacy donor_requests table
        if not row:
            cur.execute("""
                SELECT dr.*, p.hospital_name, p.city 
                FROM donor_requests dr
                LEFT JOIN patients p ON p.user_id = dr.patient_id
                WHERE dr.patient_id = %s
                ORDER BY dr.created_at DESC
                LIMIT 1
            """, (user_id,))
            row = cur.fetchone()
            if row:
                # Normalize donor_requests columns to match blood_requests expectation
                row["units_required"] = row.get("units_needed", 1)
                row["patient_name"] = "Patient" # donor_requests doesn't have names
                row["contact_number"] = "Not set"
                row["urgency_level"] = "HIGH"

        if not row:
            cur.close()
            return jsonify(None), 200
            
        status = row["status"].upper()
        
        # Get donor match info
        match_info = None
        if status in ["ACCEPTED", "SCHEDULED", "CONFIRMED"] and row.get("donor_id"):
            cur.execute("""
                SELECT u.name as donor_name, u.latitude as donor_lat, u.longitude as donor_lng 
                FROM users u 
                WHERE u.id = %s
            """, (row["donor_id"],))
            match_info = cur.fetchone()

        # Define stages
        stages = [
            {"id": 1, "title": "Request Initiated", "status": "completed"},
            {"id": 2, "title": "Donor Match", "status": "pending"},
            {"id": 3, "title": "Donor en Route", "status": "pending"},
            {"id": 4, "title": "Donation", "status": "pending"}
        ]
        
        if status == "PENDING":
             stages[1]["status"] = "active"
        elif status in ["ACCEPTED", "SCHEDULED", "CONFIRMED"]:
             stages[1]["status"] = "completed"
             stages[2]["status"] = "active"
        elif status == "COMPLETED":
             stages[1]["status"] = "completed"
             stages[2]["status"] = "completed"
             stages[3]["status"] = "completed"

        cur.close()
        
        return jsonify({
            "request": {
                "id": row.get("id"),
                "request_status": status,
                "patient_name": row.get("patient_name", "Patient"),
                "blood_group": row.get("blood_group"),
                "units_required": row.get("units_required", 1),
                "hospital_name": row.get("hospital_name") or "Hospital",
                "city": row.get("city"),
                "contact": row.get("contact_number"),
                "urgency": row.get("urgency_level", "NORMAL")
            },
            "match": match_info,
            "stages": stages
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= RUN =================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
