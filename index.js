import express from 'express';
import cors from 'cors';
import winston from 'winston';

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANTE: Configurar middlewares ANTES de las rutas
app.use(cors());
app.use(express.json());

// Configurar Winston solo con consola
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} - ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// PRIMERO: Endpoint raíz (el más importante para Railway)
app.get('/', (req, res) => {
  console.log('✓ Request recibida en /');
  res.send('Servidor Node Chat Logger activo');
});

// Health check
app.get('/health', (req, res) => {
  console.log('✓ Health check');
  res.status(200).json({ status: 'healthy' });
});

// Endpoint para registrar conversaciones
app.post('/log', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Falta el mensaje' });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Desconocido';

  logger.info(`IP: ${ip} | User-Agent: ${userAgent} | Mensaje: ${message}`);

  res.json({ status: 'ok', message: 'Mensaje registrado' });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Error al iniciar servidor:', err);
    process.exit(1);
  }
  console.log(`✓✓✓ Servidor escuchando en puerto ${PORT}`);
  console.log(`✓ Listo para recibir requests`);
});

// Manejar errores del servidor
server.on('error', (error) => {
  console.error('❌ Error del servidor:', error);
  process.exit(1);
});

// Manejar señales de cierre
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});