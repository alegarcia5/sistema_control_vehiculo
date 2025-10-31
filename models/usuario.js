import mongoose from "mongoose"; // Importo mongoose para definir el esquema y modelo de la colección de usuarios

const usuarioSchema = new mongoose.Schema( // Defino el esquema de la colección de usuarios
    { 
    nombre: { 
        type: String, 
        required: true 
    }, // Campo 'nombre' de tipo String, requerido, es decir, no puede estar vacío
    
    apellido: {
        type: String, 
        required: true 
    }, // Campo 'apellido' de tipo String, requerido, es decir, no puede estar vacío

    email: { 
        type: String, 
        required: true, 
        unique: true,  
    }, // Campo 'email' de tipo String, requerido, único (no puede repetirse en la colección)

    telefono: {
        type: String, 
        required: true, 
        unique: true,  
    }, // Campo 'telefono' de tipo String, requerido, único (no puede repetirse en la colección)

    rol: { 
        type: String, 
        required: true, 
        enum: ['Dueño', 'Tecnico', 'Administrador'],
        message: 'El rol debe ser: Dueño, Tecnico o Administrador'
    }, // Campo 'rol' de tipo String, requerido, y debe ser uno de los valores especificados en el enum, con un mensaje personalizado para la validación

    password_hash: {
    type: String,
    required: [true, 'El hash de contraseña es requerido']
    }, // Campo 'password_hash' de tipo String, requerido, con un mensaje personalizado para la validación, es decir, no puede estar vacío, se usará para almacenar el hash de la contraseña del usuario
    },
    { Timestamps: true } // Los Habilito para que mongoose agregue automáticamente los campos 'createdAt' y 'updatedAt', para segumiento de cambios
);

usuarioSchema.index({ email: 1 }); // Creo un índice en el campo 'email' para mejorar el rendimiento de las consultas que lo utilicen
usuarioSchema.index({ rol: 1 }); // Creo un índice en el campo 'rol' para mejorar el rendimiento de las consultas que lo utilicen

usuarioSchema.methods.toJSON = function() { // Defino un método toJSON en el esquema para personalizar la conversión a JSON
    const usuario = this.toObject(); // Convierte el documento de Mongoose a un objeto JavaScript simple
    usuario.id = usuario._id; // Agrego un campo 'id' con el valor de '_id'
    delete usuario._id;
    delete usuario.__v;
    delete usuario.password_hash;
    return usuario;
};
// Defino un método toJSON en el esquema para personalizar la conversión a JSON, eliminando los campos _id, __v y password_hash, y agregando un campo 'id' con el valor de '_id'

export default mongoose.model("Usuario", usuarioSchema); 
// Exporto el modelo de la colección de usuarios, que se llamará "Usuario" y usará el esquema definido anteriormente