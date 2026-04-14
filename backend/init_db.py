import json
import os
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.event import Event
from app.core.security import get_password_hash

def init_db():
    # Crear tablas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Crear usuarios de prueba si no existen
        create_users(db)
        
        # 2. Importar datos históricos desde JSON
        import_legacy_data(db)
        
        db.commit()
        print("✅ Base de datos inicializada correctamente con datos históricos.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al inicializar la base de datos: {e}")
    finally:
        db.close()

def create_users(db: Session):
    users = [
        {
            "email": "pedro@toneleros.com",
            "password": "Pedro123?",
            "full_name": "Pedro",
            "is_admin": False
        },
        {
            "email": "admin@toneleros.com",
            "password": "Admin123?",
            "full_name": "Administrador",
            "is_admin": True
        }
    ]
    
    for user_data in users:
        user = db.query(User).filter(User.email == user_data["email"]).first()
        if not user:
            new_user = User(
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                full_name=user_data["full_name"],
                is_admin=user_data["is_admin"]
            )
            db.add(new_user)
            print(f"👤 Usuario creado: {user_data['email']}")

def import_legacy_data(db: Session):
    # El archivo JSON debe estar en la raíz del backend
    json_path = "u186974271_TONELEROS.json"
    
    if not os.path.exists(json_path):
        print(f"⚠️ No se encontró el archivo {json_path}. Saltando migración de datos.")
        return

    # Verificar si ya hay eventos para no duplicar
    if db.query(Event).count() > 0:
        print("ℹ️ Ya existen eventos en la base de datos. Saltando importación de JSON.")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
            
        # Buscar la sección de datos en el formato PHPMyAdmin
        events_data = []
        for item in raw_data:
            if item.get("type") == "table" and item.get("name") == "agenda":
                events_data = item.get("data", [])
                break
        
        if not events_data:
            print("⚠️ No se encontraron datos de la tabla 'agenda' en el JSON.")
            return

        print(f"📂 Importando {len(events_data)} eventos históricos...")
        
        for item in events_data:
            # Limpiar y convertir valores numéricos
            try:
                presupuesto = int(float(item.get("presupuesto", 0) or 0))
                senal = int(float(item.get("senal", 0) or 0))
                # Limpiar teléfono (eliminar espacios y caracteres no numéricos)
                raw_tlf = str(item.get("tlf", "0")).replace(" ", "").replace(".", "")
                tlf = int(raw_tlf) if raw_tlf.isdigit() else 0
            except:
                presupuesto = 0
                senal = 0
                tlf = 0

            # Procesar fecha
            try:
                fecha_str = item.get("fecha")
                fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d %H:%M:%S")
            except:
                fecha_obj = datetime.now()

            # Mapear estado
            estado = "CONFIRMADO" if item.get("cerrada") == "1" else "NEGOCIACION"
            
            new_event = Event(
                tipo=item.get("tipo") or "General",
                fecha=fecha_obj,
                direccion=item.get("direccion") or "Sin dirección",
                pContacto=item.get("pContacto") or "Sin contacto",
                tlf=tlf,
                presupuesto=presupuesto,
                senal=senal,
                observaciones=item.get("observaciones") or "",
                equipo=True if item.get("equipo") == "1" else False,
                archivado=True if item.get("archivado") == "1" else False,
                estado=estado
            )
            db.add(new_event)
            
        print(f"✅ Migración completada: {len(events_data)} eventos insertados.")
        
    except Exception as e:
        print(f"❌ Error durante la migración de datos: {e}")

if __name__ == "__main__":
    init_db()
