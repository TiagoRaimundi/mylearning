const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const newProduct = await Product.create(req.body);

    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    // Checking if the id is a valid ObjectId
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: new ObjectId(id) }, // Correctly using new with ObjectId
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    next(error); // Proper error handling in Express
  }
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    // Checking if the id is a valid ObjectId
    return res.status(400).json({ message: "Invalid ID format" });
  }
  try {
    const deleteProduct = await Product.findOneAndDelete(id);

    if (!deleteProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(deleteProduct);
  } catch (error) {
    next(error); // Proper error handling in Express
  }
});

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["Page", "sort", "limit", "fields"];
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));

    //Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(", ").join(", ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(", ").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__V");
    }

    //pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limtit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This page does not exists");
    }
    const product = await query;
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
};
