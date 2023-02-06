// Importing the database bool from db2.js. This will allow me to connect to the database
const pool = require('../../db2');

// Importing custom classes
const MyError = require('../../utility/myError');
const Folder = require('./folder');
const utility = require('../../utility/utility');