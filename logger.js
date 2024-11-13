const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    levels: {
        debug: 0,
        http: 1,
        info: 2,
        warn: 3,
        error: 4,
        fatal: 5
    },
    format: format.combine(
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console({
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
        }),
        new transports.File({
            filename: 'errors.log',
            level: 'error'
        })
    ]
});

module.exports = logger;
