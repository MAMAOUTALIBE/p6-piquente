const Sauce = require('../models/Sauce'); // import du modèle Sauce
const fs = require('fs'); // file system, package qui permet de modifier et/ou supprimer des fichiers



exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;    
    const sauce = new Sauce({ // un nouvel objet sauce est crée avec le model Sauce
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,   // l'url de l'images enregistrée dans le dossier images du serveur est aussi stockée dans la bdd      
    });
    sauce.save() // la sauce est sauvegardée dans la bdd
    .then( () => res.status(201).json({ message: 'Sauce saved'}))
    .catch( error => res.status(400).json({ error }))
    console.log(sauce);
    
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? // on vérifie si la modification concerne le body ou un nouveau fichier images
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id} , {...sauceObject, _id: req.params.id})
    .then(()=> res.status(200).json({ message: 'Sauce modified'}))
    .catch(()=> res.status(400).json({ error}))
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}) // on identifie la sauce
    .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1]; // on récupère l'adresse de l'images
    fs.unlink(`images/${filename}`, () => { /// on la supprime du serveur
    Sauce.deleteOne({_id: req.params.id}) // on supprime la sauce de la bdd
    .then(()=> res.status(200).json({ message: 'Sauce deleted'}))
    .catch(error => res.status(400).json({ error}))
    });
})
};

exports.likeSauce = (req, res, next) => {    
    const like = req.body.like;
    if(like === 1) { // option j'aime
        Sauce.updateOne({_id: req.params.id}, { $inc: { likes: 1}, $push: { usersLiked: req.body.userId}, _id: req.params.id })
        .then( () => res.status(200).json({ message: 'You like this sauce' }))
        
        .catch( error => res.status(400).json({ error}))
    } else if(like === -1) { // option j'aime pas
        Sauce.updateOne({_id: req.params.id}, { $inc: { dislikes: 1}, $push: { usersDisliked: req.body.userId}, _id: req.params.id })
        .then( () => res.status(200).json({ message: 'You don\'t like this sauce' }))
        .catch( error => res.status(400).json({ error}))

    } else {    //option annulation du j'aime ou / j'aime pas
        Sauce.findOne( {_id: req.params.id})
        .then( sauce => {
            if( sauce.usersLiked.indexOf(req.body.userId)!== -1){
                 Sauce.updateOne({_id: req.params.id}, { $inc: { likes: -1},$pull: { usersLiked: req.body.userId}, _id: req.params.id })
                .then( () => res.status(200).json({ message: 'You don\'t like this sauce anymore ' }))
                .catch( error => res.status(400).json({ error}))
                }
            else if( sauce.usersDisliked.indexOf(req.body.userId)!== -1) {
                Sauce.updateOne( {_id: req.params.id}, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId}, _id: req.params.id})
                .then( () => res.status(200).json({ message: 'You might like this sauce now ' }))
                .catch( error => res.status(400).json({ error}))
                }           
        })
        .catch( error => res.status(400).json({ error}))             
    }   
};

exports.getAllSauces = (req, res, next) => { // on récupère toutes les sauces
    Sauce.find()
    .then( sauces => res.status(200).json(sauces))
    .catch( error => res.status(400).json({ error }))
};
exports.getOneSauce = (req, res, next) => {  // on récupère une seule sauce
    Sauce.findOne({_id : req.params.id})
    .then( sauce => res.status(200).json(sauce))
    .catch( error => res.status(404).json({ error }))
};

