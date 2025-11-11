const ChequeoService = require('../services/chequeoService.js');
const ChequeoRepository = require('../repositories/chequeoRepositorio.js');
const TurnoRepository = require('../repositories/turnoRepositorio.js');

// Inyección de dependencias
const chequeoRepository = new ChequeoRepository();
const turnoRepository = new TurnoRepository();
const chequeoService = new ChequeoService(chequeoRepository, turnoRepository);

class ChequeoController { // Controlador para manejar las rutas de chequeos
  async realizarChequeo(req, res) { // Realiza un nuevo chequeo
    try {
      const { turno, tecnico, puntuaciones, observaciones_generales } = req.body; // Datos del chequeo

      if (!turno || !tecnico || !puntuaciones) { // Validar campos requeridos
        return res.status(400).json({
          success: false,
          message: 'Los campos turno, tecnico y puntuaciones son requeridos'
        });
      }

      if (!Array.isArray(puntuaciones) || puntuaciones.length !== 8) { // Validar que haya 8 puntuaciones
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar exactamente 8 puntuaciones'
        });
      }

       // Validar rango de puntuaciones (1-10)
      for (let i = 0; i < puntuaciones.length; i++) {
        if (puntuaciones[i] < 1 || puntuaciones[i] > 10) {
          return res.status(400).json({
            success: false,
            message: `La puntuación ${i + 1} debe estar entre 1 y 10`
          });
        }
      }

      const datosChequeo = { // Estructura de datos para el chequeo
        turno,
        tecnico,
        puntuaciones: puntuaciones.map((p, index) => ({
          punto: `Punto ${index + 1}`,
          valor: p,
          observaciones: ''
        })),
        observaciones_generales,
        fecha_chequeo: new Date()
      };

      const chequeo = await chequeoService.realizarChequeo(datosChequeo); // Llamada al servicio para realizar el chequeo

        // Informar observaciones automáticas
      let mensaje = 'Chequeo realizado exitosamente';
      if (chequeo.resultado === 'Rechequeo') {
        mensaje += '. El vehículo requiere rechequeo.';
      }

      res.status(201).json({ // Respuesta exitosa
        success: true,
        message: 'Chequeo realizado exitosamente',
        data: chequeo
      });

    } catch (error) { // Manejo de errores
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async obtenerChequeo(req, res) { // Obtiene un chequeo por ID
    try {
      const { id } = req.params; // ID del chequeo

      const chequeo = await chequeoService.obtenerChequeoPorId(id); // Llamada al servicio para obtener el chequeo

      res.json({ // Respuesta exitosa
        success: true,
        data: chequeo
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async obtenerChequeosPorVehiculo(req, res) { // Obtiene chequeos por ID de vehículo
    try {
      const { vehiculoId } = req.params; // ID del vehículo

      const chequeos = await chequeoService.obtenerChequeosPorVehiculo(vehiculoId); // Llamada al servicio para obtener los chequeos

      res.json({ // Respuesta exitosa
        success: true,
        count: chequeos.length,
        data: chequeos
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarChequeos(req, res) { // Lista chequeos
    try {
      const { tecnico, resultado, fecha_desde, fecha_hasta, limit = 50 } = req.query; // Filtros de consulta

      const filtros = {}; // Construir filtros dinámicamente
      if (tecnico) filtros.tecnico = tecnico; // Agregar filtro por técnico
      if (resultado) filtros.resultado = resultado; // Agregar filtro por resultado
      if (fecha_desde || fecha_hasta) { // Agregar filtro por rango de fechas
        filtros.fecha_desde = fecha_desde;
        filtros.fecha_hasta = fecha_hasta;
      }
      if (limit) filtros.limit = parseInt(limit); // Límite de resultados

      const chequeos = await chequeoService.listarChequeos(filtros); // Llamada al servicio para listar chequeos

      res.json({ // Respuesta exitosa
        success: true,
        count: chequeos.length,
        data: chequeos
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async calcularResultado(req, res) { // Calcula el resultado del chequeo basado en puntuaciones
    try {
      const { puntuaciones } = req.body; // Array de puntuaciones

      if (!puntuaciones || !Array.isArray(puntuaciones) || puntuaciones.length !== 8) { // Validar que haya 8 puntuaciones
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un array de 8 puntuaciones'
        });
      }

      for (let i = 0; i < puntuaciones.length; i++) { // Validar que cada puntuación esté entre 1 y 10
        if (puntuaciones[i] < 1 || puntuaciones[i] > 10) { // Validar rango de puntuación
          return res.status(400).json({
            success: false,
            message: `La puntuación ${i + 1} debe estar entre 1 y 10`
          });
        }
      }

      const puntuacionTotal = chequeoService.calcularPuntuacionTotal(puntuaciones); // Calcular puntuación total
      const resultado = chequeoService.determinarResultado(puntuaciones); // Determinar resultado basado en puntuaciones
      const observaciones = chequeoService.generarObservacionesAutomaticas(puntuaciones, resultado); // Generar observaciones automáticas

      res.json({ // Respuesta exitosa
        success: true,
        data: {
          puntuaciones,
          puntuacion_total: puntuacionTotal,
          resultado,
          observaciones
        }
      });

    } catch (error) { // Manejo de errores
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async actualizarChequeo(req, res) { // Actualiza un chequeo existente
    try {
      const { id } = req.params; // ID del chequeo a actualizar
      const { puntuaciones, observaciones_generales } = req.body; // Datos a actualizar

      const datosActualizacion = {}; // Objeto para almacenar los datos a actualizar
      if (puntuaciones) {
        if (!Array.isArray(puntuaciones) || puntuaciones.length !== 8) { // Validar que haya 8 puntuaciones
          return res.status(400).json({
            success: false,
            message: 'Debe proporcionar exactamente 8 puntuaciones'
          });
        }
        datosActualizacion.puntuaciones = puntuaciones.map((p, index) => ({ // Mapear puntuaciones al formato esperado
          punto: `Punto ${index + 1}`,
          valor: p,
          observaciones: ''
        }));
      }
      if (observaciones_generales) { // Actualizar observaciones generales si se proporcionan
        datosActualizacion.observaciones_generales = observaciones_generales; 
      }

      const chequeo = await chequeoService.actualizarChequeo(id, datosActualizacion); // Llamada al servicio para actualizar el chequeo

      res.json({ // Respuesta exitosa
        success: true,
        message: 'Chequeo actualizado exitosamente',
        data: chequeo
      });

    } catch (error) { // Manejo de errores
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ChequeoController(); // Exportar una instancia del controlador