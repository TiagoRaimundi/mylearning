const express = require("express");
const { createProduct, getProduct } = require("../controller/productCtrl");


const router = express.Router();

router.post("/create", createProduct);

router.post("/get/:id", getProduct);

module.exports = router;
