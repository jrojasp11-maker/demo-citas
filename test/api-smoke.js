// NUEVO: test/api-smoke.js (verificación HTTP local)
// Solo para una BD propia de pruebas. Este script crea una cita.
// Uso:  Terminal 1 -> npm start     Terminal 2 -> node test/api-smoke.js
const assert = require('node:assert/strict');
const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function solicitar(metodo, ruta, datos) {
  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: datos ? { 'Content-Type': 'application/json' } : {},
    body: datos ? JSON.stringify(datos) : undefined
  });
  const cuerpo = await respuesta.json();
  return { estado: respuesta.status, cuerpo };
}

async function verificar() {
  const salud = await solicitar('GET', '/api/salud');
  assert.equal(salud.estado, 200);
  const prof = await solicitar('GET', '/api/profesionales');
  assert.equal(prof.estado, 200);
  assert.ok(Array.isArray(prof.cuerpo) && prof.cuerpo.length > 0,
    'La BD de pruebas debe contener al menos un profesional');
  const citas = await solicitar('GET', '/api/citas');
  assert.equal(citas.estado, 200);
  assert.ok(Array.isArray(citas.cuerpo));

  const reserva = {
    paciente: 'Prueba Semana 9',
    profesional_id: prof.cuerpo[0].id,
    fecha_hora: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
  };
  const creada = await solicitar('POST', '/api/citas', reserva);
  assert.equal(creada.estado, 201);
  assert.ok(creada.cuerpo.id, 'La creación debe devolver un ID');

  const repetida = await solicitar('POST', '/api/citas', reserva);
  assert.equal(repetida.estado, 409);

  const pasada = await solicitar('POST', '/api/citas', {
    ...reserva,
    fecha_hora: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  });
  assert.equal(pasada.estado, 400);
  console.log('API comprobada: GET 200, POST 201, 409 y 400.');
}

verificar().catch(error => {
  console.error('Falló la verificación HTTP:', error.message);
  process.exitCode = 1;
});
