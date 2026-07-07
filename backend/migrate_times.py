import sqlite3
import os
from datetime import datetime, timedelta

def migrate_db():
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith('sqlite:///'):
        db_path = db_url.replace('sqlite:///', '')
    else:
        db_path = os.path.join(os.path.dirname(__file__), 'toneleros.db')
    
    if not os.path.exists(db_path):
        print(f"La base de datos no existe en {db_path}.")
        return

    print(f"Conectando a la base de datos en {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute("PRAGMA table_info(agenda)")
        columns = [info[1] for info in cursor.fetchall()]

        if 'hora_comienzo' not in columns:
            print("Añadiendo columna 'hora_comienzo'...")
            cursor.execute("ALTER TABLE agenda ADD COLUMN hora_comienzo VARCHAR(5) DEFAULT '00:00'")
        
        if 'hora_llegada' not in columns:
            print("Añadiendo columna 'hora_llegada'...")
            cursor.execute("ALTER TABLE agenda ADD COLUMN hora_llegada VARCHAR(5) DEFAULT '00:00'")
            
        # Process existing rows
        cursor.execute("SELECT id, fecha FROM agenda")
        rows = cursor.fetchall()
        
        for row_id, fecha_val in rows:
            if not fecha_val:
                continue
                
            try:
                # Tratar de parsear como datetime completo YYYY-MM-DD HH:MM:SS
                dt = datetime.strptime(str(fecha_val).split('.')[0], "%Y-%m-%d %H:%M:%S")
                date_str = dt.strftime("%Y-%m-%d")
                hora_comienzo_str = dt.strftime("%H:%M")
                
                # Calcular hora_llegada restando 45 min
                hora_llegada_dt = dt - timedelta(minutes=45)
                hora_llegada_str = hora_llegada_dt.strftime("%H:%M")
                
                cursor.execute("""
                    UPDATE agenda 
                    SET fecha = ?, hora_comienzo = ?, hora_llegada = ?
                    WHERE id = ?
                """, (date_str, hora_comienzo_str, hora_llegada_str, row_id))
            except ValueError:
                # Si falla el parseo, tal vez ya esté migrado o en otro formato
                # Intentar parsear solo fecha YYYY-MM-DD
                try:
                    dt = datetime.strptime(str(fecha_val).split(' ')[0], "%Y-%m-%d")
                    # No actualizamos horas, se quedan en '00:00' o el valor por defecto
                except ValueError:
                    print(f"No se pudo parsear la fecha: {fecha_val} para ID {row_id}")

        conn.commit()
        print("Migración completada con éxito.")

    except Exception as e:
        print(f"Error durante la migración: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_db()
