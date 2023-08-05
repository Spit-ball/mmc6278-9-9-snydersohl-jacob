const router = require("express").Router();
const controllers = require("../controllers");
const checkAuth = require("../middleware/auth");
const express = require('express');
const fetch = require('node-fetch');

// admin login/logout
router.post("/login", controllers.auth.login);
router.get("/logout", controllers.auth.logout);
router.post("/signup", controllers.user.create);



module.exports = router;
