/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

var Mapsel = function(options) {
    options = options || {};
    var self = this;
    
    function clamp(value, min, max) {
        if(min > max) {
            var tmp = min;
            min = max;
            max = tmp;
        }
        
        return Math.min(max, Math.max(min, value));
    }
    
    this.background = options.background || '#e3e3e3';
    this.container = options.container || null;
    this.closeable = (options.closeable === false) ? false : true;
    this.element = document.createElement('div');
    this.elements = {};
    this.events = {};
    this.font = { size: '14px' };
    this.height = options.height || 250;
    this.instance = Mapsel.instances++;
    this.language = options.language || 'en';
    this.latitude = clamp((typeof options.latitude == 'number' ? options.latitude : 65.0), -90.0, 90.0);
    this.longitude = clamp((typeof options.longitude == 'number' ? options.longitude : 0.0), -90.0, 90.0);
    this.map = { api: null, marker: null };
    this.opacity = clamp((typeof options.opacity == 'number' ? options.opacity : 1.0), 0.0, 1.0);
    this.precision = clamp((typeof options.precision == 'number' ? options.precision : 2), 0, 8);   // Number of coordinate decimals
    this.radius = Math.max(Math.round(options.radius || 0), 0) || null;
    this.visible = (options.visible === false) ? false: true;
    this.width = options.width || 200;
    this.x = options.x || 0;
    this.y = options.y || 0;
    
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
    
    this.element.append = function(tag, attribs, value) {
        return elemAppendFunc(self.element, tag, attribs, value);
    };
    
    // Determine the input step-value based on precision
    var stepString = this.precision ? '0.' : '1';
    for(var i = 0; i < this.precision; ++i) {
        stepString += (i == (this.precision - 1) ? 1 : 0);
    }
    
    // Append sub-element container elements
    this.elements.titleBar = this.element.append('header');
    this.elements.mapContainer = this.element.append('div', { id: 'mapsel_map_' + this.instance });
    this.elements.fieldset = this.element.append('fieldset');
    
    // Append a close-button to the titleBar element if closeable
    if(this.closeable) {
        this.elements.closeButton = this.elements.titleBar.append('a', { title: Mapsel.i18n[this.language].CLOSE }, 'X');
        this.elements.closeButton.addEventListener('click', function() { self.hide(); });
    }
    
    // Append mandatory fields to the fieldset element
    this.elements.latLabel = this.elements.fieldset.append('label', { for: 'mapsel_lat_' + this.instance }, Mapsel.i18n[this.language].LATITUDE);
    this.elements.latInput = this.elements.fieldset.append('input', { id: 'mapsel_lat_' + this.instance, type: 'number', title: Mapsel.i18n[this.language].LATITUDE, min: -90, max: 90, step: stepString, value: this.latitude });
    this.elements.lngLabel = this.elements.fieldset.append('label', { for: 'mapsel_lng_' + this.instance }, Mapsel.i18n[this.language].LONGITUDE);
    this.elements.lngInput = this.elements.fieldset.append('input', { id: 'mapsel_lng_' + this.instance, type: 'number', title: Mapsel.i18n[this.language].LONGITUDE, min: -180, max: 180, step: stepString, value: this.longitude });
    
    // Append a radius input-field to the fieldset element if radius-value is specified
    if(this.radius !== null) {
        this.elements.radLabel = this.elements.fieldset.append('label', { for: 'mapsel_rad_' + this.instance }, Mapsel.i18n[this.language].RADIUS);
        this.elements.radInput = this.elements.fieldset.append('input', { id: 'mapsel_rad_' + this.instance, type: 'number', title: Mapsel.i18n[this.language].RADIUS, step: 1, value: this.radius });
    }
    
    // Set element specific styles
    this.element.className = 'mapsel';
    this.element.style.position = (this.container ? 'relative' : 'absolute');
    this.element.style.background = this.background;
    this.element.style.fontSize = this.font.size;
    this.element.style.opacity = this.opacity;
    
    // Append the current container element to the document
    if(this.container) {
        this.container.appendChild(this.element);
    } else document.body.appendChild(this.element);
    
    // Set element position and size
    this.move(this.x, this.y);
    this.resize(this.width, this.height);
    
    // Hide element if not visible by default, otherwise initialize the map
    if(!this.visible) {
        this.hide();
    } else {
        this.init();
    }
};

Mapsel.instances = 0;
