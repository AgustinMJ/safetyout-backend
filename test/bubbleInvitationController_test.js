const chai = require("chai");
const randomstring = require("randomstring")
const chaiHttp = require("chai-http")
const expect = require("chai").expect;

chai.use(chaiHttp);
const localhost_url = "http://localhost:8080";
const heroku_url = "https://safetyout.herokuapp.com"
var url = localhost_url;
//url = heroku_url;


var bubble_id;

describe("Donar d'alta una bombolla: ",() => {
    it("Retorna status 201 quan es dona d'alta bombolla nova", (done) => {
        chai.request(url)
        .post('/bubble')
        .send({
            user_id: "60b7e90ceac83d3f80f730bd",
            bubble_name: "Test"
        })
        .end(function(err, res){
            expect(res).to.have.status(201);
            bubble_id = res.body.bubble_id;
            done();
        });
    });
    it("Retorna status 404 quan s'intenta donar d'alta una bombolla i l'usuari administrador no existeix.", (done) => {
        chai.request(url)
        .post('/bubble')
        .send({
            user_id: "60a39b58f458df0022709000",
            bubble_name: "Test"
        })
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Retorna status 409 quan s'intenta donar d'alta una bombolla amb el mateix nom que una altra ja administrada per l'usuari indicat", (done) => {
        chai.request(url)
        .post('/bubble')
        .send({
            user_id: "60b7e90ceac83d3f80f730bd",
            bubble_name: "Test"
        })
        .end(function(err, res){
            expect(res).to.have.status(409);
            done();
        });
    });
});


var invitation_id;

describe("Donar d'alta una nova invitació a bombolla: ",() => {

    it("Retorna status 201 quan es dona d'alta una invitació a bombolla nova", (done) => {
        chai.request(url)
        .post('/bubbleInvitation/')
        .send({
            invitee_id: "60b7e8c7eac83d3f80f730bc",
            bubble_id: bubble_id,
            invited_by_id: "60b7e90ceac83d3f80f730bd",
        })
        .end(function(err, res){
            expect(res).to.have.status(201);
            invitation_id = res.body.invitation_id;
            done();
        });
    });
    it("Retorna status 404 quan s'intenta donar d'alta una invitació a bombolla i l'usuari invitat no existeix.", (done) => {
        chai.request(url)
        .post('/bubbleInvitation/')
        .send({
            invitee_id: "60a3a16bf458df0022709000",
            bubble_id: bubble_id,
            invited_by_id: "60b7e90ceac83d3f80f730bd", 
        })
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta donar d'alta una invitació a bombolla i l'usuari que invita no existeix.", (done) => {
        chai.request(url)
        .post('/bubbleInvitation/')
        .send({
            invitee_id: "60b7e8c7eac83d3f80f730bc",
            bubble_id: bubble_id,
            invited_by_id: "60a39b58f458df0022709000",
        })
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta donar d'alta una invitació a bombolla i la bombolla no existeix.", (done) => {
        chai.request(url)
        .post('/bubbleInvitation/')
        .send({
            invitee_id: "60b7e8c7eac83d3f80f730bc",
            bubble_id: "606c65b16ccd0a00226ea000",
            invited_by_id: "60a39b58f458df0022709fab",
        })
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});



describe("Acceptar invitació a bombolla: ",() => {

    it("Retorna status 200 quan s'accepta una invitació a una bombolla de la qual un usuari no forma part", (done) => {
        chai.request(url)
        .post('/bubbleInvitation/'+ invitation_id +'/accept')
        .end(function(err, res){
            expect(res).to.have.status(200);
            chai.request(url)
            .post('/bubbleInvitation/')
            .send({
                invitee_id: "60b7eb3f571a2d0dd025e6cd",
                bubble_id: bubble_id,
                invited_by_id: "60b7e90ceac83d3f80f730bd",
            })
            .end(function(err, response){
                invitation_id = response.body.invitation_id;
                done();
            });
            
        });
    });

    it("Retorna status 404 quan la invitacio no existeix", (done) => {
        chai.request(url)
        .post('/bubbleInvitation/'+ '606c65b16ccd0a00226ea000' +'/accept')
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});


describe("Denegar invitació a bombolla: ",() => {

    it("Retorna status 200 quan es denega una invitació a una bombolla", (done) => {
        chai.request(url)
        .post('/bubbleInvitation/'+ invitation_id +'/deny')
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });

    it("Retorna status 404 quan la invitacio no existeix", (done) => {
        chai.request(url)
        .post('/bubbleInvitation/'+ invitation_id +'/deny')
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});

describe("Modifica una bombolla: ",() => {
    it("Retorna status 200 quan es modifica una bombolla", (done) => {
        chai.request(url)
        .patch('/bubble/' + bubble_id)
        .send({
            bubble_new_name: "testing",
            bubble_new_admin: "60b7e8c7eac83d3f80f730bc",
        })
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta modificar una bombolla no existent", (done) => {
        chai.request(url)
        .patch('/bubble/' + "60a39b58f458df0022709000")
        .send({
            bubble_new_name: "testing",
            bubble_new_admin: "60b7e8c7eac83d3f80f730bc",
        })
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});

//REVISAR

describe("Donar de baixa a un usuari d'una bombolla: ",() => {
    it("Retorna status 200 quan es dona de baixa una bombolla", (done) => {
        chai.request(url)
        .delete('/bubble/' + bubble_id + '/members/' + '60b7e8c7eac83d3f80f730bc')
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta donar de baixa una bombolla que no existeix", (done) => {
        chai.request(url)
        .delete('/bubble/' + '60b7e8c7eac83d3f80f73000' + '/members/' + '60b7e8c7eac83d3f80f730bc')
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});


//FINS AQUI


describe("Donar de baixa una bombolla: ",() => {
    it("Retorna status 200 quan es dona de baixa una bombolla", (done) => {
        chai.request(url)
        .delete('/bubble/' + bubble_id)
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta donar de baixa una bombolla que no existeix", (done) => {
        chai.request(url)
        .delete('/bubble/' + bubble_id)
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});

