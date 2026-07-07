import sqlite3
import os

def migrate_db():
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith('sqlite:///'):
        db_path = db_url.replace('sqlite:///', '')
    else:
        db_path = os.path.join(os.path.dirname(__file__), 'toneleros.db')
    
    if not os.path.exists(db_path):
        print(f"La base de datos no existe en {db_path}. Se creará al iniciar la app.")
        return

    print(f"Conectando a la base de datos en {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if columns exist
        cursor.execute("PRAGMA table_info(agenda)")
        columns = [info[1] for info in cursor.fetchall()]

        if 'senal_cobrada' not in columns:
            print("Añadiendo columna 'senal_cobrada'...")
            cursor.execute("ALTER TABLE agenda ADD COLUMN senal_cobrada BOOLEAN DEFAULT 0")
        else:
            print("La columna 'senal_cobrada' ya existe.")

        if 'cobrador' not in columns:
            print("Añadiendo columna 'cobrador'...")
            cursor.execute("ALTER TABLE agenda ADD COLUMN cobrador VARCHAR(50)")
        else:
            print("La columna 'cobrador' ya existe.")

        conn.commit()
        print("Migración completada con éxito. Los datos están intactos.")

    except Exception as e:
        print(f"Error durante la migración: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_db()
