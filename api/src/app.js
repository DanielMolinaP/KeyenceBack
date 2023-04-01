const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const routes = require('./routes/index.js');
const multer = require('multer');
const path = require('path');

require('./db.js');

const server = express();
const cors = require('cors')

server.name = 'API';

server.use(cors())
server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(cookieParser());
server.use(morgan('dev'));
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// Configurar Multer para manejar los archivos Excel
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, './uploads')); // Directorio donde se almacenarán los archivos subidos
  },
  filename: function(req, file, cb) {
    const fileName = path.parse(file.originalname).name;
    const fileExtension = path.parse(file.originalname).ext;
    const tableName = fileName + '_' + Date.now();
    cb(null, tableName + fileExtension);
  }
});

const upload = multer({ storage: storage });



server.use('/',upload.single('file'), routes);

// Error catching endware.
server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;
