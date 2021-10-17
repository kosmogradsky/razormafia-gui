const bcrypt = require("bcrypt");

module.exports = async function ({ requestBody, authStateSubject }) {
  const { username, password } = requestBody;

  const registeredUser = global.registeredUsers.find(
    (user) => user.username === username
  );

  if (registeredUser === undefined) {
    return { status: "error", reason: "wrong_credentials" };
  }

  const isSamePassword = await bcrypt.compare(
    password,
    registeredUser.hashedPassword
  );

  if (isSamePassword) {
    authStateSubject.next({ type: "authenticated", username });
    return { status: "ok" };
  } else {
    return { status: "error", reason: "wrong_credentials" };
  }
};
