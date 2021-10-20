module.exports = function ({ subjectsMap }) {
  const authStateSubject = subjectsMap.get("auth_state");
  const authState = authStateSubject.getValue();

  if (authState.type !== "unauthenticated") {
    authStateSubject.next({ type: "unauthencated" });
  }

  return { status: "ok" };
};
