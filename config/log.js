let log_params= {
    consoleOutput : true,
    consoleOutputLevel: ['DEBUG','ERROR','WARNING', 'INFO'],

    dateTimeFormat: "DD.MM.YYYY HH:mm:ss.S",
    outputPath: "logs/",
    fileNameDateFormat: "DD-MM-YYYY",
    fileNamePrefix:"opium-"
};

let log = require('noogger').init(log_params);

module.exports = log;
