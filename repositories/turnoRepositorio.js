const mongoose = require('mongoose');
const Turno = require('../models/turno');

class turnoRepositorio {
  async crear(datosTurno) {
    const turno = new Turno(datosTurno);
    return await turno.save();
  }

  async obtenerPorId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Turno.findById(id).populate('vehiculo');
  }

  async obtenerPorVehiculo(vehiculoId) {
    return await Turno.find({ vehiculo: vehiculoId })
      .populate('vehiculo')
      .sort({ fecha: -1 });
  }

  async obtenerDisponibles(fecha = null) {
    const query = { estado: 'Pendiente' };
    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
      query.fecha = { $gte: fechaInicio, $lte: fechaFin };
    }
    
    return await Turno.find(query)
      .populate('vehiculo')
      .sort({ fecha: 1 });
  }

  async actualizarEstado(id, nuevoEstado, motivoCancelacion = null) {
    const updateData = { estado: nuevoEstado };
    if (nuevoEstado === 'Cancelado' && motivoCancelacion) {
      updateData.motivo_cancelacion = motivoCancelacion;
    }
    
    return await Turno.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    }).populate('vehiculo');
  }

  async existeConflicto(fecha, vehiculoId, excludeId = null) {
    const query = { 
      fecha: new Date(fecha),
      vehiculo: vehiculoId,
      estado: { $in: ['Pendiente', 'Confirmado'] }
    };
    if (excludeId) query._id = { $ne: excludeId };
    
    const conflicto = await Turno.findOne(query);
    return !!conflicto;
  }

  async listar(filtros = {}) {
    const query = {};
    if (filtros.estado) query.estado = filtros.estado;
    if (filtros.vehiculo) query.vehiculo = filtros.vehiculo;
    
    if (filtros.fecha_desde || filtros.fecha_hasta) {
      query.fecha = {};
      if (filtros.fecha_desde) query.fecha.$gte = new Date(filtros.fecha_desde);
      if (filtros.fecha_hasta) query.fecha.$lte = new Date(filtros.fecha_hasta);
    }
    
    return await Turno.find(query)
      .populate('vehiculo')
      .sort({ fecha: -1 })
      .limit(filtros.limit || 100);
  }
}

module.exports = turnoRepositorio;