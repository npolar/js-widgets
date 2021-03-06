js-widgets
==========
Various JavaScript widgets

## Mapsel
Widget for selecting latitude and longitude from a map.<br>
For code examples, check out the [Mapsel demo](http://npolar.github.io/js-widgets/mapsel/demo/) webpage.

#### Usage:
Mapsel-instances are created using ***new Mapsel(options)***, which accepts the following option-object properties:

 * **api** - API used for maps (defaults to: ***leaflet***)
 * **background** - mapsel container element CSS-background (defaults to: ***#e3e3e3***)
 * **container** - reference to mapsel element container (defaults to: ***null***)
 * **font** - custom font styling using the following format: *weight style size color family* (all values are optional)
 * **height** - mapsel container element height in pixels (defaults to: ***250***)
 * **language** - language code used by text translation (defaults to: ***en***)
 * **latitude** - initial latitude value (defaults to: ***65.0***)
 * **longitude** - initial longitude value (defaults to: ***0.0***)
 * **opacity** - mapsel container element opacity (defaults to: ***1.0***)
 * **precision** - decimal precision of coordinates (i.e. number of decimals) (defaults to: ***2***)
 * **radius** - initial radius in meters, or **null** to disable (defaults to: ***null***)
 * **visible** - initially hide the mapsel container if set to **false** (defaults to: **true**)
 * **width** - mapsel container element width in pixels (defaults to: ***200***)

#### Map APIs:
The following map APIs are bundled with mapsel:

 * **google** - [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/)
 * **leaflet** - [Leaflet](http://leafletjs.com) with [OpenStreetMap](https://openstreetmap.org) tile server *(default)*

#### Languages:
The following *UTF-8 encoded* languages are bundled with mapsel:

 * **en** - English *(default)*
 * **ja** - Japanese
 * **nb** - Norwegian (bokmål)
 * **nn** - Norwegian (nynorsk)
 * **yue** - Cantonese (traditional characters)
 * **zh** - Chinese (simplified characters)


## Konsoll
Console widget supporting input and output.<br>
For code examples, check out the [Konsoll demo](http://npolar.github.io/js-widgets/konsoll/demo/) webpage.

#### TODO:
 * Add API Documentation
