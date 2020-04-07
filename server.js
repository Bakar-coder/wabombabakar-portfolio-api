// import app dependencies
'use strict';
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const config = require('config');
const fs = require('fs');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');
const { mongoDB } = require('./utils/database');
const { join } = require('path');
const port = process.env.PORT || 5000;
const app = express();

// check for a secret key
if (!config.get('jwtPrivateKey')) {
  console.log('No private key provided!..................................');
  process.exit(1);
}

// check for production database-connection
if (process.env.NODE_ENV === 'production' && !config.get('mongoProdDb')) {
  console.log('No mongoURI string provided!..............................');
  process.exit(1);
}

// import all routes
const Home = require('./routes');

// create error access logs
const accessLogStream = fs.createWriteStream(join(__dirname, 'access.log'), {
  flags: 'a'
});

// define all middleWare functions
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));
app.use('/data/resume', express.static(join(__dirname, 'data/resume')));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(
  morgan('combined', {
    stream: accessLogStream,
    skip: (req, res) => res.statusCode < 400
  })
);
app.use(helmet());
app.use(compression());
app.use('/api', Home);

// create a mongodb database connection
mongoose
  .connect(mongoDB(), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: true
  })
  .then(() => console.log('connected to mongoDB Database'))
  .catch(ex => console.error('Database Connection Error! -', ex));

// start the application
app.listen(port, () => console.log(`serving app on port: ${port}`));
