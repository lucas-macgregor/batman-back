const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
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

//Rutas
app.get('/gustos',(req,res)=> {
    const sql = 'SELECT * FROM gustos';
    const hora= new Date();
    console.log(+hora.getHours()+':'+hora.getMinutes()+':'+hora.getSeconds()+' gustos: '+req.get("msg"));
    res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    connection.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length>0) {
            res.json(results);
        }
        else {
            res.send('Sin resultados.');
        }
    })
})

app.get('/opciones',(req,res)=> {
    const sql = 'SELECT * FROM opciones';
    const hora= new Date();
    console.log(+hora.getHours()+':'+hora.getMinutes()+':'+hora.getSeconds()+' opciones: '+req.get("msg"));
    res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    connection.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length>0) {
            res.json(results);
        }
        else {
            res.send('Sin resultados.');
        }
    })
})

app.post('/agregaropcion', (req,res)=> {
    const sql = 'INSERT INTO opciones SET ?';
    const opcionObj= {
        opcion: req.body.opcion
    }
    const hora= new Date();
    console.log(+hora.getHours()+':'+hora.getMinutes()+':'+hora.getSeconds()+' agregaropciones: '+req.get("msg"));
    connection.query(sql,opcionObj, error => {
        if (error) throw error;
        res.send();
    })
})

app.delete('/quitaropcion/:id', (req,res)=> {
    const {id}= req.params;
    const sql = `DELETE FROM opciones WHERE id=${id}`;
    const hora= new Date();
    console.log(+hora.getHours()+':'+hora.getMinutes()+':'+hora.getSeconds()+' quitaropcion: '+req.get("msg"));
    connection.query(sql, error => {
    if (error) throw error;
    res.send();
    })
})

app.post('/login', (req,res)=> {
    username=req.body.username;
    const sql = `SELECT * FROM usuarios WHERE username='${username}'`;
    const hora= new Date();
    console.log(+hora.getHours()+':'+hora.getMinutes()+':'+hora.getSeconds()+' login: '+req.get("msg"));
    connection.query(sql, (err , results)=> {
        if (err) throw err;
        if (results.length===1) {
            if (results[0].password===req.body.password) {
                console.log('Contraseña correcta.');
                res.send({success:true});
            }
            else {
                console.log('Contraseña incorrecta.');
                res.send({success:false});
            }
        }
        else {
            console.log('Usuario no existe');
            res.send({success:false});
        }
    })
});

//Conexion a la DB
connection.connect(error=>{
    if (error) throw error;
    console.log('Base de datos funcionando.');
});
app.listen(PORT, () => {console.log(`Server levantado en puerto ${PORT}`)});

