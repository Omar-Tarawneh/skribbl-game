'use strict';
const { server } = require('./src/server.js');
require('dotenv').config();

const PORT = process.env.PORT || 3030;

server.listen(PORT, () => console.log('Listening on PORT ' + PORT));
