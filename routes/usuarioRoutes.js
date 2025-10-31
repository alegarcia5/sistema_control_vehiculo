import express from 'express';
const router = express.Router();
import usuarioController from './controllers/usuarioControllers.js';

// GET /api/usuarios - Listar todos los usuarios
router.get('/', usuarioController.listarUsuarios);

// GET /api/usuarios/tecnicos - Listar técnicos
router.get('/tecnicos', usuarioController.obtenerTecnicos);

// GET /api/usuarios/dueños - Listar dueños
router.get('/dueños', usuarioController.obtenerDueños);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', usuarioController.obtenerUsuario);

// POST /api/usuarios - Crear nuevo usuario
router.post('/', usuarioController.crearUsuario);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', usuarioController.actualizarUsuario);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', usuarioController.eliminarUsuario);

export default router;