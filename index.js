// Marionette.NativeView.js 0.3.3
// ---------------

//     (c) 2015 Adam Krebs, Jimmy Yuen Ho Wong
//     (c) 2017 Luiz Américo
//     Backbone.NativeView may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/akre54/Backbone.NativeView

import _ from 'underscore'
import Marionette from 'backbone.marionette'

// Cached regex to match an opening '<' of an HTML tag, possibly left-padded
// with whitespace.
var paddedLt = /^\s*</;

// Caches a local reference to `Element.prototype` for faster access.
var ElementProto = (typeof Element !== 'undefined' && Element.prototype) || {};

// Cross-browser event listener shims
var elementAddEventListener = ElementProto.addEventListener

var elementRemoveEventListener = ElementProto.removeEventListener

var indexOf = function(array, item) {
  for (var i = 0, len = array.length; i < len; i++) if (array[i] === item) return i;
  return -1;
}

// todo: remove fallback matches implementation as soon as phantomjs is replaced

// Find the right `Element#matches` for IE>=9 and modern browsers.
var matchesSelector = ElementProto.matches ||
    ElementProto.webkitMatchesSelector ||
    ElementProto.mozMatchesSelector ||
    ElementProto.msMatchesSelector ||
    ElementProto.oMatchesSelector ||
    // Make our own `Element#matches` for IE8
    function(selector) {
      // Use querySelectorAll to find all elements matching the selector,
      // then check if the given element is included in that list.
      // Executing the query on the parentNode reduces the resulting nodeList,
      // (document doesn't have a parentNode).
      var nodeList = (this.parentNode || document).querySelectorAll(selector) || [];
      return ~indexOf(nodeList, this);
    };

// Cache Marionette Views for later access in constructor
var MnView = Marionette.View;
var MnCollectionView = Marionette.CollectionView;
var MnNextCollectionView = Marionette.NextCollectionView;

export const domApi = {
  // Lookup the `selector` string
  // Selector may also be a DOM element
  // Returns an array-like object of nodes
  getEl(selector) {
    return getEl(selector);
  },

  // Finds the `selector` string with the el
  // Returns an array-like object of nodes
  findEl(el, selector, _$el = getEl(el)) {
    return _$el.find(selector);
  },

  // Detach `el` from the DOM without removing listeners
  detachEl(el, _$el = getEl(el)) {
    _$el.detach();
  },

  // Replace the contents of `el` with the HTML string of `html`
  setContents(el, html, _$el = getEl(el)) {
    _$el.html(html);
  },

  // Takes the DOM node `el` and appends the DOM node `contents`
  // to the end of the element's contents.
  appendContents(el, contents, {_$el = getEl(el), _$contents = getEl(contents)} = {}) {
    _$el.append(_$contents);
  },

  // Remove the inner contents of `el` from the DOM while leaving
  // `el` itself in the DOM.
  detachContents(el, _$el = getEl(el)) {
    _$el.contents().detach();
  }
};

// To extend an existing view to use native methods, extend the View prototype
// with the mixin: _.extend(MyView.prototype, Backbone.NativeViewMixin);
const BaseMixin = {

  _domEvents: null,

  $: function(selector) {
    return this.el.querySelectorAll(selector);
  },

  _removeElement: function() {
    this.undelegateEvents();
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
  },

  // Apply the `element` to the view. `element` can be a CSS selector,
  // a string of HTML, or an Element node. If passed a NodeList or CSS
  // selector, uses just the first match.
  _setElement: function(element) {
    if (typeof element == 'string') {
      if (paddedLt.test(element)) {
        var el = document.createElement('div');
        el.innerHTML = element;
        this.el = el.firstChild;
      } else {
        this.el = document.querySelector(element);
      }
    } else if (element && element.length) {
      this.el = element[0];
    } else {
      this.el = element;
    }
  },

  // Set a hash of attributes to the view's `el`. We use the "prop" version
  // if available, falling back to `setAttribute` for the catch-all.
  _setAttributes: function(attrs) {
    for (var attr in attrs) {
      attr in this.el ? this.el[attr] = attrs[attr] : this.el.setAttribute(attr, attrs[attr]);
    }
  },

  // Make a event delegation handler for the given `eventName` and `selector`
  // and attach it to `this.el`.
  // If selector is empty, the listener will be bound to `this.el`. If not, a
  // new handler that will recursively traverse up the event target's DOM
  // hierarchy looking for a node that matches the selector. If one is found,
  // the event's `delegateTarget` property is set to it and the return the
  // result of calling bound `listener` with the parameters given to the
  // handler.
  delegate: function(eventName, selector, listener) {
    if (typeof selector === 'function') {
      listener = selector;
      selector = null;
    }

    var root = this.el;
    var handler = selector ? function (e) {
      var node = e.target || e.srcElement;
      for (; node && node != root; node = node.parentNode) {
        if (matchesSelector.call(node, selector)) {
          e.delegateTarget = node;
          listener(e);
        }
      }
    } : listener;

    elementAddEventListener.call(this.el, eventName, handler, false);
    this._domEvents.push({eventName: eventName, handler: handler, listener: listener, selector: selector});
    return handler;
  },

  // Remove a single delegated event. Either `eventName` or `selector` must
  // be included, `selector` and `listener` are optional.
  undelegate: function(eventName, selector, listener) {
    if (typeof selector === 'function') {
      listener = selector;
      selector = null;
    }

    if (this.el) {
      var handlers = this._domEvents.slice();
      var i = handlers.length;
      while (i--) {
        var item = handlers[i];

        var match = item.eventName === eventName &&
            (listener ? item.listener === listener : true) &&
            (selector ? item.selector === selector : true);

        if (!match) continue;

        elementRemoveEventListener.call(this.el, item.eventName, item.handler, false);
        this._domEvents.splice(i, 1);
      }
    }
    return this;
  },

  // Remove all events created with `delegate` from `el`
  undelegateEvents: function() {
    if (this.el) {
      for (var i = 0, len = this._domEvents.length; i < len; i++) {
        var item = this._domEvents[i];
        elementRemoveEventListener.call(this.el, item.eventName, item.handler, false);
      };
      this._domEvents.length = 0;
    }
    return this;
  }
};

export const NativeViewMixin = _.extend({}, BaseMixin, {
  constructor: function() {
    this._domEvents = [];
    return MnView.apply(this, arguments);
  }
})

export const NativeCollectionViewMixin = _.extend({}, BaseMixin, {
  constructor: function() {
    this._domEvents = [];
    return MnCollectionView.apply(this, arguments);
  }
})

export const NativeNextCollectionViewMixin = _.extend({}, BaseMixin, {
  constructor: function() {
    this._domEvents = [];
    return MnNextCollectionView.apply(this, arguments);
  }
})

export const NativeView = Marionette.View.extend(NativeViewMixin);

export const NativeCollectionView = Marionette.CollectionView.extend(NativeCollectionViewMixin);

export const NativeNextCollectionView = Marionette.NextCollectionView.extend(NativeNextCollectionViewMixin);
