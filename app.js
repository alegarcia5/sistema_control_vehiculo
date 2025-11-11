require('dotenv').config(); //le digo a la app que use las variables de configuracion, para el puerto definido en ".env"
const dbClient = require('./config/dbClient.js'); // importo el cliente de la base de datos, para poder conectarme y desconectarme de la base de datos
const express = require('express'); //importo express, que es el framework que voy a usar para crear la aplicacion web

// Importar rutas
const usuarioRoutes = require('./routes/usuarioRoutes.js');
const vehiculoRoutes = require('./routes/vehiculoRoutes.js');
const turnoRoutes = require('./routes/turnoRoutes.js');
const chequeoRoutes = require('./routes/chequeoRoutes.js');

const app = express(); //creo la instancia de la funcionalidad de express

app.use(express.json()); //le digo a la app que use el formato json para recibir y enviar datos

// Configurar rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/chequeos', chequeoRoutes);

try{
    const PORT = process.env.PORT || 3000;
    
    if (process.env.NODE_ENV !== 'test') {
        app.listen(PORT, () => console.log('Servidor activo en el puerto '+PORT));
    } else {
        console.log('Modo test - Servidor no iniciado');
    }
} catch(e){
    console.log(e);
}

process.on('SIGINT', async () => { //le digo a la aplicacion que cuando reciba una señal de interrupcion, como Ctrl+C, se desconecte de la BD
    console.log('\nRecibida señal SIGINT. Cerrando servidor...');
    await dbClient.desconectarBD(); //llamo al metodo desconectarBD del cliente de la base de datos, para que se desconecte de la base de datos
    console.log('Desconectado de la base de datos'); //informo que me he desconectado de la base de datos
    process.exit(0); //finalizo el proceso
});

module.exports = app;