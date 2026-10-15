// NUEVO: contrato de colaboración de la aplicación (JavaScript).
// No existe una interfaz nativa como en Java o TypeScript; aquí se emplea
// un contrato estructural con comprobación básica de métodos. Detecta
// implementaciones incompletas al ensamblar (no valida la semántica).
function exigirMetodos(objeto, metodos, nombre) {
  for (const metodo of metodos) {
    if (typeof objeto?.[metodo] !== 'function') {
      throw new TypeError(`${nombre} debe implementar ${metodo}()`);
    }
  }
}

function verificarRepositorios({ citaRepository, profesionalRepository }) {
  exigirMetodos(citaRepository,
    ['listarTodas', 'existeEnHorario', 'guardar'], 'citaRepository');
  exigirMetodos(profesionalRepository,
    ['listarTodos'], 'profesionalRepository');
}

module.exports = { verificarRepositorios };
