import json
import os
import sys
from datetime import datetime

# Añadir el directorio actual al path para que encuentre el módulo 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.event import Event
from app.core.security import get_password_hash

def init_db():
    print("🚀 Iniciando proceso de inicialización de Base de Datos...")
    # Crear tablas si no existen
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Crear usuarios de prueba
        create_users(db)
        
        # 2. Importar datos históricos
        import_legacy_data(db)
        
        db.commit()
        print("✅ PROCESO COMPLETADO: Base de datos lista.")
    except Exception as e:
        db.rollback()
        print(f"❌ ERROR CRÍTICO: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def create_users(db: Session):
    users = [
        {"email": "pedro@toneleros.com", "password": "Pedro123?", "full_name": "Pedro", "is_admin": False},
        {"email": "admin@toneleros.com", "password": "Admin123?", "full_name": "Admin", "is_admin": True}
    ]
    for u in users:
        user = db.query(User).filter(User.email == u["email"]).first()
        if not user:
            new_user = User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                is_admin=u["is_admin"]
            )
            db.add(new_user)
            print(f"👤 Usuario creado: {u['email']}")

def import_legacy_data(db: Session):
    json_path = "u186974271_TONELEROS.json"
    if not os.path.exists(json_path):
        print(f"⚠️ Archivo {json_path} no encontrado. Saltando migración.")
        return

    # Verificar si ya hay datos (para evitar duplicados)
    count = db.query(Event).count()
    if count > 0:
        print(f"ℹ️ Ya existen {count} eventos. No se importará el JSON para evitar duplicados.")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
            
        events_data = []
        for item in raw_data:
            if item.get("type") == "table" and item.get("name") == "agenda":
                events_data = item.get("data", [])
                break
        
        if not events_data:
            print("⚠️ No se encontraron datos de la tabla 'agenda' en el JSON.")
            return

        print(f"📂 Migrando {len(events_data)} eventos...")
        for item in events_data:
            try:
                # Limpieza de datos
                presupuesto = int(float(item.get("presupuesto", 0) or 0))
                senal = int(float(item.get("senal", 0) or 0))
                raw_tlf = str(item.get("tlf", "0")).replace(" ", "").replace(".", "")
                tlf = int(raw_tlf) if raw_tlf.isdigit() else 0
                
                fecha_str = item.get("fecha")
                fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d %H:%M:%S")
                
                new_event = Event(
                    tipo=item.get("tipo") or "General",
                    fecha=fecha_obj,
                    direccion=item.get("direccion") or "Sin dirección",
                    pContacto=item.get("pContacto") or "Sin contacto",
                    tlf=tlf,
                    presupuesto=presupuesto,
                    senal=senal,
                    observaciones=item.get("observaciones") or "",
                    equipo=(item.get("equipo") == "1"),
                    archivado=(item.get("archivado") == "1"),
                    estado="CONFIRMADO" if item.get("cerrada") == "1" else "NEGOCIACION"
                )
                db.add(new_event)
            except Exception as e:
                print(f"❌ Error en registro ID {item.get('id')}: {e}")
                continue
                
        print(f"✅ ÉXITO: {len(events_data)} eventos históricos migrados.")
    except Exception as e:
        print(f"❌ Error al procesar el JSON: {e}")

if __name__ == "__main__":
    init_db()
