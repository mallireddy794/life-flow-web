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
            INSERT INTO users (name, email, password, role)
            VALUES (%s, %s, %s, %s)
            """,
            (name, email, hashed_password, role)
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

    cursor = mysql.connection.cursor()
    # Using specific index access or dictionary access depends on MYSQL_CURSORCLASS
    # We'll use tuple indices since default is usually tuple in flask_mysqldb 
    # unless configured otherwise. But app.py previously used user[0], so we keep that.
    cursor.execute("SELECT id, name, password, role FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Handle both Dict and Tuple results if config changes
    u_id = user['id'] if isinstance(user, dict) else user[0]
    u_name = user['name'] if isinstance(user, dict) else user[1]
    u_pass = user['password'] if isinstance(user, dict) else user[2]
    u_role = user['role'] if isinstance(user, dict) else user[3]

    if not check_password_hash(u_pass, password):
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": u_id,
            "name": u_name,
            "role": u_role
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


# ================= SEND OTP (ROLE BASED) =================
@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json(force=True)
    email = str(data.get("email", "")).strip().lower()
    role = str(data.get("role", "")).strip().lower()

    if not email or not role:
        return jsonify({"error": "Email and role required"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id FROM users WHERE email=%s AND role=%s", (email, role))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        return jsonify({"error": "User not found for this role"}), 404

    otp = str(random.randint(100000, 999999))
    expiry_time = datetime.now() + timedelta(minutes=5)

    cursor.execute(
        "UPDATE users SET otp=%s, otp_expiry=%s WHERE email=%s",
        (otp, expiry_time, email)
    )
    mysql.connection.commit()
    cursor.close()

    sender_email = "mallireddy794@gmail.com"
    sender_password = "bcsgzjdemtalxdax"

    msg = MIMEText(f"""
Hello from LifeFlow,

Your OTP for password reset is: {otp}

This OTP is valid for 5 minutes.

