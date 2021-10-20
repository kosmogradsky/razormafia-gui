module.exports = function ({ subjects }) {
  const authState = subjects.get("auth_state").getValue();

  if (authState.type === "unauthenticated") {
    return { status: "error", reason: "unauthenticated" };
  }

  const gameQueueSubject = subjects.get("game_queue");
  const gameQueue = gameQueueSubject.getValue();
  gameQueueSubject.next(gameQueue.add(authState.username));

  return { status: "ok" };
};
