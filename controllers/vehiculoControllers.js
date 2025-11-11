const Vehiculo = require('../models/vehiculo.js');
const Usuario = require('../models/usuario.js');
const mongoose = require('mongoose');

class VehiculoController { // Controlador para manejar las rutas de vehículos
  async crearVehiculo(req, res) { // Crea un nuevo vehículo
    try {
      const { matricula, modelo, marca, dueño } = req.body; // Datos del vehículo

      if (!matricula || !modelo || !marca || !dueño) { // Validar campos requeridos
        return res.status(400).json({
          success: false,
          message: 'Los campos matricula, modelo, marca y dueño son requeridos'
        });
      }

      const usuarioDueño = await Usuario.findById(dueño); // Verificar que el dueño existe
      if (!usuarioDueño) {
        return res.status(404).json({
          success: false,
          message: 'Dueño no encontrado'
        });
      }

      if (usuarioDueño.rol !== 'Dueño') { // Verificar que el dueño tiene el rol correcto
        return res.status(400).json({
          success: false,
          message: 'El usuario debe tener rol DUEÑO para ser dueño de un vehículo'
        });
      }

      const vehiculoExistente = await Vehiculo.findOne({ matricula: matricula.toUpperCase() }); // Verificar que no exista otro vehículo con la misma matrícula
      if (vehiculoExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un vehículo con esta matrícula'
        });
      }

      const nuevoVehiculo = new Vehiculo({ // Crear instancia del vehículo
        matricula: matricula.toUpperCase(),
        modelo,
        marca,
        dueño
      });

      const vehiculoGuardado = await nuevoVehiculo.save(); // Guardar en la base de datos
      await vehiculoGuardado.populate('dueño', 'nombre apellido email telefono'); // Poblar datos del dueño

      res.status(201).json({ // Respuesta exitosa
        success: true,
        message: 'Vehículo creado exitosamente',
        data: vehiculoGuardado
      });

    } catch (error) { // Manejo de errores
      res.status(400).json({
        success: false,
        message: 'Error al crear vehículo',
        error: error.message
      });
    }
  }

  async obtenerVehiculo(req, res) { // Obtiene un vehículo por ID
    try {
      const { id } = req.params; // ID del vehículo

      const vehiculo = await Vehiculo.findById(id) // Buscar vehículo por ID
        .populate('dueño', 'nombre apellido email telefono'); // Poblar datos del dueño

      if (!vehiculo) { // Verificar que el vehículo existe
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado'
        });
      }

      res.json({ // Respuesta exitosa
        success: true,
        data: vehiculo
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: 'Error al obtener vehículo',
        error: error.message
      });
    }
  }

  async obtenerVehiculoPorMatricula(req, res) { // Obtiene un vehículo por matrícula
    try {
      const { matricula } = req.params; // Matrícula del vehículo

      const vehiculo = await Vehiculo.findOne({ matricula: matricula.toUpperCase() }) // Buscar vehículo por matrícula
        .populate('dueño', 'nombre apellido email telefono'); // Poblar datos del dueño

      if (!vehiculo) { // Verificar que el vehículo existe
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado'
        });
      }

      res.json({ // Respuesta exitosa
        success: true,
        data: vehiculo
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: 'Error al obtener vehículo por matrícula',
        error: error.message
      });
    }
  }

  async listarVehiculos(req, res) { // Lista vehículos con filtros opcionales
    try {
      const { marca, modelo, dueño, limit = 50 } = req.query; // Filtros de consulta
      
      const filtros = {}; // Construir filtros dinámicamente
      if (marca) filtros.marca = new RegExp(marca, 'i');  
      if (modelo) filtros.modelo = new RegExp(modelo, 'i');
      if (dueño) filtros.dueño = dueño;

      const vehiculos = await Vehiculo.find(filtros) // Buscar vehículos con filtros
        .populate('dueño', 'nombre apellido email telefono') // Poblar datos del dueño
        .sort({ marca: 1, modelo: 1 }) // Ordenar por marca y modelo
        .limit(parseInt(limit)); // Limitar resultados

      res.json({ // Respuesta exitosa
        success: true,
        count: vehiculos.length,
        data: vehiculos
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: 'Error al listar vehículos',
        error: error.message
      });
    }
  }

  async obtenerVehiculosPorDueño(req, res) { // Obtiene vehículos por ID de dueño
    try {
      const { dueñoId } = req.params; // ID del dueño

      const dueño = await Usuario.findById(dueñoId); // Verificar que el dueño existe
      if (!dueño) { 
        return res.status(404).json({
          success: false,
          message: 'Dueño no encontrado'
        });
      }

      const vehiculos = await Vehiculo.find({ dueño: dueñoId }) // Buscar vehículos del dueño
        .populate('dueño', 'nombre apellido email telefono') // Poblar datos del dueño
        .sort({ marca: 1, modelo: 1 }); // Ordenar por marca y modelo

      res.json({ // Respuesta exitosa
        success: true,
        count: vehiculos.length,
        data: vehiculos
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: 'Error al obtener vehículos del dueño',
        error: error.message
      });
    }
  }

  async actualizarVehiculo(req, res) { // Actualiza un vehículo existente
    try {
      const { id } = req.params; // ID del vehículo a actualizar
      const { modelo, marca, año, color } = req.body; // Datos a actualizar

      const vehiculo = await Vehiculo.findById(id); // Buscar vehículo por ID
      if (!vehiculo) { 
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado'
        });
      }

      // Actualizar campos permitidos (no se puede cambiar matrícula ni dueño)
      if (modelo) vehiculo.modelo = modelo;
      if (marca) vehiculo.marca = marca;

      const vehiculoActualizado = await vehiculo.save(); // Guardar cambios
      await vehiculoActualizado.populate('dueño', 'nombre apellido email telefono'); // Poblar datos del dueño

      res.json({ // Respuesta exitosa
        success: true,
        message: 'Vehículo actualizado exitosamente',
        data: vehiculoActualizado
      });

    } catch (error) { // Manejo de errores
      res.status(400).json({
        success: false,
        message: 'Error al actualizar vehículo',
        error: error.message
      });
    }
  }
 
  async eliminarVehiculo(req, res) { // Elimina un vehículo por ID
    try {
      const { id } = req.params; // ID del vehículo a eliminar

      const vehiculo = await Vehiculo.findByIdAndDelete(id); // Eliminar vehículo por ID
      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado'
        });
      }

      res.json({ // Respuesta exitosa
        success: true,
        message: 'Vehículo eliminado exitosamente'
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: 'Error al eliminar vehículo',
        error: error.message
      });
    }
  }
}

module.exports = new VehiculoController(); // Exportar una instancia del controlador