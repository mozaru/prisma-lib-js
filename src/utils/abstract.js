export default class Abstract {
  constructor(childClass, abstractMembers) {
    if (this.constructor == Abstract || this.constructor == childClass) {
      throw new Error("Class is of abstract type and can't be instantiated");
    }

    for (const member of abstractMembers) {
      if (!this[member]) {
        throw new Error(`${this.constructor.name} class must implement ${member}`);
      }
    }
  }
}