class MockSubtreeEvent extends Event {
  constructor(changes) {
    super('subtreeChange');
    this.changes = changes;
  }
}

class MockMutationObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target, options = {}) {
    target.addEventListener('subtreeChange', event => {
      this.callback([event.changes]);
    });
    target.addEventListener('classListChange', () => {
      this.callback();
    })
  }

  disconnect() {

  }
}

class MockHtmlCollection extends Array {
  constructor(callback) {
    super();
    this.callback = callback;
  }

  push(...items) {
    super.push(...items);
    this.callback({
      addedNodes: items,
      removedNodes: []
    });
  }

  splice(start, deleteCount, ...items) {
    this.callback({
      addedNodes: items,
      removedNodes: super.splice(start, deleteCount, ...items)
    });
  }
}

class MockNode {
  parentElement;
  children;
  #listeners;

  constructor() {
    this.children = new MockHtmlCollection(changes => this.dispatchEvent(new MockSubtreeEvent(changes)));
    this.#listeners = [];
  }

  append(child) {
    this.children.push(child);
    child.parentElement = this;
  }

  remove() {
    const index = this.parentElement.children.indexOf(this);
    this.parentElement.children.splice(index, 1);
    this.parentElement = null;
  }

  addEventListener(type, handler) {
    this.#listeners.push({ type, handler });
  }

  dispatchEvent(event) {
    for (const listener of this.#listeners) {
      if (listener.type == event.type) {
        listener.handler(event);
      }
    }
  }
}

class MockElement extends MockNode {
  name;
  value;
  form;
  classList;
  tagName;
  style;
  innerText;

  constructor(tagName, attrs) {
    super();
    this.tagName = tagName;
    this.classList = new MockTokenList(() => { this.dispatchEvent(new Event('classListChange')) });
    this.style = new MockCSSStyle();

    if (attrs) {
      for (const attr in attrs) {
        this[attr] = attrs[attr];
      }
    }
  }

  get className() {
    return this.classList.value;
  }

  append(child) {
    if (typeof child == 'string') {
      child = new MockElement('text', { innerText: child });
    }
    super.append(child);
  }

  getElementsByTagName(name) {
    return this.querySelectorAll(name);
  }

  querySelector(selectors) {
    return this.#checkAttr(selectors);
  }

  querySelectorAll(selectors) {
    const list = [];
    this.#checkAttr(selectors, list);
    return list;
  }

  insertAdjacentHTML(position, text) {
    const tree = this.#parseHtml(text);
    this.insertAdjacentElement(position, tree);
  }

  insertAdjacentElement(where, element) {
    if (!Array.isArray(element)) {
      element = [element];
    }
    switch (where) {
      case 'beforebegin':
        let index = this.parentElement.children.indexOf(this);
        this.parentElement.children.splice(index, 0, ...element);
        element.forEach(e => e.parentElement = this.parentElement);
        break;
      case 'afterbegin':
        this.children.splice(0, 0, ...element);
        element.forEach(e => e.parentElement = this);
        break;
      case 'beforeend':
        this.children.push(...element);
        element.forEach(e => e.parentElement = this);
        break;
      case 'afterend':
        index = this.parentElement.children.indexOf(this);
        this.parentElement.children.splice(index + 1, 0, ...element);
        element.forEach(e => e.parentElement = this.parentElement);
        break;
    }
  }

  #parseHtml(text) {
    let currentParent;
    let tree = [];

    const tagRegex = /<[^>]+>|[^<>\s]+/g;
    const textSegments = text.match(tagRegex);

    for (const segment of textSegments) {
      if (segment.startsWith('</')) {
        currentParent = currentParent.parentElement;
      } else if (segment.startsWith('<')) {
        const tagName = segment.substring(1).split(' ').shift();
        const element = new MockElement(tagName);

        const attrRegex =  /\w*=("|')([\w-;:]*\s?)*\1/g;
        const attributes = segment.match(attrRegex) || [];
        for (const attr of attributes) {
          const equalIndex = attr.indexOf('=');
          const attrName = attr.substring(0, equalIndex);
          const attrValue = attr.substring(equalIndex + 1).replace('>', '').replaceAll('"', '');
          if (attr.startsWith('class')) {
            for (const c of attrValue.split(' ')) {
              element.classList.add(c);
            }
          } else {
            element[attrName] = attrValue;
          }
        }

        if (!currentParent) {
          currentParent = element;
          tree.push(element);
        } else {
          currentParent.append(element);
          currentParent = element;
        }
      } else {
        currentParent.innerText = segment;
      }
    }

    return tree;
  }