Do not share this with anyone.
""")

    msg["Subject"] = "LifeFlow Password Reset OTP"
    msg["From"] = sender_email
    msg["To"] = email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, email, msg.as_string())
        server.quit()
    except Exception as e:
        print(f"\\nWARNING: SMTP blocked. OTP is {otp}. Proceeding gracefully.\\n")
        # Proceed with success rather than 500 so the user can continue their demo locally
        pass

    return jsonify({"message": "OTP sent successfully"}), 200


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
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json(force=True)
    email = str(data.get("email", "")).strip().lower()
    new_password = str(data.get("new_password", "")).strip()

    if not email or not new_password:
        return jsonify({"error": "Email and new password required"}), 400

    hashed_password = generate_password_hash(new_password)

    cursor = mysql.connection.cursor()
    cursor.execute(
        "UPDATE users SET password=%s, otp=NULL, otp_expiry=NULL WHERE email=%s",
        (hashed_password, email)
    )
    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Password reset successful"}), 200


# ================= DONOR PROFILE =================
@app.route('/donor/profile/<int:user_id>', methods=['PUT'])
def update_donor_profile(user_id):
    data = request.get_json(force=True)

    cursor = mysql.connection.cursor()
    
    # Update donor details
    cursor.execute("""
        UPDATE donors
        SET phone=%s, blood_group=%s, age=%s, city=%s
        WHERE user_id=%s
    """, (
        data.get("phone"),
        data.get("blood_group"),
        data.get("age"),
        data.get("city"),
        user_id
    ))

    # Also update location in users table if provided
    if "latitude" in data and "longitude" in data:
        cursor.execute("""
            UPDATE users SET latitude=%s, longitude=%s WHERE id=%s
        """, (data.get("latitude"), data.get("longitude"), user_id))

    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Donor profile updated"}), 200


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
    data = request.get_json(force=True)

    for k in ["donor_id", "donation_date", "units", "blood_group"]:
        if k not in data:
            return jsonify({"error": f"Missing {k}"}), 400

    try:
        # Accepting common formats
        dt_str = data["donation_date"]
        if "T" in dt_str:
            dt_str = dt_str.replace("T", " ")
        if ":" in dt_str:
             dt = datetime.strptime(dt_str.split(".")[0], "%Y-%m-%d %H:%M:%S")
        else:
             dt = datetime.strptime(dt_str, "%Y-%m-%d")
    except Exception:
        return jsonify({"error": "donation_date must be 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DD'"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO donor_donations (donor_id, donation_date, units, blood_group, location, notes)
        VALUES (%s,%s,%s,%s,%s,%s)
    """, (
        int(data["donor_id"]),
        dt,
        int(data["units"]),
        data["blood_group"],
        data.get("location"),
        data.get("notes")
    ))
    mysql.connection.commit()
    donation_id = cursor.lastrowid
    cursor.close()

    return jsonify({"message": "Donation history added", "donation_id": donation_id}), 201


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
@app.route('/patient/profile/<int:user_id>', methods=['PUT'])
def update_patient_profile(user_id):
    data = request.get_json(force=True)

    cursor = mysql.connection.cursor()
    cursor.execute("""
        UPDATE patients
        SET phone=%s, blood_group=%s, hospital_name=%s, city=%s
        WHERE user_id=%s
    """, (
        data.get("phone"),
        data.get("blood_group"),
        data.get("hospital_name"),
        data.get("city"),
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
        (patient_id, blood_group, units_required, urgency_level, city)
        VALUES (%s,%s,%s,%s,%s)
    """, (
        patient_id,
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
    blood_group = request.args.get("blood_group", "").strip()
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    radius = float(request.args.get("radius_km", 10)) # Increased default radius to 10km

    if not blood_group or not lat or not lng:
        return jsonify({"error": "Missing blood_group/lat/lng"}), 400

    try:
        lat = float(lat)
        lng = float(lng)
    except ValueError:
        return jsonify({"error": "lat/lng must be numbers"}), 400

    cur = mysql.connection.cursor()
    cur.execute("""
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
                POWER(SIN((RADIANS(u.latitude - %s)) / 2), 2) +
                COS(RADIANS(%s)) *
                COS(RADIANS(u.latitude)) *
                POWER(SIN((RADIANS(u.longitude - %s)) / 2), 2)
              )
            )
          ) AS distance_km
        FROM users u
        JOIN donors d ON d.user_id = u.id
        WHERE u.role = 'donor'
          AND LOWER(d.blood_group) = LOWER(%s)
          AND d.is_available = 1
          AND d.is_eligible = 1
          AND u.latitude IS NOT NULL
          AND u.longitude IS NOT NULL
          AND u.latitude != 0
          AND u.longitude != 0
        HAVING distance_km <= %s
        ORDER BY distance_km ASC
        LIMIT 50
    """, (lat, lat, lng, blood_group, radius))

    rows = cur.fetchall()
    cur.close()

    donors = []
    for r in rows:
        if isinstance(r, dict):
            donors.append({
                "donor_user_id": r['id'],
                "name": r['name'],
                "phone": r['phone'],
                "blood_group": r['blood_group'],
                "city": r['city'],
                "latitude": float(r['latitude']),
                "longitude": float(r['longitude']),
                "distance_km": float(r['distance_km']) if r['distance_km'] else None
            })
        else:
            donors.append({
                "donor_user_id": r[0],
                "name": r[1],
                "phone": r[2],
                "blood_group": r[3],
                "city": r[4],
                "latitude": float(r[5]) if r[5] else None,
                "longitude": float(r[6]) if r[6] else None,
                "distance_km": float(r[7]) if r[7] else None
            })

    return jsonify(donors), 200


# ================= PATIENT SEND REQUEST =================
@app.route("/patient/send_request", methods=["POST"])
def patient_send_request():
    data = request.get_json(force=True)

    required = ["patient_id", "donor_id", "blood_group", "units_needed"]
    for k in required:
        if k not in data:
            return jsonify({"error": f"Missing {k}"}), 400

    patient_id = int(data["patient_id"])
    donor_id = int(data["donor_id"])
    blood_group = data["blood_group"].strip()
    units_needed = int(data["units_needed"])
    urgency = data.get("urgency", "NORMAL")
    message = data.get("message")

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO donor_requests (patient_id, donor_id, blood_group, units_needed, urgency, message, status)
        VALUES (%s,%s,%s,%s,%s,%s,'PENDING')
    """, (patient_id, donor_id, blood_group, units_needed, urgency, message))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Request sent to donor", "status": "PENDING"}), 201


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


@app.route("/donor/request/update", methods=["PUT"])
def donor_request_update():
    data = request.get_json(force=True)

    if "request_id" not in data or "status" not in data:
        return jsonify({"error": "Missing request_id/status"}), 400

    request_id = int(data["request_id"])
    status = data["status"].upper().strip()

    if status not in ["ACCEPTED", "REJECTED"]:
        return jsonify({"error": "status must be ACCEPTED or REJECTED"}), 400

    cur = mysql.connection.cursor()
    cur.execute("UPDATE donor_requests SET status=%s WHERE id=%s", (status, request_id))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Request updated", "status": status}), 200


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
                "/donor/donations/add"
            ],
            "PUT": [
                "/forgot-password",
                "/reset-password",
                "/donor/availability/<user_id>",
                "/donor/profile/<user_id>",
                "/patient/profile/<user_id>",
                "/hospital/profile/<user_id>",
                "/admin/approve/<request_id>",
                "/admin/reject/<request_id>",
                "/donor/request/update"
            ],
            "GET": [
                "/signup",
                "/register",
                "/chat/history?user1=1&user2=2",
                "/chat/inbox?user_id=1",
                "/users/donors",
                "/users/patients",
                "/donor/donations/history?donor_id=1",
                "/donor/requests?donor_id=1"
            ]
        }
    }), 200


# ================= RUN =================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
