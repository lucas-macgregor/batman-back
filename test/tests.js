const chai = require('chai');
const chaiHttp = require('chai-http');
const spies=require('chai-spies');
chai.should();
chai.use(chaiHttp);
chai.use(spies);
const rewire = require('rewire');

//  start of configuration of mocks for testing
let app = rewire('../app.js');
let db = app.__get__('db');
db.agregarOpcion=()=>{
    return new Promise((resolve)=>{
        resolve()
    });
}
db.quitarOpcion=()=>{
    return new Promise((resolve)=>{
        resolve()
    });
}
db.agregarGusto=()=>{
    return new Promise((resolve)=>{
        resolve()
    });
}
db.quitarGusto=()=>{
    return new Promise((resolve)=>{
        resolve()
    });
}
db.editarGusto=()=>{
    return new Promise((resolve)=>{
        resolve()
    });
}
//  end of configuration of mocks for testing

const worksheets = require('../excel/Worksheet.js');
const validateJWT  = require('../jwt-functions/jwt-functions.js').validateJWT;
const extractTokenInfo  = require('../jwt-functions/jwt-functions.js').extractTokenInfo;
const expect = require('chai').expect;
//const sinon = require('sinon');


const validToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imx1Y2FzIiwiaWF0IjoxNjczNDUzMTYzLCJleHAiOjE2NzM1Mzk1NjN9.i9Bhib789GI7_fh34mccB7fBP6von0L01c8zwI_qEg0';

describe('testing over worksheets', ()=> {
    it('should return filename at creating a new xls',()=>{
        worksheets.getWorksheet([{id:1,meGusta:'asd',noGusta:'asdasd'}])
            .then((result)=>{
                expect(result).to.be.a('string');
            });
    });

    it('find file names by extension ', ()=>{
        worksheets.findByExtension('./','.xls')
            .then((result)=>{
                expect(result).to.be.a('string');
            });
    });

    it('should delete a file', ()=>{
        worksheets.deleteWorksheets(['gustos1673456133083.xls'])
        .then((result)=>{
            expect(result).to.be.a('string');
        })
    });
});

describe('testing over validateJWT', ()=>{
    it('should return false on empty token', ()=>{
        expect(validateJWT('')).to.be.false;
    });

    it('should return false on undefined token',()=>{
        expect(validateJWT(undefined)).to.be.false;
    })

    it('should return false on fake token', ()=>{
        expect(validateJWT('asd.fgh.hjk')).to.be.false;
    });

    it('should return true on valid token',()=>{
        expect(validateJWT(validToken)).to.be.true;
    });
});

describe('testing over extractTokenInfo',()=>{
    it('should return false on undefined token',()=>{
        expect(extractTokenInfo(undefined)).to.be.false;
    });

    it('should return false on fake token',()=>{
        expect(extractTokenInfo('asd.fgh.jkl')).to.be.false;
    });

    it('should return false on empty token',()=>{
        expect(extractTokenInfo('')).to.be.false;
    });

    it('should extract info from valid token',()=>{
        const result = extractTokenInfo(validToken);
        expect(result).to.be.a('object');
        expect(result).to.have.property('username').equal('lucas');
    })

});

