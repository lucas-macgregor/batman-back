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
    connection.query(sql,opcionObj, error => {
        if (error) throw error;
        res.send();
    })
})

app.delete('/quitaropcion/:id', (req,res)=> {
    const {id}= req.params;
    const sql = `DELETE FROM opciones WHERE id=${id}`;
    connection.query(sql, error => {
    if (error) throw error;
    res.send();
    })
})

//Conexion a la DB
connection.connect(error=>{
    if (error) throw error;
    console.log('Base de datos funcionando.');
});
app.listen(PORT, () => {console.log(`Server levantado en puerto ${PORT}`)});
