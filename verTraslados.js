const sqlite3 = require('sqlite3').verbose();
const dbTraslados = new sqlite3.Database('./traslados.db');

dbTraslados.all("SELECT * FROM traslados", [], (err, rows) => {
  if (err) {
    console.error('Error al consultar la base de datos:', err);
  } else {
    console.log('Datos de traslados:', rows);
  }
  dbTraslados.close();  // Cerrar la base de datos
});
