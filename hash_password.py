import bcrypt

def generar_hash_bcrypt():
    # 1. Solicitar la contraseña al usuario
    contrasena_plano = input("Introduce la contraseña a hashear: ")
    
    # 2. Convertir la contraseña a bytes (bcrypt opera con bytes)
    contrasena_bytes = contrasena_plano.encode('utf-8')
    
    # 3. Generar un salt (Bcrypt lo requiere y lo incluye en el hash final)
    # El factor de costo por defecto es 12, lo que lo hace bastante seguro.
    salt = bcrypt.gensalt()
    
    # 4. Generar el hash final
    # El hash resultante incluye el algoritmo, el costo y la salt.
    hash_seguro = bcrypt.hashpw(contrasena_bytes, salt)
    
    # 5. Convertir el hash a una cadena para guardarlo en la base de datos
    hash_str = hash_seguro.decode('utf-8')

    print("-" * 60)
    print(f"✅ HASH compatible con password_verify() generado:")
    print(f"   Contraseña ingresada: {contrasena_plano}")
    print(f"   Hash para guardar en DB: {hash_str}")
    print("-" * 60)
    print("📋 NOTA: Guarda la cadena anterior (completa) en la columna 'password' de tu DB.")
    
    # Opcional: Escribir el hash en un archivo .txt
    nombre_archivo = "hash_pedro.txt"
    try:
        with open(nombre_archivo, 'w') as f:
            f.write(hash_str)
        print(f"   Hash guardado también en: {nombre_archivo}")
    except Exception as e:
        print(f"❌ Error al guardar en archivo: {e}")

if __name__ == "__main__":
    generar_hash_bcrypt()