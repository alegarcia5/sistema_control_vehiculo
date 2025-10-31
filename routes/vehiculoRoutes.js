import express from 'express';
const router = express.Router();
import vehiculoController from './controllers/vehiculoControllers.js';

// GET /api/vehiculos - Listar todos los vehículos
router.get('/', vehiculoController.listarVehiculos);

// GET /api/vehiculos/matricula/:matricula - Obtener vehículo por matrícula
router.get('/matricula/:matricula', vehiculoController.obtenerVehiculoPorMatricula);

// GET /api/vehiculos/dueño/:dueñoId - Obtener vehículos por dueño
router.get('/dueño/:dueñoId', vehiculoController.obtenerVehiculosPorDueño);

// GET /api/vehiculos/:id - Obtener vehículo por ID
router.get('/:id', vehiculoController.obtenerVehiculo);

// POST /api/vehiculos - Crear nuevo vehículo
router.post('/', vehiculoController.crearVehiculo);

// PUT /api/vehiculos/:id - Actualizar vehículo
router.put('/:id', vehiculoController.actualizarVehiculo);

// DELETE /api/vehiculos/:id - Eliminar vehículo
router.delete('/:id', vehiculoController.eliminarVehiculo);

export default router;