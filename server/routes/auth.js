const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
} = require("../controllers/authController");
const {
  authValidations,
  handleValidationErrors,
} = require("../utils/validation");

// Ruta para registro de usuarios
router.post(
  "/register",
  authValidations.register,
  handleValidationErrors,
  register
);

// Ruta para login de usuarios
router.post("/login", authValidations.login, handleValidationErrors, login);

// Ruta para refresh token
router.post("/refresh-token", refreshToken);

// Ruta para logout
router.post("/logout", logout);

module.exports = router;
