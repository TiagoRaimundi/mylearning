const express = require("express");
const { createProduct, getProduct, getAllProduct } = require("../controller/productCtrl");


const router = express.Router();

router.post("/create", createProduct);

router.get("/get/:id", getProduct);
router.get("/getAll", getAllProduct);

module.exports = router;
