const { format, createLogger, transports } = require("winston");
const { combine, timestamp, prettyPrint } = format;


const logger = createLogger({
    level: "debug",
    format: combine(
      timestamp({
        format: "MMM-DD-YYYY HH:mm:ss",
      }),
      prettyPrint()
    ),
    transports: [new transports.File({
        filename: "logs/logger.log",
      }),
      new transports.Console(),],
});

module.exports = logger;