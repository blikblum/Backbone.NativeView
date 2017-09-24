Marionette.Native
=================

A drop-in replacement for Marionette views (View, CollectionView, NextCollectionView) 
that uses only native DOM methods for element selection and event delegation. 
It has no dependency on jQuery.


Usage
-----

> When using a script tag, the view classes and the mixin can be found at Marionette.Native namespace
> Example:
> ````javascript
> var NativeView = Marionette.Native.NativeView;
> var mixin = Marionette.Native.mixin;
> ```` 

#### Builtin view classes

```js
import {NativeView, NativeCollectionView, NativeNextCollectionView} from 'marionette.native';
var MyView = NativeView.extend({
  initialize: function(options) {
    // ...
  }
});

var MyCollectionView = NativeCollectionView.extend({
  initialize: function(options) {
    // ...
  }
});

var MyNextCollectionView = NativeNextCollectionView.extend({
  initialize: function(options) {
    // ...
  }
});
```

#### mixin

As an alternative, you may extend an existing View's prototype to use native
methods, or even replace Backbone.View itself:

```js
import {View} from 'backbone.marionette';
import {mixin} from 'marionette.native';
var MyBaseView = View.extend(mixin);
```

or

```js
import {View} from 'backbone.marionette';
import {mixin} from 'marionette.native';
var MyBaseView = View.extend();
_.extend(MyBaseView.prototype, mixin);
```

or

```js
// patch Marionette view classes directly
import {View} from 'backbone.marionette';
import {mixin} from 'marionette.native';
_.extend(View.prototype, mixin);
```

Remove jQuery dependency
------------------------

To remove jQuery dependency put the following code in start of application

#### 1) Patch the Marionette classes

```js
import {View, CollectionView, NextCollectionView, Region} from 'backbone.marionette';
import {mixin, domApi} from 'marionette.native';
_.extend(View.prototype, mixin);
_.extend(CollectionView.prototype, mixin);
_.extend(NextCollectionView.prototype, mixin);
Region.setDomApi(domApi);
```

or

```javascript
import 'marionette.native/patches'
```

#### 2) Patch `Backbone.ajax`

With [Backbone.NativeAjax](https://github.com/akre54/Backbone.NativeAjax)
```javascript
import 'backbone.nativeajax'
```

or with [Backbone.Fetch](https://github.com/akre54/Backbone.Fetch)
```javascript
import 'backbone.nativeajax'
```

or with [Dom7 (Framework7)](http://framework7.io/docs/dom.html)
```javascript
import 'framework7'
import Backbone from 'backbone'

Backbone.ajax = Dom7.ajax
```

#### 3. Fake jquery

With webpack
```
//nojquery.js - in same dir as webpack.config.js
module.exports = function() {};
```
```javascript
//webpack.config.js
module.exports = {
  // [..]
  resolve: {
    alias: {
      jquery: path.resolve(__dirname, './nojquery.js')
    }
  }
};
```

or with script tag:
```html
  <script>
    //dummy jquery
    window.jQuery = window.$ = function () {}
  </script>
```

Features
--------
Delegation:
```js
var view = new MyView({el: '#my-element'});
view.delegate('click', view.clickHandler);
```

Undelegation with event names or listeners,
```js
view.undelegate('click', view.clickHandler);
view.undelegate('click');
```

View-scoped element finding:
```js
// for one matched element
_.first(view.$('.box')).focus();

// for multiple matched elements
_.each(view.$('.item'), function(el) {
  el.classList.remove('active')
});
var fields = _.pluck(view.$('.field'), 'innerHTML');
```

Requirements
------------
Marionette.Native makes use of `querySelector` and `querySelectorAll`. No support for IE8.

Notes
-----
* The `$el` property is set to an array containing `view.el`.
* `View#$` returns a NodeList instead of a jQuery context. You can
  iterate over either using `_.each`.
* The event object, passed in event handlers, is the native one which, 
among other things, handles `currentTarget` [differently](https://github.com/skatejs/skatejs/issues/302).
On the other hand, the non standard `delegateTarget` is properly set in 
the event object.  


With many thanks to @wyuenho and @akre54 for their initial code.