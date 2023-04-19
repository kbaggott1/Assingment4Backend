const pino = require("pino");
const streams = [
    {
      level: "info", // support logging of all levels to this location
      stream: process.stdout, // logs to the standard output
    },
    {
      level: "info", // support logging of all levels to this location
      stream: pino.destination("logs/server-log"), // log to this file
    },
  ];
  
  const minimum_log_level = "debug";

  const logger =
    process.env.CONSOLE_ONLY == "true"
      ? pino({
          level: process.env.PINO_LOG_LEVEL || minimum_log_level, // minimum level to log
        })
      : pino(
          {
            level: process.env.PINO_LOG_LEVEL || minimum_log_level, // minimum level to log
          },
          pino.multistream(streams)
        );
  

module.exports = logger;