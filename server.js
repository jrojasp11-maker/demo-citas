// Punto de entrada y PUNTO DE COMPOSICIÓN (DI): aquí sí se conocen las
// implementaciones concretas. Su responsabilidad es seleccionarlas,
// construir el servicio y entregarle sus dependencias a las rutas.
// La lógica de aplicación y el dominio no importan estos módulos.
const express = require('express');
const cors = require('cors');
const path = require('path');
const { crearCitasRoutes } = require('./src/presentacion/citasRoutes');
const { crearCitaService } = require('./src/aplicacion/citaService');
const citaRepository = require('./src/persistencia/citaRepository');
const profesionalRepository = require('./src/persistencia/profesionalRepository');

const citaService = crearCitaService({
  citaRepository,
  profesionalRepository
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', crearCitasRoutes({ citaService }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Cliente web: http://localhost:${PORT}`);
});
