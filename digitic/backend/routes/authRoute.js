const express = require('express');
const { createUser } = require('../controller/useCtrl');


const router= express.Router();
createUser
router.post('/register', createUser)

module.exports = router