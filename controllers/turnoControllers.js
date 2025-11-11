const TurnoService = require('../services/turnoService.js');
const TurnoRepository = require('../repositories/turnoRepositorio.js');
const mongoose = require('mongoose');

// Inyección de dependencias
const turnoRepository = new TurnoRepository();
const turnoService = new TurnoService(turnoRepository); 

class TurnoController { 
  async solicitarTurno(req, res) { // POST /turnos
    try {
      const { fecha, vehiculo } = req.body; // Asegurarse de que los datos necesarios estén presentes
      
      if (!fecha || !vehiculo) { // Validación básica
        return res.status(400).json({
          success: false,
          message: 'Los campos fecha y vehiculo son requeridos'
        });
      }
      
      const datosTurno = { // Crear objeto turno
        fecha,
        vehiculo,
        estado: 'Pendiente'
      };
      
      const turno = await turnoService.solicitarTurno(datosTurno); // Llamar al servicio para solicitar el turno
      
      res.status(201).json({ // Responder con éxito
        success: true,
        message: 'Turno solicitado exitosamente',
        data: turno
      });
      
    } catch (error) { // Manejo de errores
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async confirmarTurno(req, res) {
    try {
      const { id } = req.params;
      
      const turno = await turnoService.confirmarTurno(id);
      
      res.json({
        success: true,
        message: 'Turno confirmado exitosamente',
        data: turno
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async cancelarTurno(req, res) {
    try {
      const { id } = req.params;
      
      const turno = await turnoService.cancelarTurno(id);
      
      res.json({
        success: true,
        message: 'Turno cancelado exitosamente',
        data: turno
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarTurnos(req, res) {
    try {
      const { estado, fecha_desde, fecha_hasta, vehiculo, limit = 50 } = req.query;
      
      const filtros = {};
      if (estado) filtros.estado = estado;
      if (fecha_desde || fecha_hasta) {
        filtros.fecha = {};
        if (fecha_desde) filtros.fecha.$gte = new Date(fecha_desde);
        if (fecha_hasta) filtros.fecha.$lte = new Date(fecha_hasta);
      }
      if (vehiculo) filtros.vehiculo = vehiculo;
      if (limit) filtros.limit = parseInt(limit);

      const turnos = await turnoService.listarTurnos(filtros);
      
      res.json({
        success: true,
        count: turnos.length,
        data: turnos
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async obtenerTurnosDisponibles(req, res) { // GET /turnos/disponibles?fecha=YYYY-MM-DD
    try {
      const { fecha } = req.query; // Obtener fecha de los parámetros de consulta
      
      const turnos = await turnoService.obtenerTurnosDisponibles(fecha); // Llamar al servicio para obtener turnos disponibles
    
      res.json({ // Responder con éxito
        success: true, 
        count: turnos.length,
        data: turnos
      });
      
    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async obtenerTurnosPorVehiculo(req, res) {
    try {
      const { vehiculoId } = req.params;
      
      const turnos = await turnoService.obtenerTurnosPorVehiculo(vehiculoId);
      
      res.json({
        success: true,
        count: turnos.length,
        data: turnos
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async obtenerTurno(req, res) {
    try {
      const { id } = req.params;
      
      // Usar el servicio correctamente
      const turno = await turnoService.obtenerTurnoPorId(id);
      
      if (!turno) {
        return res.status(404).json({
          success: false,
          message: 'Turno no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: turno
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async obtenerTurnosPorMatricula(req, res) {
    try {
      const { matricula } = req.params;
      
      // Buscar vehículo por matrícula
      const Vehiculo = mongoose.model('Vehiculo');
      const vehiculo = await Vehiculo.findOne({ matricula: matricula.toUpperCase() });
      
      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró vehículo con esa matrícula'
        });
      }
      
      // Obtener turnos del vehículo usando el servicio
      const turnos = await turnoService.obtenerTurnosPorVehiculo(vehiculo._id.toString());
      
      res.json({
        success: true,
        data: {
          vehiculo: {
            id: vehiculo._id,
            matricula: vehiculo.matricula,
            modelo: vehiculo.modelo,
            marca: vehiculo.marca
          },
          turnos: turnos
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async confirmarTurnoUsuario(req, res) {
    try {
      const { id } = req.params;
      const { matricula } = req.body;
      
      // VALIDAR QUE matricula EXISTA
      if (!matricula) {
        return res.status(400).json({
          success: false,
          message: 'La matrícula es requerida en el cuerpo de la solicitud'
        });
      }

      // Validar que el turno existe
      const turno = await turnoService.obtenerTurnoPorId(id);
      if (!turno) {
        return res.status(404).json({
          success: false,
          message: 'Turno no encontrado'
        });
      }
      
      // Buscar el vehículo del turno
      const Vehiculo = mongoose.model('Vehiculo');
      const vehiculo = await Vehiculo.findById(turno.vehiculo);
      
      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado para este turno'
        });
      }

      if (vehiculo.matricula !== matricula.toUpperCase()) {
        return res.status(400).json({
          success: false,
          message: 'La matrícula no coincide con el vehículo del turno'
        });
      }
      
      // Confirmar el turno
      const turnoConfirmado = await turnoService.confirmarTurno(id);
      
      res.json({
        success: true,
        message: 'Turno confirmado exitosamente',
        data: turnoConfirmado
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TurnoController(); // Exportar una instancia del controlador