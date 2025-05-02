const express = require('express');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());



const contadorTraslados = {
  "3ª sala DIGESTIVO": 0
};

const db = new sqlite3.Database('./celadores.db');

const dbTraslados = new sqlite3.Database('./traslados.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos de traslados:', err.message);
  } else {
    console.log('Conectado a la base de datos traslados.db');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    tipo_usuario TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS celadores (
    id TEXT,
    ubicaciones TEXT
  )`);
});

dbTraslados.serialize(() => {
  dbTraslados.run(`CREATE TABLE IF NOT EXISTS traslados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ubicacion TEXT,
    habitacion_actual TEXT,
    destino TEXT,
    habitacion_destino TEXT,
    motivo TEXT,
    condiciones TEXT,
    aislamiento TEXT,
    prioridad TEXT,
    estado TEXT,
    celador_id TEXT,
    hora_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    hora_aceptado DATETIME DEFAULT CURRENT_TIMESTAMP,
    hora_finalizado DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM usuarios WHERE username = ? AND password = ?',
    [username, password],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error de servidor' });
      }

      if (row) {
        res.json({
          success: true,
          tipo_usuario: row.tipo_usuario,
          id: row.id,
        });
      } else {
        res.json({ success: false, message: 'Credenciales incorrectas' });
      }
    }
  );
});

const wss = new WebSocket.Server({ noServer: true });
let clients = {};

