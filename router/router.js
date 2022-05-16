const { Router } = require("express");
const { timersRouter } = require("./timersRouter");
const { userRouter } = require("./userRouter");
const { connectToDb } = require("./middleware/connectToDb");
const { auth } = require("./middleware/auth");

const router = Router();

router.use(auth);
router.use("/api/timers", timersRouter);
router.use(userRouter);

router.get("/", async (req, res) => {
  res.render("index", {
    user: req.user,
    authError:
      req.query.authError === "true"
        ? "Wrong username or password"
        : req.query.authError,
    singUpError:
      req.query.singUpError === "true"
        ? req.query.message
        : req.query.singUpError,
  });
});

module.exports = router;
