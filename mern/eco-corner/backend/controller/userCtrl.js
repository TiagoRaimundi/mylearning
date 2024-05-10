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
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid credentials");
  }
});
//update a user

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );

    res.json(updateUser);
  } catch (error) {
    throw new Error(error);
  }
});
//get all users

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

//get a single user

const getUser = asyncHandler(async (req, res) => {
  console.log(req.params);
  const { id } = req.params;

  try {
    const getUser = await User.findById(id);
    res.json({
      getUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  console.log(req.params);
  const { id } = req.params;

  try {
    const deleteUser = await User.findByIdAndDelete(id);

    res.json({
      deleteUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
};
