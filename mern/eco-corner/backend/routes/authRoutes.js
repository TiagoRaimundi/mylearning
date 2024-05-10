const express = require("express");
const {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
} = require("../controller/userCtrl");
const {authMiddleware} = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/");
router.get("/all-users", getAllUsers);
router.get("/:id", authMiddleware, getUser);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);

module.exports = router;
