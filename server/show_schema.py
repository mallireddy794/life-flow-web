import MySQLdb
db = MySQLdb.connect(host="localhost", user="root", passwd="", db="lifeflow_db")
cur = db.cursor()
cur.execute("SHOW CREATE TABLE donor_requests")
print(cur.fetchone()[1])
cur.close()
db.close()
