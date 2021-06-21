// import bcrypt hasher le mdp utilisateur
const bcrypt = require('bcrypt');

// import jwt pour attribuer un token à un utilisateur au moment ou il se connecte
const jwt = require('jsonwebtoken');

const MaskData = require("maskdata");


// import dotenv pour masquer les informations de connexion à la base de donées à l'aide de variable d'environnement 
require('dotenv').config();

// import model user
const User = require('../models/user');



// création nouvel utilisateur (signup)
exports.signup = (req, res, next)=>{
    bcrypt.hash(req.body.password, 10)
        .then(hash=>{
            const user = new User({
                email: MaskData.maskEmail2(req.body.email),
                password: hash
            });
            
            user.save()
                .then(() => res.status(201).json({message: 'utilisateur créé !'}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.statuts(500).json({error}));
};

// login
exports.login = (req, res, next)=>{
    User.findOne({ email: MaskData.maskEmail2(req.body.email)})
        .then(user =>{
            if(!user){
                return res.status(401).json({ error: 'Utilisateur non trouvé ! '});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid =>{
                    if(!valid){
                        return res.status(401).json({error : 'Mot de passé incorrect !'});
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWT_SECRET,
                            { expiresIn: '24h' }
                        ),
                    });
                })
                .catch(error => res.status(500).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

