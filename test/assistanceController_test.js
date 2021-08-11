const chai = require("chai");
const randomstring = require("randomstring")
const chaiHttp = require("chai-http")
const expect = require("chai").expect;

chai.use(chaiHttp);
const localhost_url = "http://localhost:8080";
const heroku_url = "https://safetyout.herokuapp.com"
var url = localhost_url;
//url = heroku_url;



describe("Donar d'alta una nova assistència: ",() => {

    it("Retorna status 201 quan es dona d'alta una assistència nova", (done) => {
        chai.request(url)
        .post('/assistance')
        .send({
            user_id: "60b7e90ceac83d3f80f730bd",
            place_id: "ChIJqwS6fjiuEmsRJAMiOY9MSms",
            dateInterval:{
                startDate: {
                    year:"2070",
                    month:"9",
                    day:"14",
                    hour:"15",
                    minute:"0",
                },
                endDate: {
                    year:"2070",
                    month:"10",
                    day:"14",
                    hour:"19",
                    minute:"0",
                }
            }
        })
        .end(function(err, res){
            expect(res).to.have.status(201);
            done();
        });
    });
    it("Retorna status 409 quan s'intenta donar d'alta una assistència amb un usuari que no existeix", (done) => {
        chai.request(url)
        .post('/assistance')
        .send({
            user_id: "60a39b58f458df0022709000",
            place_id: "ChIJqwS6fjiuEmsRJAMiOY9MSms",
            dateInterval:{
                startDate: {
                    year:"2000",
                    month:"9",
                    day:"14",
                    hour:"15",
                    minute:"0",
                },
                endDate: {
                    year:"2000",
                    month:"9",
                    day:"14",
                    hour:"19",
                    minute:"0",
                }
            }
        })
        .end(function(err, res){
            expect(res).to.have.status(409);
            done();
        });
    });
    it("Retorna status 409 quan s'intenta donar d'alta una assistència que ja existeix", (done) => {
        chai.request(url)
        .post('/assistance')
        .send({
            user_id: "60b7e90ceac83d3f80f730bd",
            place_id: "ChIJqwS6fjiuEmsRJAMiOY9MSms",
            dateInterval:{
                startDate: {
                    year:"2070",
                    month:"9",
                    day:"14",
                    hour:"15",
                    minute:"0",
                },
                endDate: {
                    year:"2000",
                    month:"10",
                    day:"14",
                    hour:"19",
                    minute:"0",
                }
            }
        })
        .end(function(err, res){
            expect(res).to.have.status(409);
            done();
        });
    });
});

describe("Consultar assistències futures: ",() => {

    it("Retorna status 200 quan l'usuari existeix tingui o no tingui assistències futures", (done) => {
        chai.request(url)
        .get('/assistance/consultFuture')
        .query({
            user_id: "60b7e90ceac83d3f80f730bd",
        })
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });

    it("Retorna status 409 quan s'intenta consultar un usuari que no existeix", (done) => {
        chai.request(url)
        .get('/assistance/consultFuture')
        .query({
            user_id: "60a39b58f458df0022709000",
        })
        .end(function(err, res){
            expect(res).to.have.status(409);
            done();
        });
    });
});


describe("Consultar assistències en una data: ",() => {

    it("Retorna status 200 quan l'usuari existeix i té alguna asistència en la data donada", (done) => {
        chai.request(url)
        .get('/assistance/consultOnDate')
        .query({
            user_id: "60b7e90ceac83d3f80f730bd",
            year:"2070",
            month:"9",
            day:"14"
        })
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });

    it("Retorna status 409 quan s'intenta consultar un usuari que no existeix", (done) => {
        chai.request(url)
        .get('/assistance/consultOnDate')
        .query({
            user_id: "60a39b58f458df0022709000",
            year:"2000",
            month:"9",
            day:"14",
        })
        .end(function(err, res){
            expect(res).to.have.status(409);
            done();
        });
    });
});

describe("Modificar assistència: ",() => {

    it("Retorna status 200 quan es modifica una assistència", (done) => {
        chai.request(url)
        .patch('/assistance')
        .send({
            user_id: "60b7e90ceac83d3f80f730bd",
            place_id: "ChIJqwS6fjiuEmsRJAMiOY9MSms",
            dateInterval: {
                startDate: {
                    "day":  "14",
                    "month":  "9",
                    "year":  "2070",
                    "hour":  "15",
                    "minute": "0" 

                }
            },
            newStartDate:{
                "year": "1999",
                "month": "10",
                "day": "13",
                "hour": "15",
                "minute":"0"
            },
            newEndDate:{
                "year": "2999",
                "month": "10",
                "day": "13",
                "hour": "15",
                "minute":"0"
            }

        })
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });

    it("Retorna status 404 quan s'intenta modificar una assistència que no existeix", (done) => {
        chai.request(url)
        .patch('/assistance')
        .send({
            user_id: "60b7e90ceac83d3f80f730bd",
            place_id: "ChIJqwS6fjiuEmsXXAMiOY9MSms",
            dateInterval:{
                startDate: {
                    year:"2070",
                    month:"9",
                    day:"14",
                    hour:"15",
                    minute:"0",
                },
            },
            newStartDate:{
                year:"2070",
                month:"10",
                day:"14",
                hour:"15",
                minute:"0",
            },
            newEndDate:{
                year:"2070",
                month:"11",
                day:"14",
                hour:"15",
                minute:"0",
            }
        })
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});


describe("Eliminar una assistència existent: ",() => {

    it("Retorna status 200 quan s'elimina una assistència existent", (done) => {
        chai.request(url)
        .delete('/assistance')
        .send({
            user_id: "60b7e90ceac83d3f80f730bd",
            place_id: "ChIJqwS6fjiuEmsRJAMiOY9MSms",
            dateInterval:{
                startDate: {
                    "year": "1999",
                    "month": "10",
                    "day": "13",
                    "hour": "15",
                    "minute":"0"
                }
            }
        })
        .end(function(err, res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it("Retorna status 404 quan s'intenta eliminar una assistència que no existeix", (done) => {
        chai.request(url)
        .delete('/assistance')
        .send({
            user_id: "60b7e90ceac83d3f80f730bd",
            place_id: "ChIJqwS6fjiuEmsRJAMiOY9MSms",
            dateInterval:{
                startDate: {
                    year:"1984",
                    month:"9",
                    day:"14",
                    hour:"15",
                    minute:"0",
                }
            }
        })
        .end(function(err, res){
            expect(res).to.have.status(404);
            done();
        });
    });
});
