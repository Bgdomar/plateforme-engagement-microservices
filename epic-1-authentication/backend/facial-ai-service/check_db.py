import sqlite3
import json
import os

def check_faces():
    db_path = os.path.join(os.path.dirname(__file__), 'ai_service.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT user_email FROM face_embeddings")
    rows = cursor.fetchall()
    print(f"Total faces registered: {len(rows)}")
    for row in rows:
        print(f" - {row[0]}")
    conn.close()

if __name__ == "__main__":
    check_faces()
