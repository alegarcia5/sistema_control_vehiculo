const TurnoService = require('../../services/turnoService.js');
const TurnoRepository = require('../../repositories/turnoRepositorio.js');
const Vehiculo = require('../../models/vehiculo.js');

jest.mock('../../repositories/turnoRepositorio.js');
jest.mock('../../models/vehiculo.js');

describe('TurnoService - Unit Tests', () => {
    let turnoService;
    let mockTurnoRepo;

    beforeEach(() => {
        mockTurnoRepo = new TurnoRepository();
        turnoService = new TurnoService(mockTurnoRepo);
        jest.clearAllMocks();
    });

    describe('Cambios de estado de turnos', () => {
        test('debe confirmar turno exitosamente cuando está pendiente', async () => {
            const turnoId = 'turno_pendiente_id';
            const turnoMock = {
                _id: turnoId,
                estado: 'Pendiente',
                fecha: new Date('2024-12-01T10:00:00Z'),
                vehiculo: 'vehiculo_valido_id'
            };

            mockTurnoRepo.obtenerPorId.mockResolvedValue(turnoMock);
            mockTurnoRepo.actualizarEstado.mockResolvedValue({
                ...turnoMock,
                estado: 'Confirmado'
            });

            const resultado = await turnoService.confirmarTurno(turnoId);

            expect(resultado.estado).toBe('Confirmado');
            expect(mockTurnoRepo.actualizarEstado).toHaveBeenCalledWith(
                turnoId,
                'Confirmado'
            );
        });

        test('debe cancelar turno exitosamente cuando está pendiente', async () => {
            const turnoId = 'turno_pendiente_id';
            const turnoMock = {
                _id: turnoId,
                estado: 'Pendiente'
            };

            mockTurnoRepo.obtenerPorId.mockResolvedValue(turnoMock);
            mockTurnoRepo.actualizarEstado.mockResolvedValue({
                ...turnoMock,
                estado: 'Cancelado'
            });

            const resultado = await turnoService.cancelarTurno(turnoId);

            expect(resultado.estado).toBe('Cancelado');
            expect(mockTurnoRepo.actualizarEstado).toHaveBeenCalledWith(
                turnoId,
                'Cancelado'
            );
        });

        test('debe lanzar error al confirmar turno no pendiente', async () => {
            const turnoId = 'turno_cancelado_id';
            const turnoMock = {
                _id: turnoId,
                estado: 'Cancelado'
            };

            mockTurnoRepo.obtenerPorId.mockResolvedValue(turnoMock);

            await expect(turnoService.confirmarTurno(turnoId))
            .rejects.toThrow('El turno no puede ser confirmado en su estado actual');
        });
    });

    describe('Gestión de disponibilidad de turnos', () => {
        test('debe obtener turnos disponibles para una fecha específica', async () => {
            const fecha = '2024-12-01';
            const turnosDisponibles = [
            { 
                _id: 'turno_disponible_1', 
                fecha: new Date('2024-12-01T10:00:00Z'), 
                estado: 'Pendiente',
                vehiculo: 'vehiculo_1'
            },
            { 
                _id: 'turno_disponible_2', 
                fecha: new Date('2024-12-01T11:00:00Z'), 
                estado: 'Pendiente',
                vehiculo: 'vehiculo_2'
            }
            ];

            mockTurnoRepo.obtenerDisponibles.mockResolvedValue(turnosDisponibles);

            const resultado = await turnoService.obtenerTurnosDisponibles(fecha);

            expect(resultado).toHaveLength(2);
            expect(resultado[0]._id).toBe('turno_disponible_1');
            expect(mockTurnoRepo.obtenerDisponibles).toHaveBeenCalledWith(fecha);
        });
    });

    describe('Validación de conflictos de horarios', () => {
        test('debe solicitar turno exitosamente sin conflictos', async () => {
            const datosTurno = {
                fecha: new Date('2024-12-01T10:00:00Z'),
                vehiculo: 'vehiculo_valido_id'
            };

            const vehiculoMock = { 
                _id: datosTurno.vehiculo,
                matricula: 'ABC123',
                modelo: 'Corolla',
                marca: 'Toyota'
            };

            const turnoCreado = { 
                ...datosTurno, 
                estado: 'Pendiente', 
            _id: 'nuevo_turno_id' 
            };

            Vehiculo.findById.mockResolvedValue(vehiculoMock);
            mockTurnoRepo.existeConflicto.mockResolvedValue(false);
            mockTurnoRepo.crear.mockResolvedValue(turnoCreado);

            const resultado = await turnoService.solicitarTurno(datosTurno);

            expect(resultado.estado).toBe('Pendiente');
            expect(resultado._id).toBe('nuevo_turno_id');
            expect(mockTurnoRepo.existeConflicto).toHaveBeenCalledWith(
                datosTurno.fecha,
                datosTurno.vehiculo
            );
        });

        test('debe lanzar error cuando hay conflicto de horario', async () => {
            const datosTurno = {
                fecha: new Date('2024-12-01T10:00:00Z'),
                vehiculo: 'vehiculo_valido_id'
            };

            Vehiculo.findById.mockResolvedValue({ _id: datosTurno.vehiculo });
            mockTurnoRepo.existeConflicto.mockResolvedValue(true);

            await expect(turnoService.solicitarTurno(datosTurno))
            .rejects.toThrow('Ya existe un turno programado para este vehículo en la fecha seleccionada');
        });
    });
});