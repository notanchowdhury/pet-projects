import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  redact: {
    paths: ['req.headers.cookie', 'req.headers.authorization', '*.apiKey', '*.password'],
    censor: '[redacted]'
  }
});
