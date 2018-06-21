import {View, CollectionView, Region} from 'backbone.marionette'
import {mixin, domApi} from 'marionette.native'
_.extend(View.prototype, mixin)
_.extend(CollectionView.prototype, mixin)
Region.setDomApi(domApi)
