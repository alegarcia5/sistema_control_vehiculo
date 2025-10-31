import express from 'express';
const router = express.Router();
import chequeoController from './controllers/chequeoControllers.js';

// GET /api/chequeos - Listar todos los chequeos (con filtros opcionales)
router.get('/', chequeoController.listarChequeos);

// GET /api/chequeos/vehiculo/:vehiculoId - Obtener chequeos por vehículo
router.get('/vehiculo/:vehiculoId', chequeoController.obtenerChequeosPorVehiculo);

// GET /api/chequeos/:id - Obtener chequeo por ID
router.get('/:id', chequeoController.obtenerChequeo);

// POST /api/chequeos - Realizar un nuevo chequeo
router.post('/', chequeoController.realizarChequeo);

// POST /api/chequeos/calcular - Calcular resultado de puntuaciones
router.post('/calcular', chequeoController.calcularResultado);

// PUT /api/chequeos/:id - Actualizar chequeo
router.put('/:id', chequeoController.actualizarChequeo);

export default router;