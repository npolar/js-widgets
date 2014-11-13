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

/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

Mapsel.prototype = {
    hide: function() {
        if(this.element) {
            this.element.style.display = 'none';
        }
        
        this.visible = false;
    },
    
    init: function() {
        var self = this;
        
        // Initialize map API
        this.map.api = new google.maps.Map(this.elements.mapContainer, {
            center: { lat: this.latitude, lng: this.longitude },
            disableDoubleClickZoom: true,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            streetViewControl: false,
            zoom: 2
        });
        
        // Initialize map marker
        if(this.radius) {
            this.map.marker = new google.maps.Circle({
                center: this.map.api.getCenter(),
                draggable: true,
                editable: true,
                map: this.map.api,
                radius: this.radius
            });
            
            google.maps.event.addListener(this.map.api, 'dblclick', function(e) {
                self.map.marker.setCenter(e.latLng);
            });
            
            google.maps.event.addListener(this.map.marker, 'center_changed', function() {
                var latLng = self.map.marker.getCenter();
                self.elements.latInput.value = self.latitude = Number(latLng.lat().toFixed(self.precision));
                self.elements.lngInput.value = self.longitude = Number(latLng.lng().toFixed(self.precision));
            });
            
            google.maps.event.addListener(this.map.marker, 'radius_changed', function() {
                self.elements.radInput.value = self.radius = Math.round(self.map.marker.getRadius());
            });
            
            this.elements.latInput.addEventListener('change', function(e) {
                self.map.marker.setCenter({ lat: Number(e.target.value), lng: self.longitude });
                self.map.api.setCenter(self.map.marker.getCenter());
            });
            
            this.elements.lngInput.addEventListener('change', function(e) {
                self.map.marker.setCenter({ lat: self.latitude, lng: Number(e.target.value) });
                self.map.api.setCenter(self.map.marker.getCenter());
            });
            
            this.elements.radInput.addEventListener('change', function(e) {
                self.map.marker.setRadius(self.radius = Number(e.target.value));
            });
        } else {
            this.map.marker = new google.maps.Marker({
                position: this.map.api.getCenter(),
                draggable: true,
                map: this.map.api
            });
            
            google.maps.event.addListener(this.map.api, 'dblclick', function(e) {
                self.map.marker.setPosition(e.latLng);
            });
            
            google.maps.event.addListener(this.map.marker, 'position_changed', function() {
                var latLng = self.map.marker.getPosition();
                self.elements.latInput.value = self.latitude = Number(latLng.lat().toFixed(self.precision));
                self.elements.lngInput.value = self.longitude = Number(latLng.lng().toFixed(self.precision));
            });
            
            this.elements.latInput.addEventListener('change', function(e) {
                self.map.marker.setPosition({ lat: Number(e.target.value), lng: self.longitude });
                self.map.api.setCenter(self.map.marker.getPosition());
            });
            
            this.elements.lngInput.addEventListener('change', function(e) {
                self.map.marker.setPosition({ lat: self.latitude, lng: Number(e.target.value) });
                self.map.api.setCenter(self.map.marker.getPosition());
            });
        }
    },
    
    move: function(x, y, relative) {
        if(this.element) {
            this.element.style.left = (relative ? this.x += x : this.x = Math.max(x, 0)) + 'px';
            this.element.style.top = (relative ? this.y += y : this.y = Math.max(y, 0)) + 'px';
        }
    },
    
    resize: function(width, height, relative) {
        this.width = Math.max((relative ? this.width += width : width), 200);
        this.height = Math.max((relative ? this.height += height : height), 200);
        
        // Obtain the pixel width of the longest printable label
        var labelWidth = 0, widthTestElem = document.createElement('span'), testStrings = [ 'LATITUDE', 'LONGITUDE', 'RADIUS' ];
        widthTestElem.style.fontSize = this.font.size;
        widthTestElem.style.visibility = 'hidden';
            
        document.body.appendChild(widthTestElem);
        for(var l in Mapsel.i18n[this.language]) {
            if(testStrings.indexOf(l) == -1) {
                continue;
            }
            
            widthTestElem.innerHTML = Mapsel.i18n[this.language][l];
            labelWidth = Math.max(labelWidth, widthTestElem.offsetWidth);
        }
        
        document.body.removeChild(widthTestElem);
        var labelWidthPercent = Math.ceil(((labelWidth + 15) / this.width) * 100),
            labelWidthString = labelWidthPercent + '%',
            inputWidthString = (100 - labelWidthPercent) + '%';
            
        // Calculate the map-container height
        var mapHeight = this.height, baseStyle = window.getComputedStyle(this.element, null);
        mapHeight -= (parseInt(baseStyle.borderTopWidth) + parseInt(baseStyle.borderBottomWidth));
        mapHeight -= (parseInt(baseStyle.paddingTop) + parseInt(baseStyle.paddingBottom));
        mapHeight -= this.elements.titleBar.offsetHeight;
        mapHeight -= this.elements.fieldset.offsetHeight;
            
        this.elements.latLabel.style.width = labelWidthString;
        this.elements.latInput.style.width = inputWidthString;
        this.elements.lngLabel.style.width = labelWidthString;
        this.elements.lngInput.style.width = inputWidthString;
        
        if(this.radius !== null) {
            this.elements.radLabel.style.width = labelWidthString;
            this.elements.radInput.style.width = inputWidthString;
        }
        
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.elements.mapContainer.style.height = mapHeight + 'px';
    },
    
    show: function() {
        if(this.element) {
            this.element.style.display = 'block';
            
            if(this.map.api) {
                this.map.api.setCenter({ lat: this.latitude, lng: this.longitude });
            } else {
                this.init();
            }
        }
        
        this.visible = true;
    }
};

