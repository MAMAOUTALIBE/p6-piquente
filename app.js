const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const saucesRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const app = express();

require('dotenv').config();
// mongoose connect
mongoose.connect('mongodb+srv://hamidou:BAHmamadou@cluster0.s5menqg.mongodb.net/?retryWrites=true&w=majority',
    { useNewUrlParser: true,
     useUnifiedTopology: true 
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// CORS - partage de ressources entre serveurs
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});



app.use(bodyParser.json()); //bodyparser

app.use(mongoSanitize()); // mongo-sanitize to prevent operator injection
app.use(helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
  })); // helmet

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app; // export de l'appli