'use strict'

var app = require('./app');
var port = process.env.PORT || 3999;

/*
SOLO PARA MONGODB

const uri = "mongodb+srv://pablo:pablo@data-odwhn.mongodb.net/api-rest-node?retryWrites=true";
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(uri,{ useNewUrlParser: true }, function(err,client){
  if(err){console.log('Error')};
  if(client){
    console.log('Conexxion correcta al servidor');
    // const db = client.db("api-rest-node");
    // client.close();
    // Crear el servidor
    client.close();
    app.listen(port,()=>{
      console.log('El servidor http esta funcionando');
    });
  }
});*/

const MC_url = "mongodb+srv://pablo:pablo@data-odwhn.mongodb.net/api-rest-node";
// ops ?ssl=true&replicaSet=primaryhostname&authSource=admin
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(MC_url,{ useNewUrlParser: true, 'useFindAndModify': false })
        .then(() =>{
          console.log('Conexiôn correcta al servidor');          
          app.listen(port,()=>{
            console.log('El servidor http esta funcionando');
          });
        })
        .catch((error)=> console.log('Error al abrir la base de datos'));






  

