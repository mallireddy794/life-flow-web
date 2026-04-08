import MySQLdb

try:
    conn = MySQLdb.connect(host="localhost", user="root", password="", db="lifeflow_db")
    cursor = conn.cursor()
    
    print("Migrating donors table...")
    # Add columns to donors table
    try:
        cursor.execute("ALTER TABLE donors ADD COLUMN avg_rating DECIMAL(3, 2) DEFAULT 0.0")
        cursor.execute("ALTER TABLE donors ADD COLUMN sentiment_score DECIMAL(3, 2) DEFAULT 0.0")
        cursor.execute("ALTER TABLE donors ADD COLUMN total_reviews INT DEFAULT 0")
        print("Donors table migrated.")
    except Exception as e:
        if "Duplicate column name" in str(e):
            print("Donors table already has rating columns.")
        else:
            print(f"Error migrating donors table: {e}")

    print("Creating donor_reviews table...")
    # Create donor_reviews table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS donor_reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            donor_id INT,
            patient_id INT,
            rating INT,
            review_text TEXT,
            sentiment_score DECIMAL(3, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (donor_id) REFERENCES users(id),
            FOREIGN KEY (patient_id) REFERENCES users(id)
        )
    """)
    print("donor_reviews table created.")
    
    conn.commit()
    conn.close()
    print("Migration successful.")
except Exception as e:
    print(f"Migration failed: {e}")
