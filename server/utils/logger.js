import winston from 'winston';
import path from 'path';

const __dirname = process.cwd();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'miazii-shop-api' },
    transports: [
        // Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({ 
            filename: path.join(__dirname, 'logs', 'error.log'), 
            level: 'error' 
        }),
        // Write all logs with importance level of `info` or less to `combined.log`
        new winston.transports.File({ 
            filename: path.join(__dirname, 'logs', 'combined.log') 
        }),
    ],
});

// If we're not in production then log to the `console`
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

export default logger;
