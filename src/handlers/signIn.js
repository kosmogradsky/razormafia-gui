const bcrypt = require("bcrypt");

module.exports = async function ({ requestBody, subjectsMap }) {
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
    subjectsMap.get("auth_state").next({ type: "authenticated", username });
    return { status: "ok" };
  } else {
    return { status: "error", reason: "wrong_credentials" };
  }
};
