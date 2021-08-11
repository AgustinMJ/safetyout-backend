const chai = require("chai");
const chaiHttp = require("chai-http")
const expect = require("chai").expect;
const Chat = require('../models/chat')


chai.use(chaiHttp);
const localhost_url = "http://localhost:8080";
const heroku_url = "https://safetyout.herokuapp.com"
var url = localhost_url;
//url = heroku_url;

var chat_id;

describe("Crear un nou xat ",() => {

    it("Retorna status 201 quan es crea un xat no existent", (done) => {
        chai.request(url)
        .post('/chat')
        .send({
            user1_id: '60a39b58f458df0022709fab',
            user2_id: '60a3a16bf458df0022709fb7'
        })
        .end(function(err, res){
            expect(res).to.have.status(201);
            chat_id = res.body.chat_id;
            done();
        });
    });
    it("Retorna status 409 quan s'intenta crear un xat ja existent", (done) => {
        chai.request(url)
        .post('/chat')
        .send({
            user1_id: '60a39b58f458df0022709fab',
            user2_id: '60a3a16bf458df0022709fb7'
        })
        .end(function(err, res){
            expect(res).to.have.status(409);
            done();
        });
    });
});


describe("Obtenir missatges d'un xat",() => {

    it("Retorna status 200 quan es consulten els missatges d'un xat existent", (done) => {
        chai.request(url)
        .get('/chat/' + chat_id+ '/messages')
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it("Retorna status 404 quan es consulten els missatges d'un xat inexistent", (done) => {
        chai.request(url)
        .get('/chat/' + '60a39c07f458df0022700000'+ '/messages')
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});

describe("Eliminar un xat ",() => {

    it("Retorna status 200 quan s'elimina un xat existent", (done) => {
        chai.request(url)
        .delete('/chat/' + chat_id)
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta eliminar un xat inexistent", (done) => {
        chai.request(url)
        .delete('/chat/' + chat_id)
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});