wss.on('connection', function connection(ws) {
  let clientId = null;

  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);

    if (data.type === 'register' && data.id) {
      clientId = data.id;
      clients[clientId] = ws;
      console.log(`Celador registrado: ${clientId}`);

      dbTraslados.all(
        `SELECT * FROM traslados WHERE (estado = 'pendiente' AND celador_id = ?) OR (estado = 'aceptado' AND celador_id = ?)`,
        [clientId, clientId],
        (err, rows) => {
          if (err) {
            console.error("Error al recuperar traslados asignados al reconectar:", err);
            return;
          }

          rows.forEach((traslado) => {
            ws.send(JSON.stringify({
              type: 'nuevo_traslado',
              traslado: {
                ...traslado
              }
            }));
          });
        }
      );
    }

    if (data.type === 'register_jefe' && data.id) {
      clientId = data.id;
      clients[clientId] = ws;
      console.log(`Jefe registrado: ${clientId}`);
    }

    if (data.type === 'traslado' && data.ubicacion) {
      console.log(`Recibiendo traslado para la ubicación: ${data.destino}`);

      db.all("SELECT * FROM celadores WHERE ubicaciones LIKE ?", [`%${data.destino}%`], (err, rows) => {
        if (err) {
          console.error("Error en DB:", err);
          return;
        }

        if (rows.length === 0) {
          console.warn(`No se encontró ningún celador con la ubicación ${data.destino}`);
          return;
        }

        let celadoresDestino = rows;

        if (data.ubicacion === "3ª sala DIGESTIVO") {
          const contador = contadorTraslados["3ª sala DIGESTIVO"] || 0;
          const celadorIdElegido = (contador % 2 === 0) ? "856348" : "888968";
          contadorTraslados["3ª sala DIGESTIVO"] = contador + 1;

          console.log("Celadores disponibles:", rows.map(r => r.id));
          console.log("Celador elegido:", celadorIdElegido);

          celadoresDestino = rows.filter(row => String(row.id) === celadorIdElegido);

          console.log("Se notificará solo a:", celadoresDestino.map(r => r.id));
        }
        
        const horaEnvio = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });  

        dbTraslados.run(
          `INSERT INTO traslados (ubicacion, habitacion_actual, destino, habitacion_destino, motivo, condiciones, aislamiento, prioridad, estado, celador_id, hora_envio)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.ubicacion,
            data.habitacion_actual || "No especificada",
            data.destino,
            data.habitacion_destino || "No especificada",
            data.motivo,
            JSON.stringify(data.condiciones || []),
            data.aislamiento || "No",
            data.prioridad || "Media",
            'pendiente',
            null,
            horaEnvio
          ],
          function (err) {
            if (err) {
              console.error('Error al guardar traslado en traslados.db:', err);
              return;
            }

            const trasladoId = this.lastID;
            console.log('Traslado guardado en traslados.db con ID:', trasladoId);

            celadoresDestino.forEach((celador) => {
              const celadorSocket = clients[celador.id];
              if (celadorSocket) {
                celadorSocket.send(JSON.stringify({
                  type: 'nuevo_traslado',
                  traslado: {
                    id: trasladoId,
                    ubicacion: data.ubicacion,
                    habitacion_actual: data.habitacion_actual || "No especificada",
                    destino: data.destino,
                    habitacion_destino: data.habitacion_destino || "No especificada",
                    motivo: data.motivo,
                    condiciones: data.condiciones || [],
                    aislamiento: data.aislamiento || "No",
                    prioridad: data.prioridad || "Media",
                    estado: 'pendiente',
                    celador_id: celador.id,
                    hora_envio: horaEnvio
                  }
                }));
              } else {
                console.log(`Celador con ID ${celador.id} no está conectado`);
              }
            });

            for (let clientId in clients) {
              clients[clientId].send(JSON.stringify({
                type: 'actualizar_traslados'
              }));
            }
          }
        );
      });
    }

    if (data.type === 'traslado_aceptado' && data.trasladoId && data.celadorId) {
      console.log(`Traslado aceptado: ${data.trasladoId} por el celador ${data.celadorId}`);

      // Actualizar el estado a "aceptado" y la hora de aceptación
      dbTraslados.run(
        'UPDATE traslados SET estado = ?, celador_id = ?, hora_aceptado = ? WHERE id = ?',
        ['aceptado', data.celadorId, new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
          , data.trasladoId], // Guardamos el timestamp de aceptación
        (err) => {
          if (err) {
            console.error('Error al actualizar traslado:', err);
          } else {
            console.log(`Traslado ${data.trasladoId} aceptado correctamente`);

            // Obtener la hora de aceptación actualizada
    //         dbTraslados.get('SELECT hora_aceptado FROM traslados WHERE id = ?', [data.trasladoId], (err, row) => {
    //           if (err) {
    //             console.error('Error al obtener hora de aceptación:', err);
    //             return;
    //           }
    //           if (row) {
    //             // Enviar la hora de aceptación al celador que aceptó el traslado
    //             if (clients[data.celadorId]) {
    //               clients[data.celadorId].send(JSON.stringify({
    //                 type: 'traslado_aceptado_actualizado',
    //                 trasladoId: data.trasladoId,
    //                 hora_aceptado: row.hora_aceptado
    //               }));
    //             }
    //           }

    //           for (let clientId in clients) {
    //             clients[clientId].send(JSON.stringify({
    //               type: 'actualizar_traslados'
    //                             }));
    //           }
    //         });
    //       }
    //     }
    //   );
    // }
    // Obtener el traslado actualizado completo
  
    
          // Obtener el traslado actualizado completo
          dbTraslados.get('SELECT * FROM traslados WHERE id = ?', [data.trasladoId], (err, traslado) => {
            if (err) {
              console.error('Error al obtener traslado actualizado:', err);
              return;
            }
  
            if (traslado) {
              // Aseguramos que las condiciones estén en formato adecuado
              traslado.condiciones = traslado.condiciones ? JSON.parse(traslado.condiciones) : [];
  
              // Enviar el traslado actualizado a todos los clientes conectados
              for (let clientId in clients) {
                clients[clientId].send(JSON.stringify({
                  type: 'traslado_actualizado',
                  traslado
                }));
              }
            }
          });
        }
      }
    );
  }
    
    if (data.type === 'traslado_finalizado' && data.trasladoId && data.celadorId) {
      console.log(`Traslado finalizado: ${data.trasladoId} por el celador ${data.celadorId}`);

      // Actualizar el estado a "finalizado" y la hora de finalización
      dbTraslados.run(
        'UPDATE traslados SET estado = ?, hora_finalizado = ? WHERE id = ?',
        ['finalizado', new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
          , data.trasladoId], // Guardamos el timestamp de finalización
        (err) => {
          if (err) {
            console.error('Error al actualizar traslado:', err);
          } else {
            console.log(`Traslado ${data.trasladoId} finalizado correctamente`);

            for (let clientId in clients) {
              clients[clientId].send(JSON.stringify({
                type: 'actualizar_traslados'
              }));
            }
          }
        }
      );
    }
  });

  ws.on('close', () => {
    console.log(`Cliente desconectado: ${clientId}`);
    delete clients[clientId];
  });
});

app.get('/traslados/pendientes', (req, res) => {
  dbTraslados.all("SELECT * FROM traslados WHERE estado = 'pendiente'", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const resultado = rows.map(row => ({
      ...row,
      condiciones: row.condiciones ? JSON.parse(row.condiciones) : []
    }));

    res.json(resultado);
  });
});

app.get('/traslados/aceptados', (req, res) => {
  dbTraslados.all("SELECT * FROM traslados WHERE estado = 'aceptado'", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const resultado = rows.map(row => ({
      ...row,
      condiciones: row.condiciones ? JSON.parse(row.condiciones) : []
    }));

    res.json(resultado);
  });
});

app.get('/traslados/finalizados', (req, res) => {
  dbTraslados.all("SELECT * FROM traslados WHERE estado = 'finalizado'", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const resultado = rows.map(row => ({
      ...row,
      condiciones: row.condiciones ? JSON.parse(row.condiciones) : []
    }));

    res.json(resultado);
  });
});

const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});