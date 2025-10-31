import mongoose from 'mongoose'; // Importo mongoose para definir el esquema y modelo de la colección de chequeos

const puntoChequeoSchema = new mongoose.Schema({ // Subesquema para los puntos de chequeo
  nombre: {
    type: String,
    required: [true]
  }, // Nombre del punto de chequeo, de tipo String, requerido
  descripcion: {
    type: String,
  }, // Descripción del punto de chequeo, de tipo String, opcional
  orden: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  }, // Orden del punto de chequeo, de tipo Number, requerido, entre 1 y 8
  activo: {
    type: Boolean,
    default: true
  } // Indica si el punto de chequeo está activo, de tipo Boolean, por defecto true
},
    { Timestamps: true } // Los Habilito para que mongoose agregue automáticamente los campos 'createdAt' y 'updatedAt', para segumiento de cambios
);

const chequeoSchema = new mongoose.Schema({ // Defino el esquema de la colección de chequeos
  turno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turno',
    required: [true],
    unique: true,
    validate: {
      validator: async function(turnoId) { // Validador personalizado para verificar que el turno existe y está confirmado
        const Turno = mongoose.model('Turno'); // Obtengo el modelo de Turno
        const turno = await Turno.findById(turnoId); // Busco el turno por su ID
        return turno && turno.estado === 'Confirmado'; // Retorno true si el turno existe y su estado es 'Confirmado'
      },
      message: 'El turno debe existir y estar confirmado'
    } // Campo 'turno' que referencia al ID de un documento en la colección 'Turno', requerido, único (un chequeo por turno)
  },

  tecnico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El técnico es requerido'],
    validate: {
      validator: async function(tecnicoId) { // Validador personalizado para verificar que el usuario existe y tiene rol 'Tecnico'
        const Usuario = mongoose.model('Usuario'); // Obtengo el modelo de Usuario
        const usuario = await Usuario.findById(tecnicoId); // Busco el usuario por su ID
        return usuario && usuario.rol === 'Tecnico'; // Retorno true si el usuario existe y su rol es 'Tecnico'
      },
      message: 'El técnico debe ser un usuario con rol Tecnico'
    } // Campo 'tecnico' que referencia al ID de un documento en la colección 'Usuario', requerido
  },

  puntuacion: [{
    punto: {
      type: String,
      required: true
    }, // Nombre del punto de chequeo, de tipo String, requerido

    valor: {
      type: Number,
      required: true,
      min: [1, 'La puntuación mínima es 1'],
      max: [10, 'La puntuación máxima es 10']
    }, // Puntuación del punto de chequeo, de tipo Number, requerido, entre 1 y 10

    observaciones: {
      type: String,
      trim: true,
    } // Observaciones del punto de chequeo, de tipo String, opcional

  }],

  puntuacion_total: {
    type: Number,
    required: true,
    min: [0, 'La puntuación total no puede ser negativa'],
    max: [80, 'La puntuación total máxima es 80']
  }, // Puntuación total del chequeo, de tipo Number, requerido, entre 0 y 80 (8 puntos de chequeo con puntuación entre 1 y 10)
  
  resultado: {
    type: String,
    required: true,
    enum: {
      values: ['Aprobado', 'Rechazado', 'Rechequeo'],
      message: 'El resultado debe ser: Aprobado, Rechazado o Rechequeo'
    }
  }, // Resultado del chequeo, de tipo String, requerido, y debe ser uno de los valores especificados en el enum, con un mensaje personalizado para la validación
  
  observaciones_generales: {
    type: String
  }, // Observaciones generales del chequeo, de tipo String, opcional
  
  fecha_chequeo: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(fecha) {
        return fecha <= new Date();
      },
      message: 'La fecha de chequeo no puede ser en el futuro'
    }
  } // Fecha del chequeo, de tipo Date, con valor por defecto la fecha actual, y un validador personalizado para verificar que no es en el futuro
}, 

