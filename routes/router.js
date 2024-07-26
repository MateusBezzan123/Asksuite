const express = require('express');
const router = express.Router();
const searchController = require('../controller/searchController');

router.get('/', (req, res) => {
    res.send('Hello Asksuite World!');
});

router.post('/search', searchController.search);

module.exports = router;
