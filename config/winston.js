var appRoot = require("app-root-path");
var winston = require("winston");
var options = {
  file: {
    level: "info",
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    format: winston.format.combine(winston.format.json())
  },
  errorFile: {
    level: "error",
    name: "file.error",
    filename: `${appRoot}/logs/error.log`,
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true,
    format: winston.format.combine(winston.format.json())
  },
  console: {
    level: "debug",
    handleExceptions: true,
    colorize: true,
    format: winston.format.combine(winston.format.json())
  }
};

var logger = winston.createLogger({
  transports: [
    new winston.transports.Console(options.console),
    new winston.transports.File(options.errorFile),
    new winston.transports.File(options.file)
  ],
  exitOnError: false // do not exit on handled exceptions
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;
