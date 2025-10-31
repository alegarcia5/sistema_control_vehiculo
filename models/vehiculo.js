import mongoose from "mongoose"; // Importo mongoose para definir el esquema y modelo de la colección de vehiculos

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
        required: true,
        validate: {
            validator: async function(value) { // Validador personalizado para verificar que el usuario existe y tiene rol 'DUEÑO'
                const Usuario = mongoose.model('Usuario'); // Obtengo el modelo de Usuario
                const usuario = await Usuario.findById(value); // Busco el usuario por su ID
                return usuario && usuario.rol === 'Dueño'; // Retorno true si el usuario existe y su rol es 'DUEÑO'
            },
            message: 'El dueño debe ser un usuario con rol Dueño'
        }
    }, // Campo 'dueño' que referencia al ID de un documento en la colección 'Usuario', requerido
    },
    { Timestamps: true } // Los Habilito para que mongoose agregue automáticamente los campos 'createdAt' y 'updatedAt', para segumiento de cambios
);

vehiculoSchema.index({ matricula: 1 }); // Creo un índice en el campo 'matricula' para mejorar el rendimiento de las consultas que lo utilicen
vehiculoSchema.index({ dueño: 1 }); // Creo un índice en el campo 'dueño' para mejorar el rendimiento de las consultas que lo utilicen
vehiculoSchema.index({ marca: 1 }); // Creo un índice en el campo 'marca' para mejorar el rendimiento de las consultas que lo utilicen
vehiculoSchema.index({ modelo: 1 }); // Creo un índice en el campo 'modelo' para mejorar el rendimiento de las consultas que lo utilicen

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

export default mongoose.model("Vehiculo", vehiculoSchema); 
// Exporto el modelo de la colección de vehiculos, que se llamará "Vehiculo" y usará el esquema definido anteriormente


