import TurnoService from './services/turnoService.js';
import TurnoRepository from './repositories/turnoRepositorio.js';

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
  
  async confirmarTurno(req, res) { // PUT /turnos/:id/confirmar
    try {
      const { id } = req.params; // Obtener ID del turno de los parámetros
      
      const turno = await turnoService.confirmarTurno(parseInt(id)); // Llamar al servicio para confirmar el turno
      
      res.json({ // Responder con éxito
        success: true,
        message: 'Turno confirmado exitosamente',
        data: turno
      });
      
    } catch (error) { // Manejo de errores
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async cancelarTurno(req, res) { // DELETE /turnos/:id
    try {
      const { id } = req.params; // Obtener ID del turno de los parámetros
      
      const turno = await turnoService.cancelarTurno(parseInt(id)); // Llamar al servicio para cancelar el turno
      
      res.json({ // Responder con éxito
        success: true,
        message: 'Turno cancelado exitosamente',
        data: turno
      });
      
    } catch (error) { // Manejo de errores
      res.status(400).json({
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
  
  async obtenerTurnosPorVehiculo(req, res) { // GET /turnos/vehiculo/:vehiculoId
    try {
      const { vehiculoId } = req.params; // Obtener ID del vehículo de los parámetros
      
      const turnos = await turnoService.obtenerTurnosPorVehiculo(parseInt(vehiculoId)); // Llamar al servicio para obtener turnos del vehículo
      
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
  
  async obtenerTurno(req, res) { // GET /turnos/:id
    try {
      const { id } = req.params; // Obtener ID del turno de los parámetros
      
      const turno = await turnoService.obtenerTurnoPorId(parseInt(id)); // Llamar al servicio para obtener el turno por ID
      
      if (!turno) { // Si no se encuentra el turno
        return res.status(404).json({
          success: false,
          message: 'Turno no encontrado'
        });
      }
      
      res.json({ // Responder con éxito
        success: true,
        data: turno
      });
      
    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new TurnoController(); // Exportar una instancia del controlador