/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

Mapsel.i18n = {
    en: {
        CLOSE:      'Click to close',
        LATITUDE:   'Latitude',
        LONGITUDE:  'Longitude',
        RADIUS:     'Radius'
    },
    ja: {
        CLOSE:      '閉じます',
        LATITUDE:   '緯度',
        LONGITUDE:  '経度',
        RADIUS:     '半径'
    },
    nb: {
        CLOSE:      'Klikk for å lukke',
        LATITUDE:   'Breddegrad',
        LONGITUDE:  'Lengdegrad',
        RADIUS:     'Radius'
    },
    nn: {
        CLOSE:      'Klikk for å stengje',
        LATITUDE:   'Breiddegrad',
        LONGITUDE:  'Lengdegrad',
        RADIUS:     'Radius'
    },
    yue: {
        CLOSE:      '點擊關閉',
        LATITUDE:   '緯度',
        LONGITUDE:  '經度',
        RADIUS:     '半徑'
    },
    zh: {
        CLOSE:      '点击关闭',
        LATITUDE:   '纬度',
        LONGITUDE:  '经度',
        RADIUS:     '半径'
    }
};

/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

(function() {
    var head = document.head || document.getElementsByTagName('head')[0],
        styleElement = document.createElement('style'),
        styles = {
            '.mapsel': [
                'border: 1px solid #aaa',
                'border-radius: 5px',
                'box-shadow: 0 0 2px 0 #aaa',
                'box-sizing: border-box',
                'font-family: sans-serif',
                'font-size: 0',
                'padding: 5px',
                'text-align: right'
            ],
            '.mapsel *' : [
                'border: 0',
                'box-sizing: border-box',
                'font-weight: normal',
                'line-height: normal',
                'margin: 0',
                'padding: 0'
            ],
            '.mapsel header a': [
                'color: #aaa',
                'cursor: pointer',
                'display: inline-block',
                'font-size: inherit',
                'font-weight: bold',
                'margin: 0 2px 5px 0',
                'text-decoration: none',
                'text-shadow: 0 0 2px #ccc'
            ],
            '.mapsel header a:hover': [
                'text-shadow: 0 0 1px #333'
            ],
            '.mapsel > div': [
                'border: 1px solid #aaa',
                'border-radius: 5px',
                'display: block',
                'width: 100%'
            ],
            '.mapsel fieldset label': [
                'display: inline-block',
                'font-size: inherit',
                'padding-right: 5px',
                'text-align: right',
                'width: 40%'
            ],
            '.mapsel fieldset input': [
                'border: 1px solid #aaa',
                'border-radius: 5px',
                'box-shadow: 0 0 2px 0 #aaa inset',
                'font-size: inherit',
                'margin-top: 5px',
                'padding: 2px 5px',
                'width: 60%'
            ]
        };
        
    styleElement.type = 'text/css';
        
    for(var s in styles) {
        var node = s + ' {';
        
        for(var n in styles[s]) {
            node += styles[s][n] + ';';
        }
        
        styleElement.appendChild(document.createTextNode(node + '}'));
    }
    
    head.appendChild(styleElement);
})();
