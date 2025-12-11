import express from 'express';
import cors from 'cors';
import winston from 'winston';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configurar Winston para logs con timestamp
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} - ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({ filename: 'logs.txt' }),
    new winston.transports.Console()
  ]
});

// Endpoint para registrar conversaciones
app.post('/log', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Falta el mensaje' });

  // Obtener IP real (si hay proxy, usa el encabezado x-forwarded-for)
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Obtener user-agent (navegador, sistema operativo)
  const userAgent = req.headers['user-agent'] || 'Desconocido';

  // Registrar en log
  logger.info(`IP: ${ip} | User-Agent: ${userAgent} | Mensaje: ${message}`);

  res.json({ status: 'ok', message: 'Mensaje registrado' });
});

// Endpoint de prueba
app.get('/', (req, res) => {
  res.send('Servidor Node Chat Logger activo');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
