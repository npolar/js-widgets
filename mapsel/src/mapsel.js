/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

var Mapsel = function(options) {
    function clamp(value, min, max) {
        if(min > max) {
            var tmp = min;
            min = max;
            max = tmp;
        }

        return Math.min(max, Math.max(min, value));
    }

    // Customisable options
    options = options || {};
    this.api = options.api || 'google';
    this.background = options.background || '#e3e3e3';
    this.container = options.container || null;
    this.closeable = (options.closeable === false) ? false : true;
    this.font = options.font || { color: '#000', size: '14px' };
    this.height = options.height || 250;
    this.northeast = options.northeast || null;
    this.language = options.language || 'en';
    this.latitude = clamp((typeof options.latitude == 'number' ? options.latitude : 65.0), -90.0, 90.0);
    this.longitude = clamp((typeof options.longitude == 'number' ? options.longitude : 0.0), -90.0, 90.0);
    this.opacity = clamp((typeof options.opacity == 'number' ? options.opacity : 1.0), 0.0, 1.0);
    this.precision = clamp((typeof options.precision == 'number' ? options.precision : 2), 0, 8);   // Number of coordinate decimals
    this.radius = Math.max(Math.round(options.radius || 0), 0) || null;
    this.southwest = options.southwest || null;
    this.visible = (options.visible === false) ? false: true;
    this.width = options.width || 200;
    this.x = options.x || 0;
    this.y = options.y || 0;

    // Internal usage only
    this.elements = { root: document.createElement('div') };
    this.events = {};
    this.instance = Mapsel.instances++;
    var self = this, rootElement = this.elements.root;

    // Proxy function used to append children to an element
    function elemAppendFunc(elem, tag, attribs, value) {
        var newElem = document.createElement(tag);

        newElem.append = function(tag, attribs, value) {
            return elemAppendFunc(newElem, tag, attribs, value);
        };

        for(var a in attribs) {
            newElem.setAttribute(a, attribs[a]);
        }

        if(value !== undefined) {
            newElem.innerHTML = value;
        }

        elem.appendChild(newElem);
        return newElem;
    }

    rootElement.append = function(tag, attribs, value) {
        return elemAppendFunc(self.elements.root, tag, attribs, value);
    };

    // Determine the input step-value based on precision
    var stepString = this.precision ? '0.' : '1';
    for(var i = 0; i < this.precision; ++i) {
        stepString += (i == (this.precision - 1) ? 1 : 0);
    }

    // Ensure correct font-object format (weight? style? size? color? family?)
    if(typeof this.font == 'string') {
        var fontObject = {},
            fontOptions = this.font.split(' '),
            fontOptionIndex = 0,
            fontWeights = 'normal,bold,bolder,lighter,initial,inherit'.split(','),
            fontStyles = 'normal,italic,oblique,initial,inherit'.split(','),
            fontColors = 'aqua,black,blue,fuchsia,gray,green,lime,maroon,navy,olive,orange,purple,red,silver,teal,white,yellow'.split(','),
            fontFamilies = 'serif,sans-serif,cursive,fantasy,monospace'.split(',');

        // Set font-weight if defined
        if(typeof fontOptions[fontOptionIndex] == 'string' && fontWeights.indexOf(fontOptions[fontOptionIndex]) != -1) {
            fontObject.weight = fontOptions[fontOptionIndex++];
        } else if((Number(fontOptions[fontOptionIndex]) / 100) >= 1 && (Number(fontOptions[fontOptionIndex]) / 100) <= 900) {
            fontObject.weight = Number(fontOptions[fontOptionIndex++]);
        }

        // Set font-style if defined
        if(fontStyles.indexOf(fontOptions[fontOptionIndex]) != -1) {
            fontObject.style = fontOptions[fontOptionIndex++];
        }

        // Set font-size if defined
        if(/^\d+(px|em|pc|in|mm|%)$/.test(fontOptions[fontOptionIndex])) {
            fontObject.size = fontOptions[fontOptionIndex++];
        }

        // Set font-color if defined
        if((fontColors.indexOf(fontOptions[fontOptionIndex]) != -1) || /^(#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})|rgb\(\s?\d{1,3}%?,\s?\d{1,3}%?,\s?\d{1,3}%?\s?\))$/.test(fontOptions[fontOptionIndex])) {
            fontObject.color = fontOptions[fontOptionIndex++];
        }

        // Set font-family if defined
        if((fontFamilies.indexOf(fontOptions[fontOptionIndex]) != -1) || /^[-a-zA-Z0-9'", ]+$/.test(fontOptions[fontOptionIndex])) {
            fontObject.family = fontOptions[fontOptionIndex++];
        }

        this.font = fontObject;
    }

    // Append sub-element container elements
    this.elements.titleBar = rootElement.append('header');
    this.elements.mapContainer = rootElement.append('div', { id: 'mapsel_map_' + this.instance });
    this.elements.fieldset = rootElement.append('fieldset');

    // Append a close-button to the titleBar element if closeable
    if(this.closeable) {
        this.elements.closeButton = this.elements.titleBar.append('a', { title: Mapsel.i18n(this.language, 'CLOSE') }, 'X');
        this.elements.closeButton.addEventListener('click', function() { self.hide(); });
    }

    // Append applicable fields to the fieldset element
    if(this.northeast !== null && this.southwest !== null) {
        if(this.northeast instanceof Array) {
            this.northeast = { latitude: this.northeast[0], longitude: this.northeast[1] };
        }

        if(this.southwest instanceof Array) {
            this.southwest = { latitude: this.southwest[0], longitude: this.southwest[1] };
        }

        this.elements.neLabel = this.elements.fieldset.append('label', { for: 'mapsel_ne_' + this.instance }, Mapsel.i18n(this.language, 'NORTHEAST'));
        this.elements.neGroup = this.elements.fieldset.append('fieldset', { id: 'mapsel_ne_' + this.instance, class: 'mapsel-input-pair' });
        this.elements.neLatInput = this.elements.neGroup.append('input', { id: 'mapsel_ne_lat_' + this.instance, type: 'number', title: Mapsel.i18n(this.language, 'LATITUDE'), min: -90, max: 90, step: stepString, value: this.northeast.latitude });
        this.elements.neLngInput = this.elements.neGroup.append('input', { id: 'mapsel_ne_lng_' + this.instance, type: 'number', title: Mapsel.i18n(this.language, 'LONGITUDE'), min: -180, max: 180, step: stepString, value: this.northeast.longitude });

        this.elements.swLabel = this.elements.fieldset.append('label', { for: 'mapsel_sw_' + this.instance }, Mapsel.i18n(this.language, 'SOUTHWEST'));
        this.elements.swGroup = this.elements.fieldset.append('fieldset', { id: 'mapsel_sw_' + this.instance, class: 'mapsel-input-pair' });
        this.elements.swLatInput = this.elements.swGroup.append('input', { id: 'mapsel_sw_lat_' + this.instance, type: 'number', title: Mapsel.i18n(this.language, 'LATITUDE'), min: -90, max: 90, step: stepString, value: this.southwest.latitude });
        this.elements.swLngInput = this.elements.swGroup.append('input', { id: 'mapsel_sw_lng_' + this.instance, type: 'number', title: Mapsel.i18n(this.language, 'LONGITUDE'), min: -180, max: 180, step: stepString, value: this.southwest.longitude });
    } else if(this.latitude !== null && this.longitude !== null) {
        this.elements.latLabel = this.elements.fieldset.append('label', { for: 'mapsel_lat_' + this.instance }, Mapsel.i18n(this.language, 'LATITUDE'));
        this.elements.latInput = this.elements.fieldset.append('input', { id: 'mapsel_lat_' + this.instance, type: 'number', title: Mapsel.i18n(this.language, 'LATITUDE'), min: -90, max: 90, step: stepString, value: this.latitude.toFixed(this.precision) });

        this.elements.lngLabel = this.elements.fieldset.append('label', { for: 'mapsel_lng_' + this.instance }, Mapsel.i18n(this.language, 'LONGITUDE'));
        this.elements.lngInput = this.elements.fieldset.append('input', { id: 'mapsel_lng_' + this.instance, type: 'number', title: Mapsel.i18n(this.language, 'LONGITUDE'), min: -180, max: 180, step: stepString, value: this.longitude.toFixed(this.precision) });

        if(this.radius !== null) {
            this.elements.radLabel = this.elements.fieldset.append('label', { for: 'mapsel_rad_' + this.instance }, Mapsel.i18n(this.language, 'RADIUS'));
            this.elements.radInput = this.elements.fieldset.append('input', { id: 'mapsel_rad_' + this.instance, type: 'number', title: Mapsel.i18n(this.language, 'RADIUS'), step: 1, value: this.radius });
        }
    }

    // Set element specific styles
    rootElement.className = 'mapsel';
    rootElement.style.position = (this.container ? 'relative' : 'absolute');
    rootElement.style.background = this.background;
    rootElement.style.opacity = this.opacity;

    // Set element specific font-styles (weight? style? size? color? family?)
    var fontStyleMap = { weight: 'fontWeight', style: 'fontStyle', size: 'fontSize', color: 'color', family: 'fontFamily' };
    for(var f in fontStyleMap) {
        if(this.font[f]) {
            rootElement.style[fontStyleMap[f]] = this.font[f];
        }
    }

    // Append the current container element to the document
    if(this.container) {
        this.container.appendChild(rootElement);
    } else document.body.appendChild(rootElement);

    // Set element position and size
    this.move(this.x, this.y);
    this.resize(this.width, this.height);

    // Hide element if not visible by default, otherwise initialize the map
    if(!this.visible) {
        this.hide();
    } else {
        this.init(this.api);
    }
};

Mapsel.api = {};
Mapsel.instances = 0;

if(typeof module == 'object') {
      module.exports = Mapsel;
}
