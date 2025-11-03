import express from 'express';
import __dirname from '../utils/pathUtils.js';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

//Middlewares
const staticMiddleware = express.static(path.join(__dirname, 'assets'));

const logDirectory = path.join(__dirname, 'logs');
const logFilePath = path.join(logDirectory, 'access.log');

const urlencodedMiddleware = express.urlencoded({ extended: true});
const jsonMiddleware = express.json();

const securityMiddleware = helmet();

const compressionMiddlewware = compression();

const rateLimitMiddleware = rateLimit({
    windowMs: 10 * 60 * 1000,  // 10 minutos
    max: 100,                  // Limita cada IP a 50 requisições por janela
    message: 'Muitas requisições, tente novamente em 10 minutos.'
});

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const logFile = fs.createWriteStream(logFilePath, { flags: 'a' });
const morganMiddleware = morgan('combined', { stream: logFile });

export {
    staticMiddleware,
    urlencodedMiddleware,
    jsonMiddleware,
    securityMiddleware,
    compressionMiddlewware,
    rateLimitMiddleware,
    morganMiddleware
};
