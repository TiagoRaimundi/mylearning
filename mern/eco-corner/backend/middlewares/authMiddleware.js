const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
        // Correção: split(' ') para pegar o token após o espaço
        token = req.headers.authorization.split(" ")[1]; // Espaço após 'Bearer '
      
        // Verifica se o token existe
        if (token) {
          // Verifica o token
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log(decoded);
      
          // Busca o usuário uma vez e exclui a senha da resposta
          const user = await User.findById(decoded.id).select("-password");
          if (!user) {
            return res.status(401).json({ message: "User not found" });
          }
      
          // Anexa o usuário ao objeto de requisição
          req.user = user;
      
          // Chama o próximo middleware na pilha
          next();
        }
    } catch (error) {
      // Usar res.status para enviar uma resposta apropriada
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("No token attached to header, authorization denied");
  }
});

module.exports = { authMiddleware };
