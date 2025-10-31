import Turno from './models/turno.js';

class turnoRepositorio { // Repositorio para gestionar turnos de vehículos
  async crear(datosTurno) { // Crea un nuevo turno
    try {
      const turno = new Turno(datosTurno); // Instancia un nuevo turno con los datos proporcionados
      return await turno.save(); // Guarda el turno en la base de datos y lo retorna
    } catch (error) {
      throw new Error(`Error al crear turno: ${error.message}`); // Manejo de errores
    }
  }

  async obtenerPorId(id) { // Obtiene un turno por su ID
    try {
      return await Turno.findById(id) // Busca el turno por ID y lo retorna
        .populate('vehiculo'); // Popula la referencia al vehículo asociado
    } catch (error) {
      throw new Error(`Error al obtener turno: ${error.message}`); // Manejo de errores
    }
  }

  async obtenerPorVehiculo(vehiculoId) { // Obtiene todos los turnos asociados a un vehículo específico
    try {
      return await Turno.find({ vehiculo: vehiculoId }) // Busca turnos por ID de vehículo
        .populate('vehiculo') // Popula la referencia al vehículo asociado
        .sort({ fecha: -1 }); // Ordena los turnos por fecha descendente
    } catch (error) {
      throw new Error(`Error al obtener turnos por vehículo: ${error.message}`); // Manejo de errores
    }
  }

  async obtenerDisponibles(fecha = null) { // Obtiene turnos disponibles, opcionalmente filtrados por fecha
    try {
      const query = { estado: 'Pendiente' }; // Solo turnos pendientes
      
      if (fecha) { // Si se proporciona una fecha, filtra por esa fecha
        const fechaInicio = new Date(fecha); // Inicio de la fecha
        fechaInicio.setHours(0, 0, 0, 0); // inicio del día
        
        const fechaFin = new Date(fecha); // Fin de la fecha
        fechaFin.setHours(23, 59, 59, 999); // Fin del día
        
        query.fecha = { // Filtra entre el inicio y fin del día
          $gte: fechaInicio,
          $lte: fechaFin
        };
      }
      
      return await Turno.find(query) // Busca los turnos que cumplen con el query
        .populate('vehiculo') // Popula la referencia al vehículo asociado
        .sort({ fecha: 1 }); // Ordena los turnos por fecha ascendente
    } catch (error) {
      throw new Error(`Error al obtener turnos disponibles: ${error.message}`); // Manejo de errores
    }
  }

  async actualizarEstado(id, nuevoEstado, motivoCancelacion = null) { // Actualiza el estado de un turno
    try {
      const updateData = { estado: nuevoEstado }; // Datos a actualizar
      
      if (nuevoEstado === 'Cancelado' && motivoCancelacion) { // Si el nuevo estado es 'Cancelado'
        updateData.motivo_cancelacion = motivoCancelacion; // Añade el motivo de cancelación
      }
      
      return await Turno.findByIdAndUpdate( // Actualiza el turno por ID y retorna el documento actualizado
        id, // ID del turno a actualizar
        updateData, // Datos a actualizar
        { new: true, runValidators: true } // Opciones: retorna el nuevo documento y ejecuta validaciones
      ).populate('vehiculo'); // Popula la referencia al vehículo asociado
    } catch (error) {
      throw new Error(`Error al actualizar estado del turno: ${error.message}`); // Manejo de errores
    }
  }

  async existeConflicto(fecha, vehiculoId, excludeId = null) { // Verifica si existe un conflicto de turno para un vehículo en una fecha específica
    try {
      const query = { 
        fecha: new Date(fecha),
        vehiculo: vehiculoId,
        estado: { $in: ['Pendiente', 'Confirmado'] }
      }; // Query para buscar conflictos
      
      if (excludeId) {
        query._id = { $ne: excludeId };
      } // Excluye un ID específico si se proporciona
      
      const conflicto = await Turno.findOne(query); // Busca un turno que cumpla con el query y lo asigna a conflicto
      return !!conflicto; // Retorna true si existe un conflicto, false en caso contrario
    } catch (error) {
      throw new Error(`Error al verificar conflicto de turno: ${error.message}`); // Manejo de errores
    }
  }

  async listar(filtros = {}) { // Lista turnos con filtros opcionales
    try {
      const query = {}; // Query inicial vacío
      
      if (filtros.estado) {
        query.estado = filtros.estado;
      } // Filtra por estado si se proporciona
      
      if (filtros.fecha_desde || filtros.fecha_hasta) {
        query.fecha = {};
        if (filtros.fecha_desde) query.fecha.$gte = new Date(filtros.fecha_desde);
        if (filtros.fecha_hasta) query.fecha.$lte = new Date(filtros.fecha_hasta);
      } // Filtra por rango de fechas si se proporcionan
      
      if (filtros.vehiculo) {
        query.vehiculo = filtros.vehiculo;
      } // Filtra por ID de vehículo si se proporciona
      
      return await Turno.find(query) // Busca los turnos que cumplen con el query
        .populate('vehiculo') // Popula la referencia al vehículo asociado
        .sort({ fecha: -1 }) // Ordena los turnos por fecha descendente
        .limit(filtros.limit || 100); // Limita la cantidad de resultados (por defecto 100)
    } catch (error) {
      throw new Error(`Error al listar turnos: ${error.message}`); // Manejo de errores
    }
  }
}

export default turnoRepositorio; // exporta la clase para su uso en otros módulos