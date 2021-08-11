const chai = require("chai");
const randomstring = require("randomstring")
const chaiHttp = require("chai-http")
const expect = require("chai").expect;
const { request } = require("chai");

chai.use(chaiHttp);
const localhost_url = "http://localhost:8080";
const heroku_url = "https://safetyout.herokuapp.com"
var url = localhost_url;
//url = heroku_url;

var request_id;

describe("Realitzar una solicitud d'amistad: ",() => {

    it("Retorna status 201 quan es dona d'alta una solicitut d'amistad", (done) => {
        chai.request(url)
        .post('/friendRequest')
        .send({
            user_id_request: "60b7e90ceac83d3f80f730bd",
            user_id_requested: "60b7e8c7eac83d3f80f730bc",
        })
        .end(function(err, res){
            expect(res).to.have.status(201);
            request_id = res.body.request_id;
            done();
        });
    });
    it("Retorna status 404 quan s'intenta donar d'alta una solicitut d'amistad i l'usuari que rep la solicitut no existeix", (done) => {
        chai.request(url)
        .post('/friendRequest')
        .send({
            user_id_request: "60b7e90ceac83d3f80f730bd",
            user_id_requested: "60b7e8c7eac83d3f80f73000",
        })
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta donar d'alta una solicitut d'amistat i l'usuari que envia la solicitud no existeix.", (done) => {
        chai.request(url)
        .post('/friendRequest')
        .send({
            user_id_request: "60b7e90ceac83d3f80f73000",
            user_id_requested: "60b7e8c7eac83d3f80f730bc",
        })
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });

});

describe("Acceptar una solicitud d'amistad: ",() => {

    it("Retorna status 200 quan s'accepta una solicitut d'amistad i l'usuari1 no era amic de l'usuari2 ", (done) => {
        chai.request(url)
        .post('/friendRequest/' + request_id + '/accept')
        .end(function(err, res){
            expect(res).to.have.status(200);
            chai.request(url)
            .post('/friendRequest/')
            .send({
                user_id_request: "60b7e90ceac83d3f80f730bd",
                user_id_requested: "60b7eb3f571a2d0dd025e6cd",
            })
            .end(function(err, response){
                request_id = response.body.request_id;
                done();
            });
        });
    });
    it("Retorna status 404 quan s'intenta acceptar una solicitut d'amistad i la solicitud no existeix", (done) => {
        chai.request(url)
        .post('/friendRequest/' + '606c65b16ccd0a00226ea000' + '/accept')
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});

describe("Denegar una solicitud d'amistad: ",() => {
    it("Retorna status 200 quan es denega una solicitut d'amistad", (done) => {
        chai.request(url)
        .post('/friendRequest/' + request_id + '/deny')
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta denegar una solicitut d'amistad i la solicitud no existeix", (done) => {
        chai.request(url)
        .post('/friendRequest/' + '606c65b16ccd0a00226ea000' + '/deny')
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});


//AQUESTA FUNCIONALITAT CORRESPON AL USER CONTROLLER ENCARA QUE ESTIGUI AQUÍ

describe("Esborrar contacte",() => {
    it("Retorna status 200 quan s'esborra un contacte", (done) => {
        chai.request(url)
        .delete('/user/' + '60b7e90ceac83d3f80f730bd' + '/friends/' + '60b7e8c7eac83d3f80f730bc')
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it("Retorna status 404 quan l'usuari no existeix", (done) => {
        chai.request(url)
        .delete('/user/' + '60b7e90ceac8300080f730bd' + '/friends/' + '60b7e8c7eac83d3f80f730bc')
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Retorna status 404 quan l'amic no existeix", (done) => {
        chai.request(url)
        .delete('/user/' + '60b7e90ceac83d3f80f730bd' + '/friends/' + '60b7e90ceac83d3f80f73000')
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Retorna status 404 quan els usuaris no son amics", (done) => {
        chai.request(url)
        .delete('/user/' + '60b7e90ceac83d3f80f730bd' + '/friends/' + '60b7e8c7eac83d3f80f730bc')
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});



