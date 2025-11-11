require('dotenv').config(); // Importo las variables de entorno desde el archivo .env para poder usarlas en la conexión a la base de datos

const mongoose = require("mongoose"); // Importo mongoose para manejar la conexión y esquemas de MongoDB

class dbClient { // Clase que representa el cliente de la base de datos
    constructor(){
        this.conectarBD(); // Llamo al método conectarBD para iniciar la conexión a la base de datos al crear una instancia de dbClient 
    }

    async conectarBD(){  // Método asincrónico para conectar a la base de datos
        try{// Cadena de conexión a la base de datos MongoDB usando variables de entorno almacenadas en un archivo .env
            const queryString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/?retryWrites=true&w=majority`; 
        
            await mongoose.connect(queryString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: process.env.DB_NAME || 'sistema_control_vehiculo' // Agregar nombre de BD
            });

            console.log("Conectado a la base de datos"); // Mensaje de éxito al conectar a la base de datos
        } catch (error) {
            console.error("Error al conectar a la base de datos:", error);
            process.exit(1); // Salir si no puede conectar
        }
    }

    async desconectarBD(){ // Método asincrónico para desconectar de la base de datos
        try {
            await mongoose.disconnect(); // Desconecto de la base de datos usando mongoose
            console.log("Desconectado de la base de datos");
        } catch (e) {
            console.error("Error al desconectar de la base de datos:", e); // Manejo de errores al intentar desconectar
        }
    }

}

module.exports = new dbClient(); // Exporto una nueva instancia de dbClient para que pueda ser utilizada en otras partes de la aplicació