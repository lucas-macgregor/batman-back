const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const logger = require("./logger");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = 'clavesecreta1234';
const PORT = process.env.PORT || 3050;
const app = express();
const cors=require('cors');
app.use(bodyParser.json());
app.use(cors())

//Variables de conexion a mysql
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '$Pruebas123',
    database: 'proyectoInicial'
});

//JWT Validation
function validateJWT(token,username) {
    let decode;
    if (token!==undefined && username!==undefined) {
        try {
            decode = jwt.verify(token,SECRET_KEY);
        } 
        catch ( error ) {
            logger.error(`JWT Validation error: ${error}`);
            decode=null;
        }
        if (decode!== null && decode.username===username)
            return true;
        else
            return false;
    } else {
        return false;
    }
}

//Rutas
app.get('/gustos',(req,res)=> {
    const sql = 'SELECT * FROM gustos';
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Get request de gustos recibido`);
    if (validateJWT(req.get('token'),req.get('username'))) {
        res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
        connection.query(sql, (error, results) => {
            if (error) throw console.error(`${error}`);
            if (results.length>0) {
                res.json(results);
            }
        })
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`)
    }
})

app.get('/opciones',(req,res)=> {
    const sql = 'SELECT * FROM opciones';
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Get request de opciones recibido`);
    res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    if (validateJWT(req.get('token'),req.get('username'))) {
        connection.query(sql, (error, results) => {
            if (error) throw console.error(`${error}`);
            if (results.length>0) {
                res.json(results);
            }
        })
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`);
    }
})

app.post('/agregaropcion', (req,res)=> {
    const sql = 'INSERT INTO opciones SET ?';
    const opcionObj= {
        opcion: req.body.opcion
    }
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Post request de agregaropcion recibido`);
    if (validateJWT(req.get('token'),req.get('username'))) {
        connection.query(sql,opcionObj, error => {
            if (error) throw console.error(`${error}`);
            res.send();
        })
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`)
    }
})

app.delete('/quitaropcion/:id', (req,res)=> {
    const {id}= req.params;
    const sql = `DELETE FROM opciones WHERE id=${id}`;
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Delete request de quitaropcion recibido`);
    if (validateJWT(req.get('token'),req.get('username'))) {
        connection.query(sql, error => {
        if (error) throw console.error(`${error}`);
          res.send();
        })
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`)
    }
})

app.post('/login', (req,res)=> {
    username=req.body.username;
    const sql = `SELECT * FROM usuarios WHERE username='${username}'`;
    if (!validateJWT(req.get('token'),req.get('username'))) {
        connection.query(sql, (error , results)=> {
            if (error) throw logger.error(`${error}`);
            if (results.length===1) {
                if (results[0].password===req.body.password) {
                    logger.http(`Post request de login con clave correcta recibido`);
                    const expiresIn = 24*60*60;
                    const accessToken = jwt.sign({username}, SECRET_KEY, {expiresIn});
                    res.send({accessToken:accessToken, expiresIn:expiresIn, name:username});
                }
                else {
                    logger.http(`Post request de login con clave incorrecta recibido`);
                    res.status(409).send();
                }
            }
            else {
                logger.http(`Post request de login con usuario inexistente recibido`);
                res.status(409).send();
            }
        })
    } else {
        res.status(406).send();
        logger.http(`User ${req.get('username')} already logged in`);
    }
});

//Conexion a la DB
connection.connect(error=>{
    if (error) throw logger.error(`${error}`);
    logger.info("Base de datos funcionando.")
});
app.listen(PORT, () => {logger.info(`Server levantado en puerto ${PORT}`)});
