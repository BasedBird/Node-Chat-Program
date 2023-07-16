module.exports = class Queue {
  constructor() {
    this.queue = {};
    this.head = 0;
    this.tail = 0;
  }

  push(e) {
    this.queue[this.tail++] = e;
  }

  pop() {
    const e = this.queue[this.head];
    delete this.queue[this.head++]
    return e;
  }

  get size() {
    return this.tail - this.head;
  }

  get isEmpty() {
    return this.size === 0;
  }

  get all() {
    var all = new Array();
    for (let i = this.head; i < this.tail; i++) {
      all.push(this.queue[i]);
    }
    return all;
  }
}