import MySQLdb
with MySQLdb.connect(host="localhost", user="root", passwd="", db="lifeflow_db") as cur:
    cur.execute("SHOW CREATE TABLE donor_requests")
    schema = cur.fetchone()[1]
    with open('c:/Users/Admin/OneDrive/Desktop/React/server/schema2.txt', 'w', encoding='utf-8') as f:
        f.write(schema)
