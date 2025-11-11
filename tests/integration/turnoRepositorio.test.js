const mongoose = require('mongoose');
const dbClient = require('../../config/dbClient');
const TurnoRepositorio = require('../../repositories/turnoRepositorio');
const Usuario = require('../../models/usuario');
const Vehiculo = require('../../models/vehiculo');
const Turno = require('../../models/turno');

describe('TurnoRepositorio - Integration Tests', () => {
  let turnoRepositorio;
  let testUsuarioId, testVehiculoId;

  beforeAll(async () => {
    await dbClient.conectarBD();
    turnoRepositorio = new TurnoRepositorio();
  });

  beforeEach(async () => {
    const timestamp = Date.now();
    const usuario = await Usuario.create({
      nombre: 'Test', apellido: 'User', email: `test${timestamp}@test.com`,
      telefono: `123${timestamp}`, rol: 'Dueño', password_hash: 'test123'
    });
    testUsuarioId = usuario._id;

    const vehiculo = await Vehiculo.create({
      matricula: `TEST${timestamp}`, modelo: 'Test Model', marca: 'Test Brand', dueño: testUsuarioId
    });
    testVehiculoId = vehiculo._id;
  });

  afterEach(async () => {
    await Usuario.deleteMany({});
    await Vehiculo.deleteMany({});
    await Turno.deleteMany({});
  });

  afterAll(async () => {
    await dbClient.desconectarBD();
  });

  test('debe crear un turno exitosamente', async () => {
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 1);

    const datosTurno = { estado: 'Pendiente', fecha: fechaFutura, vehiculo: testVehiculoId };
    const turno = await turnoRepositorio.crear(datosTurno);

    expect(turno).toHaveProperty('_id');
    expect(turno.estado).toBe('Pendiente');
  });

  test('debe obtener un turno por ID', async () => {
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 1);

    const turnoCreado = await Turno.create({
      estado: 'Pendiente', fecha: fechaFutura, vehiculo: testVehiculoId
    });

    const turno = await turnoRepositorio.obtenerPorId(turnoCreado._id);
  });
});