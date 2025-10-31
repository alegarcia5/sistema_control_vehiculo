import 'dotenv/config'; //le digo a la app que use las variables de configuracion, para el puerto definido en ".env"

import express from 'express'; //importo express, que es el framework que voy a usar para crear la aplicacion web

const app = express(); //creo la instancia de la funcionalidad de express

app.use(express.json()); //le digo a la app que use el formato json para recibir y enviar datos

try{
    const PORT = process.env.PORT || 3000; //defino el puerto y le pregunto a la aplicacion si hay un puerto definido, sino usa el puerto 3000 
    app.listen(PORT, () => console.log('Servidor activo en el puerto '+PORT)) //le digo, escucha este puerto e informame en que puerto se levanta
} catch(e){ //para poder capturar cualquier error
    console.log(e);
}

process.on('SIGINT', async () => { //le digo a la aplicacion que cuando reciba una señal de interrupcion, como Ctrl+C, se desconecte de la BD
    dbClient.desconectarBD(); //llamo al metodo desconectarBD del cliente de la base de datos, para que se desconecte de la base de datos
    console.log('Desconectado de la base de datos'); //informo que me he desconectado de la base de datos
    process.exit(0); //finalizo el proceso
}); //finalizo el proceso de la aplicacion, para que no quede en memoria y no consuma recursos innecesarios
