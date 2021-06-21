const Sauce = require('../models/sauce');
const mongoose = require('mongoose');
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

exports.modifySauce = (req, res, next) => {
	let sauceObject = req.file ?
		{
			...JSON.parse(req.body.sauce),
			imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
		} : { ...req.body }
	Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
		.then(() => res.status(200).json({
			message: 'Objet modifié'
		}))
		.catch(error => res.status(400).json({ error }));
};

// delete sauce

exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then(sauce => {
			const filename = sauce.imageUrl.split(('/images/'))[1];
			fs.unlink(`images/${filename}`, () => {
				Sauce.deleteOne({ _id: req.params.id })
					.then(() => res.status(200).json({
						message: 'Objet supprimé'
					}))
					.catch(error => res.status(400).json({ error }));
			})
		})
		.catch(error => res.status(400).json({ error }));
};

// afficher une sauce

exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then(sauce => res.status(200).json(sauce))
		.catch(error => res.status(404).json({ error }));
};

// afficher le tableau des sauces

exports.getAllSauce = (req, res, next) => {
	Sauce.find()
		.then(sauces => res.status(200).json(sauces))
		.catch(error => res.status(400).json({ error }));
};



// like ou dislike des sauces

exports.like = (req, res, next) => {
	switch (req.body.like) {
		// Défault = 0
		case 0:
			Sauce.findOne({ _id: req.params.id })
				.then((sauce) => {
					// Vérifie si user n'a pas déjà aimé la sauce //
					if (sauce.usersLiked.find(user => user === req.body.userId)) {
						Sauce.updateOne({ _id: req.params.id }, {
							$inc: { likes: -1 },
							$pull: { usersLiked: req.body.userId },
							_id: req.params.id
						})
							.then(() => { res.status(201).json({ message: 'Like retiré!' }); })
							.catch((error) => { res.status(400).json({ error: error }); });

						// Vérifie si user n'a pas déjà disliké la sauce //
					} if (sauce.usersDisliked.find(user => user === req.body.userId)) {
						Sauce.updateOne({ _id: req.params.id }, {
							$inc: { dislikes: -1 },
							$pull: { usersDisliked: req.body.userId },
							_id: req.params.id
						})
							.then(() => { res.status(201).json({ message: 'Dislike retiré !' }); })
							.catch((error) => { res.status(400).json({ error: error }); });
					}
				})
				.catch((error) => { res.status(404).json({ error: error }); });
			break;
		// Mise à jour quand likes = 1 //
		case 1:
			Sauce.updateOne({ _id: req.params.id }, {
				$inc: { likes: 1 },
				$push: { usersLiked: req.body.userId },
				_id: req.params.id
			})
				.then(() => { res.status(201).json({ message: 'Like ajouté !' }); })
				.catch((error) => { res.status(400).json({ error: error }); });
			break;

		// Mise à jour quand Dislike = -1 //
		case -1:
			Sauce.updateOne({ _id: req.params.id }, {
				$inc: { dislikes: 1 },
				$push: { usersDisliked: req.body.userId },
				_id: req.params.id
			})
				.then(() => { res.status(201).json({ message: 'Dislike ajouté !' }); })
				.catch((error) => { res.status(400).json({ error: error }); });
			break;
		default:
			console.error('mauvaise requête');
	}
}