import express from 'express';
const router = express.Router();
import turnoController from './controllers/turnoControllers.js';

// GET /api/turnos - Listar todos los turnos (con filtros opcionales)
router.get('/', turnoController.listarTurnos);

// GET /api/turnos/disponibles - Obtener turnos disponibles
router.get('/disponibles', turnoController.obtenerTurnosDisponibles);

// GET /api/turnos/vehiculo/:vehiculoId - Obtener turnos por vehículo
router.get('/vehiculo/:vehiculoId', turnoController.obtenerTurnosPorVehiculo);

// GET /api/turnos/:id - Obtener turno por ID
router.get('/:id', turnoController.obtenerTurno);

// POST /api/turnos - Solicitar un nuevo turno
router.post('/', turnoController.solicitarTurno);

// PUT /api/turnos/:id/confirmar - Confirmar turno
router.put('/:id/confirmar', turnoController.confirmarTurno);

// PUT /api/turnos/:id/cancelar - Cancelar turno
router.put('/:id/cancelar', turnoController.cancelarTurno);

export default router;