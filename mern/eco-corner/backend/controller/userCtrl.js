const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");
const { generateRefreshToken } = require("../config/refreshToken");
generateRefreshToken;
const jwt = require('jsonwebtoken')

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
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("refreshToken", refreshToken,{
      httpOnly: true,
      maxAge: 72*60*60*1000,
    });
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

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    return res.status(401).json({ message: "No Refresh Token in Cookies" });
  }

  const refreshToken = cookies.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(401).json({ message: 'No user found with this refresh token' });
  }

  try {
    const decoded = await jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (user._id.toString() !== decoded.id) { // Ensure your ID is correctly compared
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateToken(user._id); // Assuming generateToken is defined correctly
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'There is something wrong with the refresh token', error: err.message });
  }
});

//logout functionality
const logout = asyncHandler(async(req, res) => {
  const cookies = req.cookies;

  // Check if the refresh token exists in cookies 
  if (!cookies?.refreshToken) {
    return res.status(400).json({ message: "No Refresh Token in Cookies!" }); // Bad request as no token found
  }

  const refreshToken = cookies.refreshToken;

  // Find the user with this refresh token
  const user = await User.findOne({ refreshToken });
  if (!user) {
    // If no user is found with the refresh token, clear the cookie and return no content
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true, // Ensure you set 'secure: true' only if you are using HTTPS
      sameSite: 'none' // Necessary if your frontend and backend aren't served from the same domain and using HTTPS
    });
    return res.sendStatus(204); // Properly send the response
  }

  // If user exists, remove the refreshToken from the user and database
  await User.findByIdAndUpdate(refreshToken._id, { $unset: { refreshToken: "" } });

  // Clear the refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true, // Ensure 'secure' is used in production with HTTPS
    sameSite: 'none' // Set accordingly based on your deployment environment
  });

  
  return res.sendStatus(204);
});

//update a user
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(id);
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
  const { id } = req.params;
  validateMongoDbId(id);

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
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteUser = await User.findByIdAndDelete(id);

    res.json({
      deleteUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      { new: true }
    );

    res.json({
      block,
      message: "User blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      { new: true }
    );
    res.json({
      unblock,
      message: "User UnBlocked",
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
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout
};
