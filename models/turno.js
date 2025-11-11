const mongoose = require("mongoose"); // Importo mongoose para definir el esquema y modelo de la colección de turnos

const turnoSchema = new mongoose.Schema( // Defino el esquema de la colección de turnos
    {
    estado: { 
        type: String, 
        required: true, 
        enum: ['Pendiente', 'Confirmado', 'Cancelado', 'Completado'],
        message: 'El estado debe ser: Pendiente, Confirmado, Cancelado o Completado'
    }, // Campo 'estado' de tipo String, requerido, y debe ser uno de los valores especificados en el enum, con un mensaje personalizado para la validación

    fecha: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(fecha) { // Validador personalizado para verificar que la fecha es en el futuro
            return fecha > new Date(); // Retorno true si la fecha es mayor a la fecha actual
        },
      message: 'La fecha del turno debe ser en el futuro'
    }
    }, // Campo 'fecha' de tipo Date, requerido, es decir, no puede estar vacío
    
    vehiculo: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vehiculo',
        required: true,
    }, // Campo 'vehiculo' que referencia al ID de un documento en la colección 'Vehiculo', requerido

    motivoCancelacion: { 
        type: String,
        required: function() { 
            return this.estado === 'Cancelado'; 
        } 
    }, // Campo 'motivoCancelacion' de tipo String, requerido solo si el estado es 'Cancelado', es decir, no puede estar vacío en ese caso  
    },
    { Timestamps: true } // Los Habilito para que mongoose agregue automáticamente los campos 'createdAt' y 'updatedAt', para segumiento de cambios
);

turnoSchema.methods.puedeConfirmar = function() { // Método para verificar si el turno puede ser confirmado
  return this.estado === 'Pendiente'; // Solo se puede confirmar si el estado es 'PENDIENTE'
};

turnoSchema.methods.puedeCancelar = function() { // Método para verificar si el turno puede ser cancelado
  return this.estado === 'Pendiente' || this.estado === 'Confirmado'; // Solo se puede cancelar si el estado es 'PENDIENTE' o 'CONFIRMADO'
};

turnoSchema.methods.puedeCompletar = function() { // Método para verificar si el turno puede ser completado
  return this.estado === 'Confirmado'; // Solo se puede completar si el estado es 'CONFIRMADO'
};

// Middleware para validar que no hay conflictos de horario
turnoSchema.pre('save', async function(next) { // Antes de guardar el turno
  if (this.isNew || this.isModified('fecha') || this.isModified('vehiculo')) { // Si es un nuevo turno o se modificó la fecha o el vehículo
    const Turno = mongoose.model('Turno'); // Obtengo el modelo de Turno
    const conflicto = await Turno.findOne({ // Busco un turno que tenga:
      fecha: this.fecha, // La misma fecha
      vehiculo: this.vehiculo, // El mismo vehículo
      estado: { $in: ['Pendiente', 'Confirmado'] }, // Estado 'Pendiente' o 'Confirmado'
      _id: { $ne: this._id }  // Y que no sea el mismo turno (en caso de actualización)
    });
    
    if (conflicto) {
      const error = new Error('Ya existe un turno programado para este vehículo en la fecha seleccionada');
      return next(error);
    }
  }
  next();
});

turnoSchema.methods.toJSON = function() { // Defino un método toJSON en el esquema para personalizar la conversión a JSON
    const turno = this.toObject();  // Convierte el documento de Mongoose a un objeto JavaScript simple
    turno.id = turno._id; // Agrego un campo 'id' con el valor de '_id'
    delete turno._id;
    delete turno.__v;
    return turno;
};
// Defino un método toJSON en el esquema para personalizar la conversión a JSON, eliminando los campos _id y __v, y agregando un campo 'id' con el valor de '_id'

module.exports = mongoose.model("Turno", turnoSchema); 
// Exporto el modelo de la colección de turnos, que se llamará "Turno" y usará el esquema definido anteriormente
