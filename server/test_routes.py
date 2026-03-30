import sys
sys.path.append("c:/Users/Admin/OneDrive/Desktop/React/server")
from app import app
with app.app_context():
    print(app.url_map)
