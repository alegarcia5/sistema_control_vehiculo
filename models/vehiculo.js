const mongoose = require("mongoose"); // Importo mongoose para definir el esquema y modelo de la colección de vehiculos

const vehiculoSchema = new mongoose.Schema( // Defino el esquema de la colección de vehiculos
    {
    matricula: { 
        type: String, 
        required: true, 
        unique: true,  
    }, // Campo 'matricula' de tipo String, requerido, único (no puede repetirse en la colección)

    modelo: { 
        type: String, 
        required: true 
    }, // Campo 'modelo' de tipo String, requerido, es decir, no puede estar vacío

    marca: { 
        type: String, 
        required: true 
    }, // Campo 'marca' de tipo String, requerido, es decir, no puede estar vacío

    dueño: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true
    },
    },
    { Timestamps: true } // Los Habilito para que mongoose agregue automáticamente los campos 'createdAt' y 'updatedAt', para segumiento de cambios
);

// Middleware para validaciones antes de guardar
vehiculoSchema.pre('save', function(next) { // Antes de guardar el vehículo
  if (this.matricula) { // Si la matrícula está definida
    this.matricula = this.matricula.toUpperCase(); // Convierto la matrícula a mayúsculas
  }
  next();
});

vehiculoSchema.methods.toJSON = function() { // Defino un método toJSON en el esquema para personalizar la conversión a JSON
    const vehiculo = this.toObject(); // Convierte el documento de Mongoose a un objeto JavaScript simple
    vehiculo.id = vehiculo._id;
    delete vehiculo._id;
    delete vehiculo.__v;
    return vehiculo;
};
// Defino un método toJSON en el esquema para personalizar la conversión a JSON, eliminando los campos _id y __v, y agregando un campo 'id' con el valor de '_id'

module.exports = mongoose.model("Vehiculo", vehiculoSchema); 
// Exporto el modelo de la colección de vehiculos, que se llamará "Vehiculo" y usará el esquema definido anteriormente