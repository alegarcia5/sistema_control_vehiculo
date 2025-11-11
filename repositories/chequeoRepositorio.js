const mongoose = require('mongoose');
const Chequeo = require('../models/chequeo');

class chequeoRepositorio {
  async crear(datosChequeo) {
    const chequeo = new Chequeo(datosChequeo);
    return await chequeo.save();
  }

  async obtenerPorId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Chequeo.findById(id)
      .populate('turno')
      .populate('tecnico', 'nombre apellido email telefono rol');
  }

  async obtenerPorTurno(turnoId) {
    if (!mongoose.Types.ObjectId.isValid(turnoId)) return null;
    return await Chequeo.findOne({ turno: turnoId })
      .populate('turno')
      .populate('tecnico', 'nombre apellido email telefono rol');
  }

  async obtenerPorVehiculo(vehiculoId) {
    return await Chequeo.find()
      .populate({
        path: 'turno',
        match: { vehiculo: vehiculoId },
        populate: { path: 'vehiculo' }
      })
      .populate('tecnico', 'nombre apellido email telefono rol')
      .then(chequeos => chequeos.filter(chequeo => chequeo.turno !== null));
  }

  async listar(filtros = {}) {
    const query = {};
    if (filtros.tecnico) query.tecnico = filtros.tecnico;
    if (filtros.resultado) query.resultado = filtros.resultado;
    
    return await Chequeo.find(query)
      .populate('turno')
      .populate('tecnico', 'nombre apellido email telefono rol')
      .sort({ fecha_chequeo: -1 })
      .limit(filtros.limit || 50);
  }

  async actualizar(id, datosActualizacion) {
    return await Chequeo.findByIdAndUpdate(id, datosActualizacion, { 
      new: true, 
      runValidators: true 
    }).populate('turno').populate('tecnico', 'nombre apellido email telefono rol');
  }
}

module.exports = chequeoRepositorio;