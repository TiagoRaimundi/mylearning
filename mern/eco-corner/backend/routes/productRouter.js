const express = require("express");
const { createProduct, getProduct, getAllProduct, updateProduct, deleteProduct } = require("../controller/productCtrl");
const {isAdmin, authMiddleware} = require('../middlewares/authMiddleware')

const router = express.Router();

router.post("/create",authMiddleware, isAdmin, createProduct);
router.get("/get/:id",getProduct);
router.put("/update/:id",authMiddleware, isAdmin, updateProduct);
router.delete("/delete/:id",authMiddleware, isAdmin, deleteProduct);
router.get("/getAll", getAllProduct);

module.exports = router;
