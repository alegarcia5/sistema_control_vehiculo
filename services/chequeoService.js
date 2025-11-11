const ChequeoRepository = require('../repositories/chequeoRepositorio.js');
const TurnoRepository = require('../repositories/turnoRepositorio.js');

class ChequeoService { 
  constructor(chequeoRepository, turnoRepository) {
    this.chequeoRepository = chequeoRepository;
    this.turnoRepository = turnoRepository;
  } // Inyección de dependencias, facilita testing y mantenimiento, permite cambiar repositorios sin modificar la lógica de negocio
  
  async realizarChequeo(datosChequeo) { // datosChequeo incluye: turno, vehiculo, y las 8 puntuaciones
    try { // Verificar que el turno existe y está confirmado
      const turno = await this.turnoRepository.obtenerPorId(datosChequeo.turno); // esto hace que el turno exista y esté confirmado 
      if (!turno) {
        throw new Error('Turno no encontrado');
      }
      
      if (turno.estado !== 'Confirmado') {
        throw new Error('El turno debe estar confirmado para realizar el chequeo');
      }
      
      const chequeoExistente = await this.chequeoRepository.obtenerPorTurno(datosChequeo.turno); // Verificar que no exista un chequeo previo para el mismo turno
      if (chequeoExistente) {
        throw new Error('Ya existe un chequeo para este turno');
      }
      
      const datosChequeoCompleto = { // Calcular puntuación total, resultado y observaciones automáticas
        datosChequeo, 
        fecha_chequeo: new Date() // Fecha actual
      };
      
    const chequeo = await this.chequeoRepository.crear(datosChequeoCompleto); // Crear el chequeo en la base de datos
      
      return chequeo; // Retornar el chequeo creado
      
    } catch (error) {
      throw new Error(`Error al realizar chequeo: ${error.message}`); // Manejo de errores
    }
  }
  
  async obtenerChequeoPorId(id) { // Obtener un chequeo por su ID
    try {
      const chequeo = await this.chequeoRepository.obtenerPorId(id); // Buscar el chequeo en la base de datos
      if (!chequeo) {
        throw new Error('Chequeo no encontrado');
      }
      return chequeo;
    } catch (error) {
    throw new Error(`Error al obtener chequeo: ${error.message}`); // Manejo de errores
    }
  }
  
  async obtenerChequeosPorVehiculo(vehiculoId) { // Obtener todos los chequeos de un vehículo específico
    try {
      return await this.chequeoRepository.obtenerPorVehiculo(vehiculoId); // Buscar chequeos en la base de datos
    } catch (error) {
      throw new Error(`Error al obtener chequeos del vehículo: ${error.message}`); // Manejo de errores
    }
  }
  
  async listarChequeos(filtros = {}) { // Listar chequeos con filtros opcionales (fecha, resultado, vehículo, etc.)
    try {
      return await this.chequeoRepository.listar(filtros); // Buscar chequeos en la base de datos con los filtros proporcionados
    } catch (error) {
      throw new Error(`Error al listar chequeos: ${error.message}`); // Manejo de errores
    }
  }
  
  async actualizarChequeo(id, datosActualizacion) { // Actualizar un chequeo existente
    try {
      const chequeo = await this.chequeoRepository.obtenerPorId(id); // Verificar que el chequeo existe
      if (!chequeo) {
        throw new Error('Chequeo no encontrado');
      }
      
      return await this.chequeoRepository.actualizar(id, datosActualizacion); // Actualizar el chequeo en la base de datos y retornar el chequeo actualizado
    } catch (error) {
      throw new Error(`Error al actualizar chequeo: ${error.message}`); // Manejo de errores
    }
  }
  
  calcularPuntuacionTotal(puntuaciones) { // Calcular la puntuación total a partir de las 8 puntuaciones individuales
    if (!Array.isArray(puntuaciones) || puntuaciones.length !== 8) { // Validar que sean 8 puntuaciones
      throw new Error('Debe proporcionar 8 puntuaciones');
    }
    
    return puntuaciones.reduce((total, puntuacion) => { // Sumar las puntuaciones
      if (puntuacion < 1 || puntuacion > 10) { // Validar que cada puntuación esté entre 1 y 10
        throw new Error('Las puntuaciones deben estar entre 1 y 10');
      }
      return total + puntuacion; // Retornar la suma total
    }, 0); // Valor inicial de la suma es 0
  }
  
  determinarResultado(puntuaciones) { // Determinar el resultado del chequeo basado en las reglas definidas
    const total = this.calcularPuntuacionTotal(puntuaciones); // Calcular la puntuación total
    const minPuntuacion = Math.min(...puntuaciones); // Encontrar la puntuación mínima
    
    if (total >= 80) {
      return 'Aprobado';
    } else if (total < 40 || minPuntuacion < 5) {
      return 'Rechequeo';
    } else {
      return 'Rechazado';
    }
  }
  
  generarObservacionesAutomaticas(puntuaciones, resultado) { // Generar observaciones automáticas basadas en las puntuaciones y el resultado
    const total = this.calcularPuntuacionTotal(puntuaciones); // Calcular la puntuación total
    const minPuntuacion = Math.min(...puntuaciones); // Encontrar la puntuación mínima
    
    if (resultado === 'Rechequeo') {
      if (total < 40) {
        return `Puntuación total insuficiente (${total}/80). Se requiere revisión completa del vehículo.`;
      } else if (minPuntuacion < 5) {
        const puntosBajos = puntuaciones
          .map((p, i) => p < 5 ? i + 1 : null)
          .filter(p => p !== null);
        return `Puntuaciones críticas en los puntos de chequeo: ${puntosBajos.join(', ')}. Revisión específica requerida.`;
      }
    } else if (resultado === 'Aprobado') {
      return 'Vehículo en condiciones óptimas. Todas las puntuaciones dentro de los parámetros aceptables.';
    } else {
      return 'Vehículo no aprobado. Se recomienda realizar las reparaciones necesarias.';
    }
    
    return 'Sin observaciones específicas.';
  }
}

module.exports = ChequeoService; // exportar la clase para su uso en otras partes de la aplicación