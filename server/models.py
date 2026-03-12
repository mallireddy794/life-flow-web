from sqlalchemy import Column, Integer, String, DateTime, Boolean, DECIMAL, Text, ForeignKey
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    role = Column(String(50))
    otp = Column(String(10), nullable=True)
    otp_expiry = Column(DateTime, nullable=True)
    latitude = Column(DECIMAL(10, 8), nullable=True)
    longitude = Column(DECIMAL(11, 8), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Donor(Base):
    __tablename__ = "donors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    phone = Column(String(20), nullable=True)
    blood_group = Column(String(5), nullable=True)
    age = Column(Integer, nullable=True)
    city = Column(String(100), nullable=True)
    is_available = Column(Boolean, default=True)
    is_eligible = Column(Boolean, default=True)
    is_eligible_next_date = Column(DateTime, nullable=True)
    last_status_update = Column(DateTime, nullable=True)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    phone = Column(String(20), nullable=True)
    blood_group = Column(String(5), nullable=True)
    hospital_name = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)

class BloodRequest(Base):
    __tablename__ = "blood_requests"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    blood_group = Column(String(5))
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
    blood_group = Column(String(5))
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
    blood_group = Column(String(5))
    units_needed = Column(Integer)
    urgency = Column(String(50))
    message = Column(Text)
    status = Column(String(50), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)
