const ChequeoService = require('../../services/chequeoService.js');
const ChequeoRepository = require('../../repositories/chequeoRepositorio.js');
const TurnoRepository = require('../../repositories/turnoRepositorio.js');

jest.mock('../../repositories/chequeoRepositorio.js');
jest.mock('../../repositories/turnoRepositorio.js');

describe('ChequeoService - Unit Tests', () => {
    let chequeoService;
    let mockChequeoRepo;
    let mockTurnoRepo;

    beforeEach(() => {
        mockChequeoRepo = new ChequeoRepository();
        mockTurnoRepo = new TurnoRepository();
        chequeoService = new ChequeoService(mockChequeoRepo, mockTurnoRepo);
        jest.clearAllMocks();
    });

    describe('Cálculo de puntuación total', () => {
        test('debe calcular correctamente la puntuación total con 8 valores', () => {
            const puntuaciones = [8, 9, 7, 10, 8, 9, 10, 9];
            const total = chequeoService.calcularPuntuacionTotal(puntuaciones);
            expect(total).toBe(70);
        });

        test('debe lanzar error si no hay exactamente 8 puntuaciones', () => {
            const puntuaciones = [8, 9, 7];
            expect(() => {
                chequeoService.calcularPuntuacionTotal(puntuaciones);
            }).toThrow('Debe proporcionar 8 puntuaciones');
        });

        test('debe lanzar error si alguna puntuación es menor a 1', () => {
            const puntuaciones = [8, 9, 7, 10, 8, 0, 10, 9];
            expect(() => {
                chequeoService.calcularPuntuacionTotal(puntuaciones);
            }).toThrow('Las puntuaciones deben estar entre 1 y 10');
        });

        test('debe lanzar error si alguna puntuación es mayor a 10', () => {
            const puntuaciones = [8, 9, 7, 10, 8, 11, 10, 9];
            expect(() => {
                chequeoService.calcularPuntuacionTotal(puntuaciones);
            }).toThrow('Las puntuaciones deben estar entre 1 y 10');
        });
    });

    describe('Determinación de resultado', () => {
        test('debe retornar "Aprobado" para puntuación total >= 80', () => {
            const puntuaciones = [10, 10, 10, 10, 10, 10, 10, 10];
            const resultado = chequeoService.determinarResultado(puntuaciones);
            expect(resultado).toBe('Aprobado');
        });

        test('debe retornar "Rechequeo" para puntuación total < 40', () => {
            const puntuaciones = [4, 4, 4, 4, 4, 4, 4, 4];
            const resultado = chequeoService.determinarResultado(puntuaciones);
            expect(resultado).toBe('Rechequeo');
        });

        test('debe retornar "Rechequeo" cuando alguna puntuación es < 5', () => {
            const puntuaciones = [10, 10, 10, 10, 10, 10, 10, 4]; // Total: 84 pero tiene un 4
            const resultado = chequeoService.determinarResultado(puntuaciones);
            expect(resultado).toBe('Rechequeo');
        });

        test('debe retornar "Rechazado" para otros casos', () => {
            const puntuaciones = [6, 6, 6, 6, 6, 6, 6, 6]; // Total: 48
            const resultado = chequeoService.determinarResultado(puntuaciones);
            expect(resultado).toBe('Rechazado');
        });
    });

    describe('Generación de observaciones automáticas', () => {
        test('debe generar observación para Rechequeo por puntuación total baja', () => {
            const puntuaciones = [4, 4, 4, 4, 4, 4, 4, 4]; // Total: 32
            const resultado = 'Rechequeo';
            const observaciones = chequeoService.generarObservacionesAutomaticas(puntuaciones, resultado);
            expect(observaciones).toContain('Puntuación total insuficiente (32/80)');
        });

        test('debe generar observación para Rechequeo por puntuaciones críticas', () => {
            const puntuaciones = [10, 10, 10, 10, 10, 10, 10, 4];
            const resultado = 'Rechequeo';
            const observaciones = chequeoService.generarObservacionesAutomaticas(puntuaciones, resultado);
            expect(observaciones).toContain('Puntuaciones críticas en los puntos de chequeo: 8');
        });

        test('debe generar observación para Aprobado', () => {
            const puntuaciones = [10, 10, 10, 10, 10, 10, 10, 10];
            const resultado = 'Aprobado';
            const observaciones = chequeoService.generarObservacionesAutomaticas(puntuaciones, resultado);
            expect(observaciones).toContain('Vehículo en condiciones óptimas');
        });

        test('debe generar observación para Rechazado', () => {
            const puntuaciones = [6, 6, 6, 6, 6, 6, 6, 6];
            const resultado = 'Rechazado';
            const observaciones = chequeoService.generarObservacionesAutomaticas(puntuaciones, resultado);
            expect(observaciones).toContain('Vehículo no aprobado');
        });
    });

    describe('Realizar chequeo', () => {
        test('debe realizar chequeo exitosamente cuando todo es válido', async () => {
            const datosChequeo = {
                turno: 'turno_valido_id',
                tecnico: 'tecnico_valido_id',
                puntuaciones: [8, 9, 7, 10, 8, 9, 10, 9]
            };

            const turnoMock = { _id: datosChequeo.turno, estado: 'Confirmado' };
            mockTurnoRepo.obtenerPorId.mockResolvedValue(turnoMock);
            mockChequeoRepo.obtenerPorTurno.mockResolvedValue(null);
            mockChequeoRepo.crear.mockResolvedValue({
                ...datosChequeo,
                puntuacion_total: 70,
                resultado: 'Rechazado',
                fecha_chequeo: new Date()
            });

            const chequeo = await chequeoService.realizarChequeo(datosChequeo);

            expect(chequeo).toHaveProperty('puntuacion_total', 70);
            expect(chequeo).toHaveProperty('resultado', 'Rechazado');
            expect(mockChequeoRepo.crear).toHaveBeenCalledTimes(1);
        });

        test('debe lanzar error si el turno no está confirmado', async () => {
            const datosChequeo = {
                turno: 'turno_pendiente_id',
                tecnico: 'tecnico_valido_id',
                puntuaciones: [8, 9, 7, 10, 8, 9, 10, 9]
            };

            const turnoMock = { _id: datosChequeo.turno, estado: 'Pendiente' };
            mockTurnoRepo.obtenerPorId.mockResolvedValue(turnoMock);

            await expect(chequeoService.realizarChequeo(datosChequeo))
            .rejects.toThrow('El turno debe estar confirmado para realizar el chequeo');
        });
    });
});