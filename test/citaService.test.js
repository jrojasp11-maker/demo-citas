// NUEVO: test/citaService.test.js (Node.js >= 18)
// Cuatro pruebas: las tres de referencia del taller y una cuarta propia del
// equipo (marcada como T4). No usan Express, DATABASE_URL ni PostgreSQL.
const test = require('node:test');
const assert = require('node:assert/strict');
const { crearCitaService } = require('../src/aplicacion/citaService');

function crearServicioParaPrueba(ocupado = false) {
  let guardadas = 0;
  const servicio = crearCitaService({
    citaRepository: {
      listarTodas: async () => [],
      existeEnHorario: async () => ocupado,
      guardar: async () => { guardadas++; return 7; }
    },
    profesionalRepository: { listarTodos: async () => [] },
    reloj: () => new Date('2026-10-01T00:00:00Z')
  });
  return { servicio, guardadas: () => guardadas };
}

test('reserva permitida', async () => {
  const x = crearServicioParaPrueba();
  const respuesta = await x.servicio.reservarCita({
    paciente: 'Ana', profesional_id: 1,
    fecha_hora: '2026-11-15T10:00:00Z'
  });
  assert.equal(respuesta.id, 7);
  assert.equal(x.guardadas(), 1);
});

test('agenda ocupada no genera escritura', async () => {
  const x = crearServicioParaPrueba(true);
  await assert.rejects(() => x.servicio.reservarCita({
    paciente: 'Ana', profesional_id: 1,
    fecha_hora: '2026-11-15T10:00:00Z'
  }), { codigo: 'AGENDA_OCUPADA' });
  assert.equal(x.guardadas(), 0);
});

test('fecha pasada se rechaza sin consultar PostgreSQL', async () => {
  const x = crearServicioParaPrueba();
  await assert.rejects(() => x.servicio.reservarCita({
    paciente: 'Ana', profesional_id: 1,
    fecha_hora: '2026-09-01T10:00:00Z'
  }), { codigo: 'FECHA_PASADA' });
  assert.equal(x.guardadas(), 0);
});

// T4 — Prueba propia del equipo: el contrato detecta repositorios incompletos.
// Condición inicial: crearCitaService recibe un citaRepository SIN guardar()
// (cumple listarTodas y existeEnHorario, falla en el tercer método).
// Resultado esperado: TypeError en el momento del ensamblaje que nombra el
// método faltante, antes de existir una instancia del servicio.
// Observación al ejecutarla: el error aparece al construir el servicio (como
// lo haría server.js al arrancar), no durante una petición HTTP ni contra la
// base de datos; demuestra que verificarRepositorios() protege la frontera
// de inyección de dependencias.
test('T4: contrato rechaza un repositorio incompleto al ensamblar', () => {
  assert.throws(
    () => crearCitaService({
      citaRepository: {
        listarTodas: async () => [],
        existeEnHorario: async () => false
        // falta guardar()
      },
      profesionalRepository: { listarTodos: async () => [] }
    }),
    (error) => error instanceof TypeError && /guardar/.test(error.message)
      && /citaRepository/.test(error.message)
  );
});
