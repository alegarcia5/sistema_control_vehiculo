const TurnoRepository = require('../repositories/turnoRepositorio.js');
const Vehiculo = require('../models/vehiculo.js');
const mongoose = require('mongoose');

class TurnoService {
  constructor(turnoRepository) {
    this.turnoRepository = turnoRepository;
  }

  async listarTurnos(filtros = {}) {
    try {
      return await this.turnoRepository.listar(filtros);
    } catch (error) {
      throw new Error(`Error al listar turnos: ${error.message}`);
    }
  }
  
  async solicitarTurno(datosTurno) { // datosTurno: { fecha, vehiculo_id, servicio }
    try {
      const vehiculo = await Vehiculo.findById(datosTurno.vehiculo); // Verificar que el vehículo exista
      if (!vehiculo) {
        throw new Error('Vehículo no encontrado');
      }
      
      const conflicto = await this.turnoRepository.existeConflicto( // Verificar conflictos de horarios
        datosTurno.fecha, 
        datosTurno.vehiculo
      );
      
      if (conflicto) {
        throw new Error('Ya existe un turno programado para este vehículo en la fecha seleccionada');
      }
      
      const turno = await this.turnoRepository.crear(datosTurno); // Guardar el nuevo turno
      
      return turno; // Retornar el turno creado
      
    } catch (error) {
      throw new Error(`Error al solicitar turno: ${error.message}`); // Manejo de errores
    } 
  }
  
  async confirmarTurno(turnoId) {
    try {
      const turno = await this.turnoRepository.obtenerPorId(turnoId);
      if (!turno) {
        throw new Error('Turno no encontrado');
      }
      
      if (turno.estado !== 'Pendiente') {
        throw new Error('El turno no puede ser confirmado en su estado actual');
      }
      
      const actualizado = await this.turnoRepository.actualizarEstado(turnoId, 'Confirmado');
      if (!actualizado) {
        throw new Error('Error al confirmar el turno');
      }
      
      return { turno: actualizado, estado: 'Confirmado' };
      
    } catch (error) {
      throw new Error(`Error al confirmar turno: ${error.message}`);
    }
  }
  
  async cancelarTurno(turnoId) {
    try {
      console.log('Cancelando turno con ID:', turnoId, 'Tipo:', typeof turnoId);
      
      const turno = await this.turnoRepository.obtenerPorId(turnoId);
      if (!turno) {
        throw new Error('Turno no encontrado');
      }
      
      if (turno.estado !== 'Pendiente' && turno.estado !== 'Confirmado') {
        throw new Error('El turno no puede ser cancelado en su estado actual');
      }
      
      const actualizado = await this.turnoRepository.actualizarEstado(turnoId, 'Cancelado');
      if (!actualizado) {
        throw new Error('Error al cancelar el turno');
      }
      
      return { turno: actualizado, estado: 'Cancelado' };
      
    } catch (error) {
      throw new Error(`Error al cancelar turno: ${error.message}`);
    }
  }
  
  async obtenerTurnosDisponibles(fecha = null) { // Obtener turnos disponibles, opcionalmente por fecha
    try {
      return await this.turnoRepository.obtenerDisponibles(fecha); // Obtener turnos disponibles
    } catch (error) {
      throw new Error(`Error al obtener turnos disponibles: ${error.message}`); // Manejo de errores
    }
  }
  
  async obtenerTurnosPorVehiculo(vehiculoId) {
    try {
      console.log('Buscando turnos para vehiculoId:', vehiculoId, 'Tipo:', typeof vehiculoId);
      
      let resultado;
      
      if (mongoose.Types.ObjectId.isValid(vehiculoId)) {
        // Es un ObjectId válido (24 caracteres hex)
        const objectId = new mongoose.Types.ObjectId(vehiculoId);
        resultado = await this.turnoRepository.obtenerPorVehiculo(objectId);
      } else if (!isNaN(vehiculoId)) {
        // Es un número - buscar vehículo por algún campo numérico
        resultado = await this.buscarTurnosPorIdNumerico(vehiculoId);
      } else {
        throw new Error('ID de vehículo no válido. Debe ser ObjectId (24 caracteres) o número.');
      }
      
      return resultado;
    } catch (error) {
      throw new Error(`Error al obtener turnos del vehículo: ${error.message}`);
    }
  }
  
  async obtenerTurnoPorId(id) {
    try {
      let resultado;
      
      if (mongoose.Types.ObjectId.isValid(id)) {
        const objectId = new mongoose.Types.ObjectId(id);
        resultado = await this.turnoRepository.obtenerPorId(objectId);
      } else {
        throw new Error('ID de turno no válido');
      }
      
      if (!resultado) {
        throw new Error('Turno no encontrado');
      }
      
      return resultado;
    } catch (error) {
      throw new Error(`Error al obtener turno: ${error.message}`);
    }
  }

  async buscarTurnosPorIdNumerico(idNumerico) {
    // Implementar lógica si necesitas buscar por ID numérico
    throw new Error('Búsqueda por ID numérico no implementada');
  }
}

module.exports = TurnoService; // Exportar la clase para su uso en otros módulos