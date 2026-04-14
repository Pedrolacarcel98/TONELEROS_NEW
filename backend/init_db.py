import json
import os
import sys
from datetime import datetime
from passlib.context import CryptContext

# Configuración de seguridad local para el script
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# Añadir el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.event import Event

def init_db():
    print("🚀 Iniciando migración de datos histórica...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Usuarios
        create_users(db)
        # 2. Datos JSON
        import_legacy_data(db)
        
        db.commit()
        print("✅ PROCESO COMPLETADO EXITOSAMENTE.")
    except Exception as e:
        db.rollback()
        print(f"❌ ERROR: {e}")
    finally:
        db.close()

def create_users(db: Session):
    users = [
        {"email": "pedro@toneleros.com", "password": "Pedro123?", "full_name": "Pedro", "admin": False},
        {"email": "admin@toneleros.com", "password": "Admin123?", "full_name": "Admin", "admin": True}
    ]
    for u in users:
        user = db.query(User).filter(User.email == u["email"]).first()
        if not user:
            # Ajustar nombres de campos según tu modelo User
            new_user = User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                is_admin=u["admin"]
            )
            db.add(new_user)
            print(f"👤 Usuario creado: {u['email']}")

def import_legacy_data(db: Session):
    json_path = "u186974271_TONELEROS.json"
    if not os.path.exists(json_path):
        print(f"⚠️ {json_path} no encontrado.")
        return

    if db.query(Event).count() > 10: # Si ya hay más de 10, es que ya se migró
        print("ℹ️ Datos ya existentes. Saltando migración.")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
            
        events_data = []
        for item in raw_data:
            if item.get("type") == "table" and item.get("name") == "agenda":
                events_data = item.get("data", [])
                break
        
        if not events_data: return

        print(f"📂 Migrando {len(events_data)} eventos...")
        for item in events_data:
            try:
                # Limpieza robusta
                def clean_int(val):
                    try: return int(float(str(val).replace(" ", "").replace(".", "") or 0))
                    except: return 0

                fecha_obj = datetime.now()
                try:
                    fecha_obj = datetime.strptime(item.get("fecha"), "%Y-%m-%d %H:%M:%S")
                except: pass

                new_event = Event(
                    tipo=item.get("tipo") or "General",
                    fecha=fecha_obj,
                    direccion=item.get("direccion") or "Sin dirección",
                    pContacto=item.get("pContacto") or "Sin contacto",
                    tlf=clean_int(item.get("tlf")),
                    presupuesto=clean_int(item.get("presupuesto")),
                    senal=clean_int(item.get("senal")),
                    observaciones=item.get("observaciones") or "",
                    equipo=(item.get("equipo") == "1"),
                    archivado=(item.get("archivado") == "1"),
                    estado="CONFIRMADO" if item.get("cerrada") == "1" else "NEGOCIACION"
                )
                db.add(new_event)
            except: continue
                
        print(f"✅ ÉXITO: {len(events_data)} eventos históricos migrados.")
    except Exception as e:
        print(f"❌ Error JSON: {e}")

if __name__ == "__main__":
    init_db()
