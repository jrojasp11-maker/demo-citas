// Capa HTTP: extrae los datos de la petición, delega en la capa de
// aplicación y traduce los resultados (o los errores de negocio) a
// códigos de estado. Los códigos HTTP se deciden aquí, no en el dominio.
// El servicio llega inyectado por crearCitasRoutes({ citaService }): las
// rutas no importan el módulo concreto del caso de uso.
const express = require('express');
const { ErrorDeNegocio } = require('../dominio/reglasDeAgenda');

const CODIGO_HTTP = {
  DATOS_FALTANTES: 400,
  FECHA_INVALIDA: 400,
  FECHA_PASADA: 400,
  AGENDA_OCUPADA: 409,
};

function crearCitasRoutes({ citaService }) {
  const router = express.Router();

  router.get('/salud', (req, res) => {
    res.json({ estado: 'ok', servidor: 'activo', hora: new Date().toISOString() });
  });

  router.get('/citas', async (req, res) => {
    try {
      res.json(await citaService.consultarCitas());
    } catch (error) {
      console.error('Error consultando citas:', error.message);
      res.status(500).json({ error: 'No se pudo consultar la base de datos' });
    }
  });

  router.get('/profesionales', async (req, res) => {
    try {
      res.json(await citaService.consultarProfesionales());
    } catch (error) {
      console.error('Error consultando profesionales:', error.message);
      res.status(500).json({ error: 'No se pudo consultar la base de datos' });
    }
  });

  router.post('/citas', async (req, res) => {
    try {
      const resultado = await citaService.reservarCita(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      if (error instanceof ErrorDeNegocio) {
        res.status(CODIGO_HTTP[error.codigo] || 400).json({ error: error.message });
      } else {
        console.error('Error creando cita:', error.message);
        res.status(500).json({ error: 'No se pudo guardar en la base de datos' });
      }
    }
  });

  return router;
}

module.exports = { crearCitasRoutes };
