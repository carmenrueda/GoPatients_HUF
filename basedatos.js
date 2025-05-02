const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./celadores.db');

// Crear una tabla para almacenar las asignaciones
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS celadores (id TEXT, ubicaciones TEXT)");

  // Insertar datos de ejemplo
  const stmt = db.prepare("INSERT INTO celadores (id, ubicaciones) VALUES (?, ?)");
  stmt.run('881430', JSON.stringify(["PLANTA BAJA", "PLANTA 2ª"]));
  stmt.run('815127', JSON.stringify(["CARDIO", "ALERGIA", "REUMA+ONCO", "GINE-HISTERIOS+CARTAS"]));
  stmt.run('856348', JSON.stringify(["DIGESTIVO (120)", "3ª sala DIGESTIVO"]));
  stmt.run('888968', JSON.stringify(["DIGESTIVO (121)", "HDQ", "3ª sala DIGESTIVO"]));
  stmt.run('869854', JSON.stringify(["HALL", "UROLOGÍA", "NEUMOLOGÍA", "OFTALMOLOGÍA"]));
  stmt.run('856030', JSON.stringify(["REFUERZO", "EXTRACCIONES"]));
  stmt.finalize();
});

console.log("Base de datos creada y datos insertados.");
