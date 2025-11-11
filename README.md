# Sistema de Control de Vehículos

## Descripción
Sistema para gestión de turnos y chequeos técnicos de vehículos desarrollado con Node.js, Express y MongoDB.

## Características
- Gestión de usuarios (Dueños, Técnicos, Administradores)
- Registro de vehículos
- Sistema de turnos para revisiones técnicas
- Chequeos técnicos con puntuación automática
- API RESTful completa
- Tests unitarios y de integración

## Tecnologías
- **Backend:** 
1. Node.js - Entorno de ejecución
2. Express.js - Framework web
3. MongoDB Atlas - Base de datos en la nube
4. Mongoose - ODM para MongoDB

- **Base de datos:** MongoDB con Mongoose

- **Testing:** 
1. Jest - Framework de testing
2. Supertest - Testing de APIs

- **Variables de entorno:**
1. Dotenv - Variables de entorno

### Prerrequisitos
- Node.js (v16 o superior)
- MongoDB (local o Atlas)
- npm

### Ejecuciones
- node app.js (para ejecutar el programa)
- npm test (para ejecutar los test)

### Pasos de instalación
1. **Clonar el repositorio**
```bash
git clone https://github.com/alegarcia5/sistema_control_vehiculo.git
cd sistema_control_vehiculo