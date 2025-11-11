const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoControllers.js');

// GET /api/turnos - Listar todos los turnos (con filtros opcionales)
router.get('/', turnoController.listarTurnos);

// GET /api/turnos/disponibles - Obtener turnos disponibles
router.get('/disponibles', turnoController.obtenerTurnosDisponibles);

// GET /api/turnos/vehiculo/:vehiculoId - Obtener turnos por vehículo
router.get('/vehiculo/:vehiculoId', turnoController.obtenerTurnosPorVehiculo);

// GET /api/turnos/matricula/:matricula - Obtener turnos por matrícula
router.get('/matricula/:matricula', turnoController.obtenerTurnosPorMatricula);

// PUT /api/turnos/:id/confirmar-usuario - Confirmar turno por usuario
router.put('/:id/confirmar-usuario', turnoController.confirmarTurnoUsuario);

// GET /api/turnos/:id - Obtener turno por ID
router.get('/:id', turnoController.obtenerTurno);

// POST /api/turnos - Solicitar un nuevo turno
router.post('/', turnoController.solicitarTurno);

// PUT /api/turnos/:id/confirmar - Confirmar turno
router.put('/:id/confirmar', turnoController.confirmarTurno);

// PUT /api/turnos/:id/cancelar - Cancelar turno
router.put('/:id/cancelar', turnoController.cancelarTurno);

module.exports = router;