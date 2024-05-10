const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // Usar findOne em vez de find, para retornar um único documento
  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    // Se não encontrar um usuário, cria um novo
    try {
      const newUser = await User.create(req.body);
      res.json(newUser);
    } catch (error) {
      // Trata o erro de criação do usuário
      res.status(500).json({
        msg: "Error creating user",
        success: false,
        error: error.message,
      });
    }
  } else {
    // Se encontrar um usuário, retorna uma mensagem de usuário existente
    throw new Error("User Already Exists");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if user exists or not
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    res.json({
      _id: findUser?._id,
      firstname:findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid credentials");
  }
});

module.exports = { createUser, loginUser };
