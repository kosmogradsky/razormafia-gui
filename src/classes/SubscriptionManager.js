class SubscriptionManager {
  #subscriptionsMap = new Map();
  #observablesMap;
  #writeSubscriptionMessage;

  constructor({ observablesMap, writeSubscriptionMessage }) {
    this.#observablesMap = observablesMap;
    this.#writeSubscriptionMessage = writeSubscriptionMessage;
  }

  subscribe(observableKey) {
    const existingSubscription = this.#subscriptionsMap.get(observableKey);

    if (existingSubscription === undefined) {
      const observable = this.#observablesMap.get(observableKey);

      if (observable === undefined) {
        return { status: "error", reason: "subscribe_path_invalid" };
      } else {
        const subscription = observable.subscribe((message) => {
          this.#writeSubscriptionMessage(observableKey, message);
        });
        this.#subscriptionsMap.set(observableKey, subscription);

        return { status: "ok" };
      }
    } else {
      return { status: "error", reason: "already_subscribed" };
    }
  }

  unsubscribe(observableKey) {
    const subscription = this.#subscriptionsMap.get(observableKey);

    if (subscription === undefined) {
      return { status: "ok" };
    } else {
      subscription.unsubscribe();
      this.#subscriptionsMap.delete(observableKey);

      return { status: "ok" };
    }
  }
}

module.exports = SubscriptionManager;