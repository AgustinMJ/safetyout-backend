const chai = require("chai");
const randomstring = require("randomstring")
const chaiHttp = require("chai-http")
const expect = require("chai").expect;
const user = require("../models/user");

chai.use(chaiHttp);
const localhost_url = "http://localhost:8080";
const heroku_url = "https://safetyout.herokuapp.com"
var url = localhost_url;
//url = heroku_url;

const userEmail = randomstring.generate(8) + "@estudiantat.upc.edu";

var user_id;

describe("Registre d'usuari: ",() => {

    it('Retorna status 201 quan es crea un usuari amb email no registrat', (done) => {
        chai.request(url)
        .post('/user/signup')
        .send({
            name: "Sergi",
            surnames: "Doce Planas",
            email: userEmail,
            password: "123456",
            birthday: "1999-10-13",
            gender: "Male"
        })
        .end(function(err, res){
            expect(res).to.have.status(201);
            user_id = res.body.userId;
            done();
        });
    });
    it("Retorna status 409 quan s'intenta registrar un usuari amb email ja registrat", (done) => {
        chai.request(url)
        .post('/user/signup')
        .send({
            name: "Sergi",
            surnames: "Doce Planas",
            email: userEmail,
            password: "123456",
            birthday: new Date(1999, 9, 12),
            gender: "Male"
        })
        .end(function(err, res){
            expect(res).to.have.status(409);
            done();
        });
    });
});

describe("Obtenir id a partir del email",() => {
    it("Retorna status 200 quan es retorna un id amb exit", (done) => {
        chai.request(url)
        .get('/user')
        .query({
            email:userEmail
        })
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
});

describe("Inici de sessió: ",() => {

    it("Retorna status 200 quan s'inicia sessió amb un email registrat i contrasenya correcte", (done) => {
        chai.request(url)
        .post('/user/login')
        .send({
            email: userEmail,
            password: "123456",
        })
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta iniciar sessió amb un email que no està registrat", (done) => {
        chai.request(url)
        .post('/user/login')
        .send({
            email: randomstring.generate(8) + "@estudiantat.upc.edu",
            password: "123456",
        })
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Retorna status 401 quan s'intenta iniciar sessió amb un email que està registrat però amb contrasenya incorrecte", (done) => {
        chai.request(url)
        .post('/user/login')
        .send({
            email: userEmail,
            password: "12345",
        })
        .end(function(err, res){
            expect(res).to.have.status(401);
            done();
        });
    });
});

describe("Consulta perfil",() => {
    it("Retorna status 200 quan es consulta un perfil qualsevol amb èxit", (done) => {
        chai.request(url)
        .get('/user/' + user_id)
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta consultar perfil d'un usuari que no existeix", (done) => {
        chai.request(url)
        .get('/user/' + "604ca4f3482d773160499000")
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
    

});



describe("Modifica perfil",() => {
    it("Retorna status 201 quan es modifica un perfil qualsevol amb èxit", (done) => {
        chai.request(url)
        .patch('/user/' + user_id)
        .send({
            new_name: "Nou nom",
            new_surnames: "Nou cognom",
            profileImage: null   
        })
        .end(function(err, res){
            expect(res).to.have.status(201);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta modificar la informació d'un usuari que no existeix", (done) => {
        chai.request(url)
        .patch('/user/' + "604ca4f3482d773160499000")
        .send({
            new_name: "Nou nom",
            new_surnames: "Nou Cognom",
            profileImage: null   
        })
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
    

});

describe("Eliminar compte: ",() => {
    it("Retorna status 200 quan s'elimina el compte d'un usuari amb éxit", (done) => {
        chai.request(url)
        .delete('/user/' + user_id)
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta donar de baixa un compte d'un usuari que no existeix", (done) => {
        chai.request(url)
        .delete('/user' + '604ca4f3482d770000499269')
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});