{
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) { // Defino un método toJSON en el esquema para personalizar la conversión a JSON
      ret.id = ret._id; // Agrego un campo 'id' con el valor de '_id'
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

chequeoSchema.index({ turno: 1 }); // Creo un índice en el campo 'turno' para mejorar el rendimiento de las consultas que lo utilicen
chequeoSchema.index({ tecnico: 1 }); // Creo un índice en el campo 'tecnico' para mejorar el rendimiento de las consultas que lo utilicen
chequeoSchema.index({ resultado: 1 }); // Creo un índice en el campo 'resultado' para mejorar el rendimiento de las consultas que lo utilicen
chequeoSchema.index({ fecha_chequeo: -1 }); // Creo un índice en el campo 'fecha_chequeo' para mejorar el rendimiento de las consultas que lo utilicen

// Middleware para cálculos automáticos antes de guardar
chequeoSchema.pre('save', function(next) {
  // Calcular puntuación total si no existe
  if (this.isModified('puntuacion') && this.puntuaciones.length === 8) { // Aseguro que hay 8 puntos de chequeo
    this.puntuacion_total = this.puntuaciones.reduce((total, item) => total + item.valor, 0); // Sumo todas las puntuaciones
  }
  
  // Determinar resultado si no existe
  if (!this.resultado && this.puntuaciones.length === 8) { // Aseguro que hay 8 puntos de chequeo
    const total = this.puntuacion_total; // Obtengo la puntuación total
    const minPuntuacion = Math.min(this.puntuaciones.map(p => p.valor)); // Obtengo la puntuación mínima entre los puntos de chequeo
    
    if (total >= 80) {
      this.resultado = 'Aprobado';
    } else if (total < 40 || minPuntuacion < 5) {
      this.resultado = 'Rechequeo';
    } else {
      this.resultado = 'Rechazado';
    }
  }
  
  // Generar observaciones automáticas si no existen
  if (!this.observaciones_generales && this.puntuaciones.length === 8) { // Aseguro que hay 8 puntos de chequeo
    this.observaciones_generales = this.generarObservacionesAutomaticas(); // Llamo al método para generar observaciones automáticas
  }
  
  next(); // Continúo con el guardado
});

// Middleware para actualizar el estado del turno después de guardar
chequeoSchema.post('save', async function() { // Después de guardar el chequeo
  const Turno = mongoose.model('Turno'); // Obtengo el modelo de Turno
  await Turno.findByIdAndUpdate(this.turno, { estado: 'Completado' }); // Actualizo el estado del turno a 'Completado'
});

// Métodos de instancia
chequeoSchema.methods.generarObservacionesAutomaticas = function() { // Método para generar observaciones automáticas basadas en las puntuaciones
  const total = this.puntuacion_total; // Obtengo la puntuación total
  const minPuntuacion = Math.min(...this.puntuaciones.map(p => p.valor)); // Obtengo la puntuación mínima entre los puntos de chequeo
  const puntosBajos = this.puntuaciones // Encuentro los puntos con puntuación menor a 5
    .filter(p => p.valor < 5) // Filtro los puntos con valor menor a 5
    .map(p => p.punto); // Mapeo para obtener solo los nombres de los puntos
  
  if (this.resultado === 'Rechequeo') {
    if (total < 40) {
      return `Puntuación total insuficiente (${total}/80). Se requiere revisión completa del vehículo.`;
    } 
    else if (minPuntuacion < 5) {
      return `Puntuaciones críticas en: ${puntosBajos.join(', ')}. Revisión específica requerida.`;
    }
  } 

  else if (this.resultado === 'Aprobado') {
    return 'Vehículo en condiciones óptimas. Todas las puntuaciones dentro de los parámetros aceptables.';
  } 
  else {
    return 'Vehículo no aprobado. Se recomienda realizar las reparaciones necesarias.';
  }
  
  return 'Sin observaciones específicas.';
};

chequeoSchema.methods.toJSON = function() { // Defino un método toJSON en el esquema para personalizar la conversión a JSON
  const chequeo = this.toObject(); // Convierte el documento de Mongoose a un objeto JavaScript simple
  chequeo.id = chequeo._id; // Agrego un campo 'id' con el valor de '_id'
  delete chequeo._id;
  delete chequeo.__v;
  return chequeo;
}; // Defino un método toJSON en el esquema para personalizar la conversión a JSON, eliminando los campos _id y __v, y agregando un campo 'id' con el valor de '_id'

export const PuntoChequeo = mongoose.model('PuntoChequeo', puntoChequeoSchema); // Exporto el modelo de PuntoChequeo para usarlo en otras partes de la aplicación
export default mongoose.model('Chequeo', chequeoSchema); // Exporto el modelo de Chequeo para usarlo en otras partes de la aplicación