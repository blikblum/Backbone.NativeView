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
import {View, CollectionView, NextCollectionView} from 'backbone.marionette';
import {mixin} from 'marionette.native';
_.extend(View.prototype, mixin);
_.extend(CollectionView.prototype, mixin);
_.extend(NextCollectionView.prototype, mixin);
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
* The `$el` property no longer exists on Views. Use `el` instead.
* `View#$` returns a NodeList instead of a jQuery context. You can
  iterate over either using `_.each`.


With many thanks to @wyuenho and @akre54 for their initial code.