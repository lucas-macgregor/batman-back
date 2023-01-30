const express = require('express');
const db = require('./db/db.js');
const bodyParser = require('body-parser');
const logger = require("./logger");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = 'clavesecreta1234';
const PORT = process.env.PORT || 3050;
const app = express();
const cors=require('cors');
const path = require('path');
const worksheets = require('./excel/Worksheet.js');
const fs= require('fs');
const validateJWT = require('./jwt-functions/jwt-functions').validateJWT;
const extractTokenInfo = require('./jwt-functions/jwt-functions').extractTokenInfo;
const formidable = require('formidable');
const xlsx = require('xlsx');
const _ = require('lodash');
app.use(bodyParser.json());
app.use(cors());
module.exports = app;

//Conexion a mysql
db.startDB();

//Rutas
app.get('/gustos',(req,res)=> {
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Get request de gustos recibido`);
    if (validateJWT(req.get('token'))) {
        res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
        db.getGustos().then((resolve)=>{
            res.json(resolve);
        });
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`);
    }
});

app.get('/opciones',(req,res)=> {
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Get request de opciones recibido`);
    res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    if (validateJWT(req.get('token'))) {
        db.getOpciones().then((resolve)=>{
            res.json(resolve);
        });
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`);
    }
});

app.get('/getuserinfo',(req,res)=> {
    const token=req.get("token");
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${token}. Get request de getusername recibido`);
    res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    if (token && validateJWT(token)) {
        res.send(extractTokenInfo(token));
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`);
   
    }
});

app.post('/agregargusto', (req,res)=> {
    const gustosObj= {
        meGusta: req.body.meGusta,
        noGusta: req.body.noGusta
    }
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Post request de agregargusto recibido`);
    if (validateJWT(req.get('token'))) {
        db.agregarGusto(gustosObj).then(()=>{
            res.send()
        });
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`);
    }
});

app.post('/agregaropcion', (req,res)=> {
    const opcionObj= {
        opcion: req.body.opcion
    }
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Post request de agregaropcion recibido`);
    if (validateJWT(req.get('token'))) {
        db.agregarOpcion(opcionObj).then(()=>{
            res.send()
        });
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`);
    }
});

app.delete('/quitaropcion/:id', (req,res)=> {
    const {id}= req.params;
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Delete request de quitaropcion recibido`);
    if (validateJWT(req.get('token'))) {
        db.quitarOpcion(id).then(()=>{
            res.send()
        });
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`)
    }
});

app.delete('/quitargusto/:id', (req,res)=> {
    const {id}= req.params;
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Delete request de quitargusto recibido`);
    if (validateJWT(req.get('token'))) {
        db.quitarGusto(id).then(()=>{
            res.send()
        });
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`)
    }
});

app.patch('/editargusto/:id', (req,res)=> {
    const {id}= req.params;
    const gustosObj= {
        meGusta: req.body.meGusta,
        noGusta: req.body.noGusta
    }
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Patch request de editargusto recibido`);
    if (validateJWT(req.get('token'))) {
        db.editarGusto(id,gustosObj).then(()=>{
            res.send()
        });
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`)
    }
});

app.patch('/editarvoto/:id', (req,res)=> {
    const {id}= req.params;
    const votoObj= {
        type: req.body.type,
        value: req.body.value
    }
    logger.http(`Interceptor: -UName: ${req.get("username")} -Token: ${req.get("token")}. Patch request de editarvoto recibido`);
    if (validateJWT(req.get('token'))) {
        db.editarVoto(id,votoObj).then(()=>{
            res.send()
        });
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`)
    }
});

app.post('/descargar', (req,res)=>{
    const elements = req.body.elementos;
    if (validateJWT(req.get('token'))) {
        worksheets.getWorksheet(elements).then((resolve)=>{
            filename=resolve;
            if (typeof(resolve)=='string') {
                const options = {
                    root: path.join(__dirname)
                };
                res.sendFile(resolve,options,(err)=>{
                    if (err) {
                        logger.error(err);
                    }
                    else {
                        logger.http('Enviado archivo: '+ resolve);
                        worksheets.findByExtension('./','.xls').then((fileList)=>{
                            worksheets.deleteWorksheets(fileList).then((result)=>{
                                logger.info(result);
                            });
                        });
                    }
                });
            }
            else {
                logger.error('Error al crear el archivo xls.')
                res.status(500).send();
            }
        });
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`)
    }
});

app.post('/upload',(req,res)=> {
    let form = new formidable.IncomingForm();
    if (validateJWT(req.get('token'))) {
        form.parse(req, (err,fields,file) => {
            if (err)throw err;
            const oldpath = file.file.filepath;
            const newpath = './'+file.file.originalFilename;
            fs.rename(oldpath,newpath, (err)=> {
                if (err) throw err;
                const workbook = xlsx.readFile(newpath);
                if (workbook.SheetNames.includes('Gustos')){
                    const fileData = xlsx.utils.sheet_to_json(workbook.Sheets.Gustos);
                    db.getGustos().then((storedData)=> {
                        let i=0,j=0;
                        while (i<storedData.length || j<fileData.length) {
                            if (storedData[i] && fileData[j]) {
                                if (storedData[i].id===fileData[j].id && !_.isEqual(storedData[i],fileData[j])) {
                                    db.editarGusto(storedData[i].id,fileData[j]).then(()=>{
                                    });
                                    i++;
                                    j++;
                                }
                                else if (storedData[i].id<fileData[j].id){ 
                                    db.quitarGusto(storedData[i].id).then(()=>{
                                    });
                                    i++;
                                }
                                else if (storedData[i].id>fileData[j].id){   
                                    db.agregarGusto(fileData[j]).then(()=>{
                                    });
                                    j++;
                                }
                                else {
                                    i++;
                                    j++;
                                }
                            }
                            else {
                                while (storedData[i]) {
                                    db.quitarGusto(storedData[i].id).then(()=>{
                                    });
                                    i++;
                                }
                                while (fileData[j]){
                                    db.agregarGusto(fileData[j]).then(()=>{
                                    });
                                    j++;
                                }
                            }

                        }
                        res.send();
                    });
                }
                else {
                    logger.error('El documento no contenia informacion sobre los gustos.')
                    res.status(500).send();
                }
                fs.unlink(newpath, (error)=>{
                    if (error) {
                        resolve(error);
                    }
                });
            });
        });
    } else {
        res.status(401).send();
        logger.http(`Invalid token: 401 sent.`)
    }
});

app.post('/login', (req,res)=> {
    const username=req.body.username;
    const hasValidToken=validateJWT(req.get('token'));
    if (!hasValidToken) {
        db.login(username).then((queryRes)=>{
            if (queryRes.length===1) {
                bcrypt.compare(req.body.password, queryRes[0].password, (error, validPassword) => {
                    if (error) throw logger.error(`Bcrypt error: ${error}`)
                    if (validPassword) {
                        logger.http(`Post request de login con clave correcta recibido`);
                        const expiresIn = 24*60*60;
                        const accessToken = jwt.sign({username}, SECRET_KEY, {expiresIn});
                        res.send({accessToken:accessToken, email: queryRes.email, username:username});
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
    } 
    else {
        res.status(406).send();
        logger.http(`User ${req.get('username')} already logged in`);
    }
});


app.listen(PORT, () => {logger.info(`Server levantado en puerto ${PORT}`)});
