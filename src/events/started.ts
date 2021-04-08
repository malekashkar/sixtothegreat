import Event, { EventNameType } from ".";

export default class Started extends Event {
  eventName: EventNameType = "ready";

  async handle() {
    const users = this.client.users.cache.size;
    console.log(`The bot has started with ${users} cached users.`);
    this.client.user.setActivity(`Serving ${users} users.`);
  }
}
