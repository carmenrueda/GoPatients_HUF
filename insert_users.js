const sqlite3 = require('sqlite3').verbose();

// Abre la base de datos
const db = new sqlite3.Database('./celadores.db');

// Crear la tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      tipo_usuario TEXT NOT NULL
    )
  `);

  // Insertar usuarios con contraseñas en texto claro
  const stmt = db.prepare(`
    INSERT INTO usuarios (username, password, tipo_usuario)
    VALUES (?, ?, ?)
  `);

  // Insertar datos de ejemplo
  stmt.run('medico', '12345', 'medico');
  stmt.run('jefe', '12345', 'jefe');
  stmt.run('881430', '12345', 'celador');
  stmt.run('815127', '12345', 'celador');
  stmt.run('856348', '12345', 'celador');
  stmt.run('888968', '12345', 'celador');
  stmt.run('869854', '12345', 'celador');
  stmt.run('856030', '12345', 'celador');

  stmt.finalize();
});

db.close(() => {
  console.log("Usuarios insertados correctamente en la base de datos.");
});
