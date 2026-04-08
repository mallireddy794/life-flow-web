from sqlalchemy import Column, Integer, String, DateTime, Boolean, DECIMAL, Text, ForeignKey
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    full_name = Column(String(255), nullable=True) # Added from user snippet
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(20), nullable=True) # Added from user snippet
    blood_group = Column(String(10), nullable=True) # Added from user snippet
    password = Column(String(255))
    role = Column(String(50))
    otp = Column(String(10), nullable=True)
    otp_expiry = Column(DateTime, nullable=True)
    available_to_donate = Column(Boolean, default=False) # Added from user snippet
    latitude = Column(DECIMAL(10, 8), nullable=True)
    longitude = Column(DECIMAL(11, 8), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Donor(Base):
    __tablename__ = "donors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    phone = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    age = Column(Integer, nullable=True)
    city = Column(String(100), nullable=True)
    is_available = Column(Boolean, default=True)
    is_eligible = Column(Boolean, default=True)
    is_eligible_next_date = Column(DateTime, nullable=True) # Added
    last_donation_date = Column(DateTime, nullable=True)
    last_status_update = Column(DateTime, nullable=True)
    past_acceptance_rate = Column(DECIMAL(4, 2), default=0.80) # Added
    response_time_avg = Column(Integer, default=5) # Added
    donor_active_status = Column(Integer, default=1) # Added
    avg_rating = Column(DECIMAL(3, 2), default=0.0)
    sentiment_score = Column(DECIMAL(3, 2), default=0.0)
    total_reviews = Column(Integer, default=0)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    phone = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    hospital_name = Column(String(255), nullable=True)
    units_needed = Column(Integer, default=0)
    city = Column(String(100), nullable=True)

class BloodRequest(Base):
    __tablename__ = "blood_requests"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    patient_name = Column(String(255), nullable=True)
    hospital_name = Column(String(255), nullable=True)
    contact_number = Column(String(20), nullable=True)
    blood_group = Column(String(10))
    units_required = Column(Integer)
    urgency_level = Column(String(50))
    status = Column(String(50), default="Pending")
    city = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

class DonorDonation(Base):
    __tablename__ = "donor_donations"
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer) # This models the donor table or user table? app.py says user_id
    donation_date = Column(DateTime)
    units = Column(Integer)
    blood_group = Column(String(10))
    location = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    hospital_name = Column(String(255))
    phone = Column(String(20))
    city = Column(String(100))
    address = Column(Text)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(String(100))
    sender_id = Column(Integer)
    receiver_id = Column(Integer)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class DonorRequest(Base):
    __tablename__ = "donor_requests"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer)
    donor_id = Column(Integer)
    blood_group = Column(String(10))
    units_needed = Column(Integer)
    urgency = Column(String(50))
    message = Column(Text)
    status = Column(String(50), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

class DonorReview(Base):
    __tablename__ = "donor_reviews"
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"))
    patient_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)
    review_text = Column(Text)
    sentiment_score = Column(DECIMAL(3, 2))
    created_at = Column(DateTime, default=datetime.utcnow)
