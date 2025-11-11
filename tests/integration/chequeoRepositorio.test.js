const mongoose = require('mongoose');
const dbClient = require('../../config/dbClient');
const ChequeoRepositorio = require('../../repositories/chequeoRepositorio');
const Usuario = require('../../models/usuario');
const Vehiculo = require('../../models/vehiculo');
const Turno = require('../../models/turno');
const Chequeo = require('../../models/chequeo');

describe('ChequeoRepositorio - Integration Tests', () => {
  let chequeoRepositorio;
  let testUsuarioId, testVehiculoId, testTecnicoId, testTurnoId;

  beforeAll(async () => {
    await dbClient.conectarBD();
    chequeoRepositorio = new ChequeoRepositorio();
  });

  beforeEach(async () => {
    const timestamp = Date.now();
    
    const usuario = await Usuario.create({
      nombre: 'Juan', apellido: 'Perez', email: `juan${timestamp}@test.com`,
      telefono: `123${timestamp}`, rol: 'Dueño', password_hash: 'test123'
    });
    testUsuarioId = usuario._id;

    const tecnico = await Usuario.create({
      nombre: 'Carlos', apellido: 'Gomez', email: `carlos${timestamp}@test.com`,
      telefono: `987${timestamp}`, rol: 'Tecnico', password_hash: 'test123'
    });
    testTecnicoId = tecnico._id;

    const vehiculo = await Vehiculo.create({
      matricula: `TEST${timestamp}`, modelo: 'Corolla', marca: 'Toyota', dueño: testUsuarioId
    });
    testVehiculoId = vehiculo._id;

    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 1);
    const turno = await Turno.create({
      estado: 'Confirmado', fecha: fechaFutura, vehiculo: testVehiculoId
    });
    testTurnoId = turno._id;

    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    await Usuario.deleteMany({});
    await Vehiculo.deleteMany({});
    await Turno.deleteMany({});
    await Chequeo.deleteMany({});
  });

  afterAll(async () => {
    await dbClient.desconectarBD();
  });

  test('debe crear un chequeo exitosamente', async () => {
    const datosChequeo = {
      turno: testTurnoId, tecnico: testTecnicoId, puntuacion_total: 70,
      resultado: 'Rechazado', observaciones_generales: 'Test',
      puntuaciones: Array(8).fill().map((_, i) => ({
        punto: `Punto ${i+1}`, valor: 8, observaciones: ''
      }))
    };

    const chequeo = await chequeoRepositorio.crear(datosChequeo);
    expect(chequeo).toHaveProperty('_id');
    expect(chequeo.puntuacion_total).toBe(70);
  });
});