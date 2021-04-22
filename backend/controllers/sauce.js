const Sauce = require('../models/sauce');
const fs = require('fs');

// create sauce 

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLikes: [],
      usersDislikes: [],
    });
	const regex = /^[a-zA-Z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ.?!,_\s-]{3,150}$/;
	if (
		!regex.test(sauceObject.name) ||
		!regex.test(sauceObject.manufacturer) ||
		!regex.test(sauceObject.description) ||
		!regex.test(sauceObject.mainPepper)
	) {
		const filename = sauce.imageUrl.split('/images/')[1];
		fs.unlinkSync(`images/${filename}`);
		res.writeHead(
			400,
			'{"message":"Vous devez utiliser entre 3 et 150 caractères, et ne pas utiliser de caractères spéciaux !"}',
			{
				'content-type': 'application/json',
			},
		);
		res.end('Format sauce incorrect !');
	} else {
		sauce
			.save()
			.then(() => res.status(201).json({ message: 'Objet enregistré !' }))
			.catch(error => res.status(400).json({ error }));
	}
};

// modifiy sauce

exports.modifySauce = (req, res, next)=>{
    let sauceObject = req.file ? 
    { 
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body}
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then(()=>res.status(200).json({
            message: 'Objet modifié'
        }))
        .catch(error => res.status(400).json({ error }));
};

// delete sauce

exports.deleteSauce = (req, res, next)=>{
    Sauce.findOne({_id: req.params.id})
        .then(sauce =>{
            const filename = sauce.imageUrl.split(('/images/'))[1];
            fs.unlink(`images/${filename}`, ()=>{
                Sauce.deleteOne({_id: req.params.id})
                .then(()=>res.status(200).json({
                    message: 'Objet supprimé'
                }))
                .catch(error => res.status(400).json({ error }));
            })
        })
        .catch(error => res.status(400).json({ error }));
    
};

// afficher une sauce

exports.getOneSauce = (req, res, next)=>{
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// afficher le tableau des sauces

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
    .then(sauces=> res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};



// like ou dislike des sauces

exports.likeDislikeSauce = (req, res, next) => {
	// Si il s'agit d'un like
	// On push l'utilisateur et on incrémente le compteur de 1
	if (req.body.like === 1) {
		Sauce.updateOne(
			{
				_id: req.params.id,
			},
			{
				$push: {
					usersLiked: req.body.userId,
				},
				$inc: {
					likes: +1,
				},
			},
		)
			.then(() =>
				res.status(200).json({
					message: "j'aime ajouté !",
				}),
			)
			.catch(error =>
				res.status(400).json({
					error,
				}),
			);
	}
	// S'il s'agit d'un dislike
	// On push l'utilisateur et on incrémente le compteur de 1
	if (req.body.like === -1) {
		Sauce.updateOne(
			{
				_id: req.params.id,
			},
			{
				$push: {
					usersDisliked: req.body.userId,
				},
				$inc: {
					dislikes: +1,
				},
			},
		)
			.then(() => {
				res.status(200).json({
					message: 'Dislike ajouté !',
				});
			})
			.catch(error =>
				res.status(400).json({
					error,
				}),
			);
	}
	// Si il s'agit d'annuler un like ou un dislike
	// Si il s'agit d'annuler un like
	// On pull l'utilisateur et on incrémente le compteur de -1
	if (req.body.like === 0) {
		Sauce.findOne({
			_id: req.params.id,
		})
			.then(sauce => {
				if (sauce.usersLiked.includes(req.body.userId)) {
					Sauce.updateOne(
						{
							_id: req.params.id,
						},
						{
							$pull: {
								usersLiked: req.body.userId,
							},
							$inc: {
								likes: -1,
							},
						},
					)
						.then(() =>
							res.status(200).json({
								message: 'Like retiré !',
							}),
						)
						.catch(error =>
							res.status(400).json({
								error,
							}),
						);
				}
				// Si il s'agit d'annuler un dislike
				// On pull l'utilisateur et on incrémente le compteur de -1
				if (sauce.usersDisliked.includes(req.body.userId)) {
					Sauce.updateOne(
						{
							_id: req.params.id,
						},
						{
							$pull: {
								usersDisliked: req.body.userId,
							},
							$inc: {
								dislikes: -1,
							},
						},
					)
						.then(() =>
							res.status(200).json({
								message: 'Dislike retiré !',
							}),
						)
						.catch(error =>
							res.status(400).json({
								error,
							}),
						);
				}
			})
			.catch(error =>
				res.status(404).json({
					error,
				}),
			);
	}
};