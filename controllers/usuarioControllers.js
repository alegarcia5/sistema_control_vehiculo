import Usuario from './models/usuario.js';
import bcrypt from 'bcryptjs'; // Importar bcrypt para hashear contraseñas

class UsuarioController {
  async crearUsuario(req, res) { // Crear un nuevo usuario
    try {
      const { nombre, apellido, email, telefono, password, rol } = req.body; // Extraer datos del cuerpo de la solicitud

      if (!nombre || !apellido || !email || !telefono || !password || !rol) { // Validar campos requeridos
        return res.status(400).json({
          success: false, // Responder con error si faltan campos
          message: 'Todos los campos son requeridos: nombre, apellido, email, telefono, password, rol'
        });
      }

      const usuarioExistente = await Usuario.findOne({ email }); // Verificar si el email ya está registrado
      if (usuarioExistente) {
        return res.status(400).json({
          success: false, // Responder con error si el email ya existe
          message: 'Ya existe un usuario con este email'
        });
      }

      const nuevoUsuario = new Usuario({ // Crear una instancia del modelo Usuario
        nombre,
        apellido,
        email,
        telefono,
        password_hash: await bcrypt.hash(password, 10), // Hashear la contraseña
        rol
      });

      const usuarioGuardado = await nuevoUsuario.save(); // Guardar el usuario en la base de datos

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuarioGuardado
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear usuario',
        error: error.message
      });
    }
  }

  async obtenerUsuario(req, res) { // Obtener un usuario por ID
    try {
      const { id } = req.params;

      const usuario = await Usuario.findById(id); // Buscar el usuario en la base de datos por ID
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: usuario
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario',
        error: error.message
      });
    }
  }

  async listarUsuarios(req, res) { // Listar todos los usuarios con filtros opcionales
    try {
      const { rol, limit = 50 } = req.query; // Extraer filtros de la consulta
      
      const filtros = {}; // Construir filtros dinámicos
      if (rol) { 
        filtros.rol = rol; // Filtrar por rol si se proporciona
      }

      const usuarios = await Usuario.find(filtros) // Consultar la base de datos con los filtros
        .sort({ nombre: 1, apellido: 1 }) // Ordenar por nombre y apellido
        .limit(parseInt(limit)); // Limitar la cantidad de resultados

      res.json({ // Responder con la lista de usuarios
        success: true,
        count: usuarios.length,
        data: usuarios
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: 'Error al listar usuarios',
        error: error.message
      });
    }
  }

  async actualizarUsuario(req, res) { // Actualizar un usuario existente
    try {
      const { id } = req.params; // Extraer ID del usuario de los parámetros de la ruta
      const { nombre, apellido, telefono, rol } = req.body; // Extraer campos a actualizar del cuerpo de la solicitud

      const usuario = await Usuario.findById(id); // Buscar el usuario en la base de datos por ID
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Actualizar campos permitidos
      if (nombre) usuario.nombre = nombre;
      if (apellido) usuario.apellido = apellido;
      if (telefono) usuario.telefono = telefono;
      if (rol) usuario.rol = rol;

      const usuarioActualizado = await usuario.save(); // Guardar los cambios en la base de datos

      res.json({ // Responder con éxito
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado
      });

    } catch (error) { // Manejo de errores
      res.status(400).json({
        success: false,
        message: 'Error al actualizar usuario',
        error: error.message
      });
    }
  }

  async eliminarUsuario(req, res) { // Eliminar un usuario por ID
    try {
      const { id } = req.params; // Extraer ID del usuario de los parámetros de la ruta

      const usuario = await Usuario.findByIdAndDelete(id); // Eliminar el usuario de la base de datos por ID
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({ // Responder con éxito
        success: true,
        message: 'Usuario eliminado exitosamente'
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario',
        error: error.message
      });
    }
  }

  async obtenerTecnicos(req, res) { // Obtener todos los usuarios con rol de técnico
    try {
      const tecnicos = await Usuario.find({ rol: 'Tecnico' }) // Buscar usuarios con rol 'Tecnico'
        .select('nombre apellido email telefono') // Seleccionar solo campos relevantes
        .sort({ nombre: 1 }); // Ordenar por nombre

      res.json({ // Responder con la lista de técnicos
        success: true,
        count: tecnicos.length,
        data: tecnicos
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: 'Error al obtener técnicos',
        error: error.message
      });
    }
  }

  async obtenerDueños(req, res) { // Obtener todos los usuarios con rol de dueño
    try {
      const dueños = await Usuario.find({ rol: 'Dueño' }) // Buscar usuarios con rol 'Dueño'
        .select('nombre apellido email telefono') // Seleccionar solo campos relevantes
        .sort({ nombre: 1 }); // Ordenar por nombre

      res.json({ // Responder con la lista de dueños
        success: true,
        count: dueños.length,
        data: dueños
      });

    } catch (error) { // Manejo de errores
      res.status(500).json({
        success: false,
        message: 'Error al obtener dueños',
        error: error.message
      });
    }
  }
}

export default new UsuarioController(); // Exportar una instancia del controlador