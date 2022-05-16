const { Router } = require("express");
const bodyParser = require("body-parser");
const UserController = require("../controllers/UserController");

const userController = new UserController();

const userRouter = Router();

userRouter.post(
  "/login",
  bodyParser.urlencoded({ extended: true }),
  userController.logIn.bind(userController)
);
userRouter.post(
  "/signup",
  bodyParser.urlencoded({ extended: true }),
  userController.signup.bind(userController)
);
userRouter.get("/logout", userController.logOut.bind(userController));

module.exports.userRouter = userRouter;
