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
//const saltRounds=10;
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
function validateJWT(token) {
    let decode;
    if (token!==undefined) {
        try {
            decode = jwt.verify(token,SECRET_KEY);
        } 
        catch ( error ) {
            logger.error(`JWT Validation error: ${error}`);
            decode=null;
        }
        if (decode!== null){
            return true;
        }
        else
            return false;
        
    } else 
        return false;
}

function extractUsername(token) {
    let decode;
    if (token!==undefined) {
        try {
            decode = jwt.verify(token,SECRET_KEY);
        } 
        catch ( error ) {
            logger.error(`JWT Validation error: ${error}`);
            decode=null;
        }
        if (decode!== null){
            return decode.username;
        }
        else
            return false;
        
    } else 
        return false;
}

//Rutas
app.get('/gustos',(req,res)=> {
    const sql = 'SELECT * FROM gustos';
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Get request de gustos recibido`);
    if (validateJWT(req.get('token'))) {
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
    if (validateJWT(req.get('token'))) {
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

app.get('/getusername',(req,res)=> {
    const token=req.get("token");
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${token}. Get request de getusername recibido`);
    res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    if (validateJWT(token)) {
        res.send({value: extractUsername(token)});
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
    if (validateJWT(req.get('token'))) {
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
    if (validateJWT(req.get('token'))) {
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
    const username=req.body.username;
    const sql = `SELECT * FROM usuarios WHERE username='${username}'`;
    const hasValidToken=validateJWT(req.get('token'));
    if (!hasValidToken) {
        connection.query(sql, (error , queryRes)=> {
            if (error) throw logger.error(`SQL error: ${error}`);
            if (queryRes.length===1) {
                bcrypt.compare(req.body.password, queryRes[0].password, (error, validPassword) => {
                    if (error) throw logger.error(`Bcrypt error: ${error}`)
                    if (validPassword) {
                        logger.http(`Post request de login con clave correcta recibido`);
                        const expiresIn = 24*60*60;
                        const accessToken = jwt.sign({username}, SECRET_KEY, {expiresIn});
                        res.send({accessToken:accessToken, expiresIn:expiresIn, name:username});
                    }
                    else {
                        logger.http(`Post request de login con clave incorrecta recibido`);
                        res.status(409).send();
                    }
                });
            }
            else {
                logger.http(`Post request de login con usuario inexistente recibido`);
                res.status(409).send();
            }
        });
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
