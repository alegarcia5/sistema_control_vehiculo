import Chequeo from './models/chequeo.js';

class chequeoRepositorio { // Clase para manejar operaciones CRUD de chequeos
  async crear(datosChequeo) { // Crear un nuevo chequeo
    try {
      const chequeo = new Chequeo(datosChequeo); // Crear una instancia del modelo Chequeo
      return await chequeo.save(); // Guardar en la base de datos
    } catch (error) {
      throw new Error(`Error al crear chequeo: ${error.message}`); // Manejo de errores
    }
  }

  async obtenerPorId(id) { // Obtener un chequeo por su ID
    try {
      return await Chequeo.findById(id) // Buscar por ID
        .populate('Turno') // Relacionar con el modelo Turno
        .populate('Tecnico', 'nombre apellido email telefono rol'); // Relacionar con el modelo Usuario (técnico) y seleccionar campos específicos
    } catch (error) {
      throw new Error(`Error al obtener chequeo: ${error.message}`); // Manejo de errores
    }
  }

  async obtenerPorTurno(turnoId) { // Obtener un chequeo por el ID del turno asociado
    try {
      return await Chequeo.findOne({ turno: turnoId }) // Buscar por ID del turno
        .populate('Turno') // Relacionar con el modelo Turno
        .populate('Tecnico', 'nombre apellido email telefono rol'); // Relacionar con el modelo Usuario (técnico) y seleccionar campos específicos
    } catch (error) {
      throw new Error(`Error al obtener chequeo por turno: ${error.message}`); // Manejo de errores
    }
  }

  async obtenerPorVehiculo(vehiculoId) { // Obtener chequeos asociados a un vehículo específico
    try {
      return await Chequeo.find() // Buscar todos los chequeos
        .populate({ // Relacionar con el modelo Turno
          path: 'Turno', // Ruta del campo a popular
          match: { vehiculo: vehiculoId }, // Filtrar por ID del vehículo 
          populate: { path: 'Vehiculo' } // Relacionar con el modelo Vehículo dentro del Turno
        })
        .populate('Tecnico', 'nombre apellido email telefono rol') // Relacionar con el modelo Usuario (técnico) y seleccionar campos específicos
        .then(chequeos => chequeos.filter(chequeo => chequeo.turno !== null)); // Filtrar chequeos que tienen un turno asociado
    } catch (error) {
      throw new Error(`Error al obtener chequeos por vehículo: ${error.message}`); // Manejo de errores
    }
  }

  async listar(filtros = {}) { // Listar chequeos con filtros opcionales
    try {
      const query = {}; // Objeto para construir la consulta
      
      if (filtros.tecnico) { // Filtrar por técnico si se proporciona
        query.tecnico = filtros.tecnico; // ID del técnico
      }
      
      if (filtros.resultado) { // Filtrar por resultado si se proporciona
        query.resultado = filtros.resultado; // Resultado del chequeo
      }
      
      if (filtros.fecha_desde || filtros.fecha_hasta) { // Filtrar por rango de fechas si se proporcionan
        query.fecha_chequeo = {}; // Inicializar el objeto de fecha
        if (filtros.fecha_desde) query.fecha_chequeo.$gte = new Date(filtros.fecha_desde); // Fecha desde
        if (filtros.fecha_hasta) query.fecha_chequeo.$lte = new Date(filtros.fecha_hasta); // Fecha hasta
      }
      
      return await Chequeo.find(query) // Ejecutar la consulta con los filtros aplicados
        .populate('Turno') // Relacionar con el modelo Turno
        .populate('Tecnico', 'nombre apellido email telefono rol') // Relacionar con el modelo Usuario (técnico) y seleccionar campos específicos
        .sort({ fecha_chequeo: -1 }) // Ordenar por fecha de chequeo descendente
    } catch (error) { 
      throw new Error(`Error al listar chequeos: ${error.message}`); // manejo de errores
    }
  }

  async actualizar(id, datosActualizacion) { // Actualizar un chequeo existente
    try {
      return await Chequeo.findByIdAndUpdate( // Buscar por ID y actualizar
        id, // ID del chequeo a actualizar
        datosActualizacion, // Datos para actualizar
        { new: true, runValidators: true } // Opciones: devolver el documento actualizado y ejecutar validaciones
      ).populate('Turno').populate('Tecnico', 'nombre apellido email telefono rol'); // Relacionar con Turno y Técnico
    } catch (error) {
      throw new Error(`Error al actualizar chequeo: ${error.message}`); // Manejo de errores
    }
  }

  async eliminar(id) { // Eliminar un chequeo por su ID
    try {
      return await Chequeo.findByIdAndDelete(id); // Buscar por ID y eliminar
    } catch (error) {
      throw new Error(`Error al eliminar chequeo: ${error.message}`); // Manejo de errores
    }
  }
}

export default chequeoRepositorio; // exportar la clase para su uso en otras partes de la aplicación