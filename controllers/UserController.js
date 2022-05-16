const pick = require("lodash.pick");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const tryCatchCRUD = require("../helpers/tryCatch");

class UserController {
  async logIn(req, res) {
    await tryCatchCRUD(res, async () => {
      const { username, password } = pick(req.body, "username", "password");
      const user = await req.usersCollection.findOne({ username });

      if (!user) return res.redirect("/?authError=true");
      if (!password) return res.redirect("/?authError=true");

      const isPassword = await bcrypt.compare(password, user.password);

      if (!isPassword) throw new Error("Auth error");

      const sessionId = await createSession(req.sessionsCollection, user._id);
      return res
        .cookie("sessionId", sessionId, { httpOnly: true })
        .redirect("/");
    });
  }

  async logOut(req, res) {
    await tryCatchCRUD(res, async () => {
      if (!req.user) return res.redirect("/?singUpError=true&message=No user");
      if (!req.sessionId)
        return res.redirect("/?singUpError=true&message=Expired session");

      await deleteSession(req.sessionsCollection, req.sessionId);
      res.clearCookie("sessionId").redirect("/");
    });
  }

  async signup(req, res) {
    await tryCatchCRUD(res, async () => {
      const { username, password } = pick(req.body, "username", "password");
      const isUserExists = await req.usersCollection.findOne({ username });

      if (isUserExists || !password || !username) {
        const errMessage = isUserExists
          ? "Name is already taken"
          : !password
          ? "Password is missing"
          : !username
          ? "Username is missing"
          : "Unexpected registration error";

        return res.redirect(`/?singUpError=true&message=${errMessage}`);
      }

      const hashPassword = await bcrypt.hash(password, 5);

      await req.usersCollection.insertOne({ username, password: hashPassword });
      return res.redirect("/");
    });
  }
}

async function createSession(sessionsCollection, userId) {
  const session = await sessionsCollection.findOne({ userId });
  const sessionId = session ? session.sessionId : nanoid();

  if (!session) {
    await sessionsCollection.insertOne({ sessionId, userId });
  }

  return sessionId;
}

const deleteSession = async (sessionsCollection, sessionId) => {
  await sessionsCollection.deleteOne({ sessionId });
};

module.exports = UserController;
