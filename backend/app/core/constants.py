from enum import Enum

class EventStatus(str, Enum):
    ABIERTO = "abierto"
    CERRADO = "cerrado"
    ARCHIVADO = "archivado"

class EventType(str, Enum):
    BODA = "Boda"
    CONCIERTO = "Concierto"
    EVENTO_CORPORATIVO = "Evento Corporativo"
    CLASE_PRIVADA = "Clase Privada"
    OTRO = "Otro"
