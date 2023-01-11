const mysql = require('mysql2');
const logger = require('../logger');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '$Pruebas123',
    database: 'proyectoInicial'
});


function startDB() {
    connection.connect(error=>{
        if (error) throw logger.error(`${error}`);
        logger.info("Base de datos funcionando.")
    });   
}

function getGustos() {
    return new Promise((resolve)=>{
    const sql = 'SELECT * FROM gustos';
    connection.query(sql, (error, results) => {
        if (error) throw console.error(`${error}`);
        if (results.length>0) {
            resolve( results);
        }
        else 
            resolve( []);
    });
});
}

function getOpciones() {
    return new Promise((resolve)=>{
        const sql = 'SELECT * FROM opciones';
        connection.query(sql, (error, results) => {
            if (error) throw console.error(`${error}`);
            if (results.length>0) {
                resolve(results);
            }
            else
                resolve([]);
        });
    });
}

function agregarOpcion(opcionObj) {
    return new Promise((resolve)=>{
        const sql = 'INSERT INTO opciones SET ?';
        connection.query(sql,opcionObj, error => {
            if (error) throw console.error(`${error}`);
            resolve();
        });
    });
}

function agregarGusto(gustosObj) {
    return new Promise((resolve)=>{
        const sql = 'INSERT INTO gustos SET ?';
        connection.query(sql,gustosObj, error => {
            if (error) throw console.error(`${error}`);
            resolve();
        });
    });
}

function quitarOpcion(id) {
    return new Promise((resolve)=>{
        const sql = `DELETE FROM opciones WHERE id=${id}`;
        connection.query(sql, error => {
            if (error) throw console.error(`${error}`);
            resolve();
        });
    });
}

function quitarGusto(id) {
    return new Promise((resolve)=>{
        const sql = `DELETE FROM gustos WHERE id=${id}`;
        connection.query(sql, error => {
            if (error) throw console.error(`${error}`);
            resolve();
        });
    });
}

function editarGusto(id,gustosObj) {
    return new Promise((resolve)=>{
        const sql = `UPDATE gustos SET ? WHERE id=${id}`;
        connection.query(sql, gustosObj, error => {
            if (error) throw console.error(`${error}`);
            resolve();
        });
    });
}

function login (username) {
    return new Promise((resolve)=>{
        const sql = `SELECT * FROM usuarios WHERE username='${username}'`;
        connection.query(sql, (error , queryRes)=> {
            if (error) throw logger.error(`SQL error: ${error}`);
            resolve(queryRes);
        });
    });
}
module.exports={
    startDB, 
    getGustos, 
    getOpciones, 
    agregarOpcion,
    agregarGusto, 
    quitarOpcion,
    quitarGusto,
    editarGusto,
    login
};