  #selectChildren(selectors, attr, list) {
    selectors = selectors.split(' ');
    const selector = selectors[0].match(/(?!\.):?[\w-]+/g);
    let i = 0;
    let match = true;
    let not = false;
    while (i < selector.length && match) {
      if (selector[i] == ':not') {
        not = true;
        i++;
      }
      match = not ^ attr.includes(selector[i++]);
    }

    if (match) {
      if (selectors.length == 1) {
        if (list) {
          list.push(this);
        }
        return this;
      } else {
        selectors = selectors.slice(1);
      }
    }

    for (const child of this.children) {
      const c = child.#checkAttr(selectors.join(' '), list)
      if (c && !list) return c;
    }
  }

  #checkAttr(selectors, list) {
    if (selectors.startsWith('.')) {
      return this.#selectChildren(selectors, this.className, list);
    } else {
      return this.#selectChildren(selectors, this.tagName, list);
    }
  }
}

class MockForm extends MockElement {
  #fields = [];

  constructor(attrs) {
    super('form', attrs);

    this[Symbol.iterator] = function* () {
      let index = 0;
      while (index < this.#fields.length) {
        yield this.#fields[index++];
      }
    }
  }

  #setForm(element) {
    if (element.tagName == 'input') {
      this[element.name] = element;
      element.form = this;
      this.#fields.push(element);
    } else {
      for (const child of element.children) {
        this.#setForm(child);
      }
    }
  }

  append(element) {
    super.append(element);
    this.#setForm(element);
  }

  remove(element) {
    super.remove(element);
    if (element.name in this) {
      delete this[element.name]
    }
  }
}

class MockTokenList extends Array {
  constructor(eventCallback) {
    super();
    this.eventCallback = eventCallback;
  }

  get value() {
    if (!this.length) {
      return '';
    }

    return this.join(' ');
  };

  add(...tokens) {
    for (const token of tokens) {
      if (!this.includes(token)) {
        this.push(token);
      }
    }
    if (this.eventCallback) {
      this.eventCallback();
    }
  }

  remove(...tokens) {
    let index;
    for (const token of tokens) {
      if ((index = this.indexOf(token)) != -1) {
        this.splice(index, 1);
      }
    }
    if (this.eventCallback) {
      this.eventCallback();
    }
  }
}

class MockCSSStyle {
  constructor() {
    this.display = 'block';
  }
}

class MockDocument extends MockNode {
  constructor(window) {
    super();
    this.defaultView = window;
    this.body = new MockElement('body')
    this.append(this.body);
  }

  createElement(tagName, attrs) {
    if (tagName == 'form') {
      return new MockForm(attrs)
    }
    return new MockElement(tagName, attrs)
  }

  querySelector(selectors) {
    let i = 0;
    let selected;
    while (i < this.children.length && !(selected = this.children[i++].querySelector(selectors)));
    return selected;
  }

  querySelectorAll(selectors) {
    let i = 0;
    let selected = [];
    while (i < this.children.length) {
      selected = [...selected, ...this.children[i++].querySelectorAll(selectors)];
    }
    return selected;
  }
}

class MockCSSStyleDeclaration {
  constructor() {
    this['transition-duration'] = '0s';
    this['animation-duration'] = '0s';
  }

  get transitionDuration() {
    return this['transition-duration'];
  }

  get animationDuration() {
    return this['animation-duration'];
  }

  getPropertyValue(property) {
    return this[property] || '';
  }

  setProperty(property, value, priority = '') {
    this[property] = value;
  }
}

export class MockWindow {
  #styles;
  constructor() {
    this.document = new MockDocument(this);
    this.#styles = {};
    this.#setGlobals();
  }
  
  #setGlobals() {
    global.getComputedStyle = this.getComputedStyle.bind(this);
    global.document = this.document;
    global.MutationObserver = MockMutationObserver;
  }

  getComputedStyle(elt, pseudoElt = '') {
    if (!this.#styles[elt]) {
      this.#styles[elt] = {};
    }
    if (!this.#styles[elt][pseudoElt]) {
      this.#styles[elt][pseudoElt] = new MockCSSStyleDeclaration();
    }
    return this.#styles[elt][pseudoElt];
  }
}