describe('testing gustos', ()=> {
    it('should NOT get gustos (no token)', (done)=>  {
        chai.request(app)
            .get("/gustos")
            .end((err,response) => {
                response.should.have.status(401);
                done();
            });        
    });
    
    it('should get gustos', (done)=>  {
        chai.request(app)   
            .get("/gustos")
            .set({"username":'lucas',"token":validToken})
            .end((err,response) => {
                response.should.have.status(200);
                response.should.be.a('object');
                response.body.should.be.a('array');
                done();
            });    
    });

    it('should NOT add a gusto unauthenticated', (done)=> {
        chai.request(app)
            .post("/agregargusto")
            .send({meGusta: 'asd', noGusta: 'qwe'})
            .end((err,response)=>{
                response.should.have.status(401);
                done();
            });
    });

    it('should add a gusto', (done)=> {
        chai.request(app)
            .post("/agregargusto")
            .set({"username":'lucas',"token":validToken})
            .send({meGusta: 'asd', noGusta: 'qwe'})
            .end((err,response)=>{
                response.should.have.status(200);
                done();
            });
    });

    it('should edit a gusto', (done)=> {
        chai.request(app)
            .patch("/editargusto/1")
            .set({"username":'lucas',"token":validToken})
            .send({meGusta: 'asd', noGusta: 'qwe'})
            .end((err,response)=>{
                response.should.have.status(200);
                done();
            });
    });

    it('should NOT edit a gusto', (done)=> {
        chai.request(app)
            .patch("/editargusto/1")
            .send({meGusta: 'asd', noGusta: 'qwe'})
            .end((err,response)=>{
                response.should.have.status(401);
                done();
            });
    });

    
    it('should NOT delete a gusto unauthenticated', (done)=> {
        chai.request(app)
            .delete("/quitargusto/1")
            .end((err,response)=>{
                response.should.have.status(401);
                done();
            });
    });
    
    it('should NOT delete a gusto', (done)=> {
        chai.request(app)
            .delete("/quitargusto/1")
            .set({"username":'lucas',"token":validToken})
            .end((err,response)=>{
                response.should.have.status(200);
                done();
            });
    });

    it('should NOT download xls of gustos unauthenticated',(done)=>{
        chai.request(app)
            .post("/descargar")
            .end((err,response)=>{
                response.should.have.status(401);
                done();
            });
    });

    //it('should download xls of gustos',(done)=>{
    //    chai.request(app)
    //        .post("/descargar")
    //        .set({"username":'lucas',"token":validToken})
    //        .end((err,response)=>{
    //            response.should.have.status(200);
    //            done();
    //        });
    //});
});

describe('testing opciones', ()=>{
    it('should NOT get opciones unauthenticathed',(done)=>{
        chai.request(app)
            .get("/opciones")
            .end((err,response) => {
                response.should.have.status(401);
                done();
            });
    });

    it('should get opciones', (done)=> {
        chai.request(app)
            .get("/opciones")
            .set({"username":'lucas',"token":validToken})
            .end((err,response) =>{
                response.should.have.status(200);
                response.should.be.a('object');
                response.body.should.be.a('array');
                done();
            });
    });

    it('should NOT add an option unauthenticated', (done)=> {
        chai.request(app)
            .post("/agregaropcion")
            .send({opcion: 'nueva'})
            .end((err,response)=>{
                response.should.have.status(401);
                done();
            });
    });

    it('should add an option', (done)=> {
        chai.request(app)
            .post("/agregaropcion")
            .set({"username":'lucas',"token":validToken})
            .send({opcion: 'nueva'})
            .end((err,response)=>{
                response.should.have.status(200);
                done();
            });
    });

    it('should NOT delete an option unauthenticated', (done)=> {
        chai.request(app)
            .delete("/quitaropcion/1")
            .end((err,response)=>{
                response.should.have.status(401);
                done();
            });
    });

    it('should NOT delete an option', (done)=> {
        chai.request(app)
            .delete("/quitaropcion/1")
            .set({"username":'lucas',"token":validToken})
            .end((err,response)=>{
                response.should.have.status(200);
                done();
            });
    });
});

describe('testing getuserinfo',()=>{
    it('should NOT get user info',(done)=>{
        chai.request(app)
            .get("/getuserinfo")
            .end((err,response)=>{
                response.should.have.status(401);
                done();
            });
    });

    it('should get getuserinfo',(done)=>{
        chai.request(app)
            .get("/getuserinfo")
            .set({"token":validToken})
            .end((err,response)=>{
                response.should.have.status(200);
                expect(response.body).to.be.a('object');
                expect(response.body.username).to.be.a('string');
                done();
            });
    });
});

describe('testing login',()=>{
    it('should not log in on wrong username',(done)=>{
        chai.request(app)
            .post("/login")
            .send({username: 'wrong', password: 'wrong'})
            .end((err,response) =>{
                response.should.have.status(409);
                done();
            });
    });

    it('should not log in with wrong password',(done)=>{
        chai.request(app)
            .post("/login")
            .send({username: 'lucas', password: 'wrong'})
            .end((err,response)=>{
                response.should.have.status(409);
                done();
            });
    });

    it('should log in with correct credentials',(done)=>{
        chai.request(app)
            .post("/login")
            .send({username:'lucas', password:'lucas'})
            .end((err,response)=>{
                response.should.have.status(200);
                response.body.should.be.a('object');
                expect(response.body).to.have.property("accessToken");
                expect(response.body).to.have.property("username");
                done();
            });
    });

    it('should not login on already logged in user',(done)=>{
        chai.request(app)
        .post("/login")
        .send({username:'test',password:'test'})
        .set({username:'lucas', token:validToken})
        .end((err,response)=>{
            response.should.have.status(406);
            done();
        });
        
    });
});