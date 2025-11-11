const TurnoRepository = require('../repositories/turnoRepositorio.js');
const Vehiculo = require('../models/vehiculo.js');
const mongoose = require('mongoose');

class TurnoService {
  constructor(turnoRepository) {
    this.turnoRepository = turnoRepository;
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
  
  async confirmarTurno(turnoId) { // Confirmar un turno existente
    try {
      const turno = await this.turnoRepository.obtenerPorId(turnoId); // Obtener el turno por ID
      if (!turno) {
        throw new Error('Turno no encontrado');
      }
      
      if (turno.estado !== 'Pendiente') {
        throw new Error('El turno no puede ser confirmado en su estado actual');
      }
      
      const actualizado = await this.turnoRepository.actualizarEstado(turnoId, 'Confirmado'); // Actualizar estado a CONFIRMADO
      if (!actualizado) {
        throw new Error('Error al confirmar el turno');
      }
      
      return { turno, estado: 'Confirmado' }; // Retornar el turno confirmado
      
    } catch (error) {
      throw new Error(`Error al confirmar turno: ${error.message}`); // Manejo de errores
    }
  }
  
  async cancelarTurno(turnoId) { // Cancelar un turno existente
    try {
      const turno = await this.turnoRepository.obtenerPorId(turnoId); // Obtener el turno por ID
      if (!turno) {
        throw new Error('Turno no encontrado');
      }
      
      if (turno.estado !== 'Pendiente' && turno.estado !== 'Confirmado') {
        throw new Error('El turno no puede ser cancelado en su estado actual');
      }
      
      const actualizado = await this.turnoRepository.actualizarEstado(turnoId, 'Cancelado'); // Actualizar estado a CANCELADO
      if (!actualizado) {
        throw new Error('Error al cancelar el turno');
      }
      
      return { turno, estado: 'Cancelado' }; // Retornar el turno cancelado
      
    } catch (error) {
      throw new Error(`Error al cancelar turno: ${error.message}`); // Manejo de errores
    }
  }
  
  async obtenerTurnosDisponibles(fecha = null) { // Obtener turnos disponibles, opcionalmente por fecha
    try {
      return await this.turnoRepository.obtenerDisponibles(fecha); // Obtener turnos disponibles
    } catch (error) {
      throw new Error(`Error al obtener turnos disponibles: ${error.message}`); // Manejo de errores
    }
  }
  
  async obtenerTurnosPorVehiculo(vehiculoId) { // Obtener turnos asociados a un vehículo
    try {
      const objectId = new mongoose.Types.ObjectId(vehiculoId.toString());
      return await this.turnoRepository.obtenerPorVehiculo(vehiculoId); // Obtener turnos por vehículo
    } catch (error) {
      throw new Error(`Error al obtener turnos del vehículo: ${error.message}`); // Manejo de errores
    }
  }
  
  async obtenerTurnoPorId(id) { // Obtener un turno por su ID
    try {
      const objectId = new mongoose.Types.ObjectId(id.toString());
      return await this.turnoRepository.obtenerPorId(id); // Obtener turno por ID
    } catch (error) {
      throw new Error(`Error al obtener turno: ${error.message}`); // Manejo de errores
    }
  }
}

module.exports = TurnoService; // Exportar la clase para su uso en otros módulos