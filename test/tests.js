const app = require('../app.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const spies=require('chai-spies');
const Connection = require('mysql2/typings/mysql/lib/Connection.js');
const validateJWT  = require('../jwt-functions/jwt-functions.js').validateJWT;
const extractTokenInfo  = require('../jwt-functions/jwt-functions.js').extractTokenInfo;
const expect = require('chai').expect;
chai.should();
chai.use(chaiHttp);
chai.use(spies);

const validToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imx1Y2FzIiwiaWF0IjoxNjcxNDcxOTAzLCJleHAiOjE2NzI5NTgzMDN9.qrbaImy3MXFXxFQA8Uq-zDWOhNzFrqpm8jlt1w7LeC4';

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
});

describe('testing opciones', ()=>{
    it('should not get opciones',(done)=>{
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