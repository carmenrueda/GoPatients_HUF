const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./celadores.db');

db.all("SELECT * FROM usuarios", [], (err, rows) => {
  if (err) {
    throw err;
  }
  console.log("Contenido de la tabla celadores:");
  rows.forEach(row => {
    console.log(row);
  });
  db.close();
});
