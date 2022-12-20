const mysql = require('mysql2');
const logger = require('logger');

function connect() {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '$Pruebas123',
        database: 'proyectoInicial'
    });

    connection.connect(error=>{
        if (error) throw logger.error(`${error}`);
        logger.info("Base de datos funcionando.")
    });   
}

function getGustos() {
    const sql = 'SELECT * FROM gustos';
    connection.query(sql, (error, results) => {
        if (error) throw console.error(`${error}`);
        if (results.length>0) {
            return results;
        }
        else 
        return {}
    });
}