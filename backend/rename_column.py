import sqlite3
import os

db_url = os.environ.get('DATABASE_URL')
if db_url and db_url.startswith('sqlite:///'):
    db_path = db_url.replace('sqlite:///', '')
else:
    db_path = os.path.join(os.path.dirname(__file__), 'toneleros.db')

conn = sqlite3.connect(db_path)
try:
    conn.execute("ALTER TABLE agenda RENAME COLUMN senal_cobrada TO senal_repartida")
    conn.commit()
    print("Columna renombrada correctamente.")
except Exception as e:
    print("Error:", e)
conn.close()
