js-widgets
==========
Various JavaScript widgets

## Mapsel
Widget for selecting latitude and longitude from a map.<br>
For code examples, check out the [Mapsel demo](mapsel/demo.html) webpage.

#### Dependencies:
* [Google Maps JavaScript API v3](https://developers.google.com/maps/documentation/javascript/)

#### Usage:
Mapsel-instances are created using ***new Mapsel(options)***, which accepts the following option-object properties:

 * **background** - mapsel container element CSS-background (defaults to: ***#e3e3e3***)
 * **container** - reference to mapsel element container (defaults to: ***null***)
 * **height** - mapsel container element height in pixels (defaults to: ***250***)
 * **language** - language code used by text translation (defaults to: ***en***)
 * **latitude** - initial latitude value (defaults to: ***65.0***)
 * **longitude** - initial longitude value (defaults to: ***0.0***)
 * **opacity** - mapsel container element opacity (defaults to: ***1.0***)
 * **precision** - decimal precision of coordinates (i.e. number of decimals) (defaults to: ***2***)
 * **radius** - initial radius in meters, or **null** to disable (defaults to: ***null***)
 * **width** - mapsel container element width in pixels (defaults to: ***200***)

#### Languages:
The following *UTF-8 encoded* languages are bundled with mapsel:

 * **en** - English (default value)
 * **ja** - Japanese
 * **nb** - Norwegian (bokmål)
 * **nn** - Norwegian (nynorsk)
 * **yue** - Cantonese (traditional characters)
 * **zh** - Chinese (simplified characters)

