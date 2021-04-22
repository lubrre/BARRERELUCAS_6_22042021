// import framework express
const express = require('express');

// import package body-parser qui permet d'extraire l'objet JSON des requêtes POST
const bodyParser = require('body-parser');

// import package mongoose pour se connecter à la database mongoDB
const mongoose = require('mongoose');

//import package pour upload images et travailler avec les répertoires et chemin de fichier
const path = require('path');

// Importation du package Helmet vous aide à protéger votre application de certaines des vulnérabilités bien connues du Web en configurant de manière appropriée des en-têtes HTTP.
const helmet = require('helmet');


// déclaration des routes (sauce + user)
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');


// connexion à database mongoBD
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.61s5b.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {useNewUrlParser: true,
    useUnifiedTopology: true })
        .then(() => console.log('Connexion à MongoDB réussie !'))
        .catch(() => console.log('Connexion à MongoDB échouée !'));

// création d'un application express
const app = express();

// middleware header qui permet à toutes les demandes de toutes les origines d'accèder à l'api
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

// middleware qui permet de transformer le corps de la requête en un objet JSON utilisable
app.use(bodyParser.json());


// middleware qui permet de charger les fichiers qui sont dans le repertoire image
app.use('/images', express.static(path.join(__dirname, 'images')));

// routes dédiées (sauce + user)
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);


// export de l'app express pour y accéder depuis server.js
module.exports = app;