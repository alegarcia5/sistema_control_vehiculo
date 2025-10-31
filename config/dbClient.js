import 'dotenv/config'; // Importo las variables de entorno desde el archivo .env para poder usarlas en la conexión a la base de datos

import mongoose from "mongoose"; // Importo mongoose para manejar la conexión y esquemas de MongoDB

class dbClient { // Clase que representa el cliente de la base de datos
    constructor(){
        this.conectarBD(); // Llamo al método conectarBD para iniciar la conexión a la base de datos al crear una instancia de dbClient 
    }

    async conectarBD(){  // Método asincrónico para conectar a la base de datos
        // Cadena de conexión a la base de datos MongoDB usando variables de entorno almacenadas en un archivo .env
        const queryString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/?retryWrites=true&w=majority`; 
        
        await mongoose.connect(queryString) // Conecto a la base de datos usando mongoose

        console.log("Conectado a la base de datos"); // Mensaje de éxito al conectar a la base de datos
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

export default new dbClient(); // Exporto una nueva instancia de dbClient para que pueda ser utilizada en otras partes de la aplicación