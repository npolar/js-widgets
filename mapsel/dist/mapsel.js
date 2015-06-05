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

/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

Mapsel.prototype = {
    on: function(event, callback) {
        if(typeof callback == 'function') {
            this.events[event] = callback;
        } else if(this.events[event]) {
            delete this.events[event];
        }
    },
    
    hide: function() {
        if(this.elements.root) {
            this.elements.root.style.display = 'none';
        }
        
        this.visible = false;
    },
    
    focus: function(element) {
        if(this.elements) {
            switch(element) {
            case 'latitude':
                if(this.elements.latInput) {
                    this.elements.latInput.focus();
                }
                break;
                
            case 'longitude':
                if(this.elements.lngInput) {
                    this.elements.lngInput.focus();
                }
                break;
                
            case 'radius':
                if(this.elements.radInput) {
                    this.elements.radInput.focus();
                }
                break;
            }
        }
    },
    
    init: function(api) {
        var self = this;
        
        for(var a in Mapsel.api) {
            if(api.toLowerCase() == a.toLowerCase()) {
                this.api = new Mapsel.api[a](self);
                return true;
            }
        }
        
        console.error('Unsupported map API: ' + api);
        return false;
    },
    
    move: function(x, y, relative) {
        if(this.elements.root) {
            this.elements.root.style.left = (relative ? this.x += x : this.x = Math.max(x, 0)) + 'px';
            this.elements.root.style.top = (relative ? this.y += y : this.y = Math.max(y, 0)) + 'px';
        }
    },
    
    resize: function(width, height, relative) {
        this.width = Math.max((relative ? this.width += width : width), 200);
        this.height = Math.max((relative ? this.height += height : height), 200);
        
        // Obtain the pixel width of the longest printable label
        var labelWidth = 0, widthTestElem = document.createElement('span'), testStrings = [];
        widthTestElem.style.fontSize = this.font.size;
        widthTestElem.style.visibility = 'hidden';
        
        if(this.northeast !== null && this.southwest !== null) {
            testStrings.push('NORTHEAST', 'SOUTHWEST');
        } else if(this.latitude !== null && this.longitude !== null) {
            testStrings.push('LATITUDE', 'LONGITUDE');
            
            if(this.radius !== null) {
                testStrings.push('RADIUS');
            }
        }
        
        document.body.appendChild(widthTestElem);
        for(var i in testStrings) {
            widthTestElem.innerHTML = Mapsel.i18n(this.language, testStrings[i]);
            labelWidth = Math.max(labelWidth, widthTestElem.offsetWidth);
        }
        document.body.removeChild(widthTestElem);
        
        var labelWidthPercent = Math.ceil(((labelWidth + 15) / this.width) * 100),
            labelWidthString = labelWidthPercent + '%',
            inputWidthString = (100 - labelWidthPercent) + '%';
            
        // Calculate the map-container height
        var mapHeight = this.height, baseStyle = window.getComputedStyle(this.elements.root, null);
        mapHeight -= (parseInt(baseStyle.borderTopWidth) + parseInt(baseStyle.borderBottomWidth));
        mapHeight -= (parseInt(baseStyle.paddingTop) + parseInt(baseStyle.paddingBottom));
        mapHeight -= this.elements.titleBar.offsetHeight;
        mapHeight -= this.elements.fieldset.offsetHeight;
        
        var labelElements = [ 'latLabel', 'lngLabel', 'radLabel', 'neLabel', 'swLabel' ];
        for(var le in labelElements) {
            if(this.elements[labelElements[le]]) {
                this.elements[labelElements[le]].style.width = labelWidthString;
            }
        }
        
        var inputElements = [ 'latInput', 'lngInput', 'radInput', 'neGroup', 'swGroup' ];
        for(var ie in inputElements) {
            if(this.elements[inputElements[ie]]) {
                this.elements[inputElements[ie]].style.width = inputWidthString;
            }
        }
        
        this.elements.root.style.width = this.width + 'px';
        this.elements.root.style.height = this.height + 'px';
        this.elements.mapContainer.style.height = mapHeight + 'px';
    },
    
    setNortheast: function(ne) {
        if(ne instanceof Array) {
            this.northeast = { latitude: ne[0], longitude: ne[1] };
        } else if(ne.hasOwnProperty('latitude') && ne.hasOwnProperty('longitude')) {
            this.northeast = ne;
        }
        
        this.elements.neLatInput = this.northeast.latitude;
        this.elements.neLngInput = this.northeast.longitude;
    },
    
    setSouthwest: function(sw) {
        if(ne instanceof Array) {
            this.southwest = { latitude: sw[0], longitude: sw[1] };
        } else if(sw.hasOwnProperty('latitude') && sw.hasOwnProperty('longitude')) {
            this.southwest = sw;
        }
        
        this.elements.swLatInput = this.southwest.latitude;
        this.elements.swLngInput = this.southwest.longitude;
    },
    
    show: function() {
        if(this.elements.root) {
            this.elements.root.style.display = 'block';
            
            if(typeof this.api == 'object') {
                this.api.center(this.latitude, this.longitude);
            } else {
                this.init(this.api);
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

Mapsel.i18n = function(lang, code) {
    if(Mapsel.i18n[lang] && Mapsel.i18n[lang][code]) {
        return Mapsel.i18n[lang][code];
    } else if(Mapsel.i18n.alias[lang]) {
        for(var i in Mapsel.i18n.alias[lang]) {
            var alias = Mapsel.i18n.alias[lang][i];
            
            if(Mapsel.i18n[alias] && Mapsel.i18n[alias][code]) {
                return Mapsel.i18n[alias][code];
            }
        }
    }
    
    // Use English (en) as secondary fallback
    return Mapsel.i18n.en[code];
};

// Language aliases as primary fallback
Mapsel.i18n.alias = {
    no: [ 'nb', 'nn' ],
    nb: [ 'nn' ],
    nn: [ 'nb' ]
};

// Language definitions
Mapsel.i18n.en = {
    CLOSE:      'Click to close',
    LATITUDE:   'Latitude',
    LONGITUDE:  'Longitude',
    NORTHEAST:  'Northeast',
    RADIUS:     'Radius',
    SOUTHWEST:  'Southwest'
};

Mapsel.i18n.ja = {
    CLOSE:      '閉じます',
    LATITUDE:   '緯度',
    LONGITUDE:  '経度',
    NORTHEAST:  '北東',
    RADIUS:     '半径',
    SOUTHWEST:  '南西'
};

Mapsel.i18n.nb = {
    CLOSE:      'Klikk for å lukke',
    LATITUDE:   'Breddegrad',
    LONGITUDE:  'Lengdegrad',
    NORTHEAST:  'Nordøst',
    RADIUS:     'Radius',
    SOUTHWEST:  'Sydvest'
};

Mapsel.i18n.nn = {
    CLOSE:      'Klikk for å stengje',
    LATITUDE:   'Breiddegrad',
    LONGITUDE:  'Lengdegrad',
    NORTHEAST:  'Nordaust',
    RADIUS:     'Radius',
    SOUTHWEST:  'Sørvest'
};

Mapsel.i18n.yue = {
    CLOSE:      '點擊關閉',
    LATITUDE:   '緯度',
    LONGITUDE:  '經度',
    NORTHEAST:  '東北',
    RADIUS:     '半徑',
    SOUTHWEST:  '西南'
};

Mapsel.i18n.zh = {
    CLOSE:      '点击关闭',
    LATITUDE:   '纬度',
    LONGITUDE:  '经度',
    NORTHEAST:  '东北',
    RADIUS:     '半径',
    SOUTHWEST:  '西南'
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
            '.mapsel header': [
                'font-family: sans-serif',
                'font-size: 14px',
                'font-style: normal'
            ],
            '.mapsel header a': [
                'color: #666',
                'cursor: pointer',
                'display: inline-block',
                'font-weight: bold',
                'margin: 0 2px 5px 0',
                'text-decoration: none',
                'text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6)'
            ],
            '.mapsel header a:hover': [
                'text-shadow: 0 0 2px rgba(0, 0, 0, 0.8)'
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
            ],
            '.mapsel-input-pair': [
                'display: inline-block',
                'width: 60%'
            ],
            '.mapsel-input-pair input': [
                'width: 50% !important'
            ],
            '.mapsel-icon': [
                'background: #fff',
                'border: 1px solid #333',
                'border-radius: 2px',
                'box-shadow: 0 0 3px 0 #3c3c3c',
                'cursor: pointer'
            ],
            '.mapsel-icon:hover': [
                'background: #ccc',
                'box-shadow: 0 0 3px 0 #393939',
            ],
            '.mapsel-icon-move': [
                'border-radius: 5px',
                'cursor: move'
            ],
            '.mapsel-icon-resize-ns': [
                'cursor: ns-resize'
            ],
            '.mapsel-icon-resize-ew': [
                'cursor: ew-resize'
            ],
            '.mapsel-icon-resize-ne': [
                'cursor: ne-resize'
            ],
            '.mapsel-icon-resize-nw': [
                'cursor: nw-resize'
            ],
            '.mapsel-icon-resize-se': [
                'cursor: se-resize'
            ],
            '.mapsel-icon-resize-sw': [
                'cursor: sw-resize'
            ],
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

/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

(function() { if(window.google && window.google.maps) {
    
    Mapsel.api.Google = function(parent) {
        var self = this;
        
        this.map = null;
        this.marker = null;
        
        if(typeof parent == 'object') {
            // Initialize map
            self.map = new google.maps.Map(parent.elements.mapContainer, {
                center: { lat: parent.latitude, lng: parent.longitude },
                disableDoubleClickZoom: true,
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                streetViewControl: false,
                zoom: 2
            });
            
            // Initialize marker
            if(parent.northeast !== null && parent.southwest !== null) {
                self.marker = new google.maps.Rectangle({
                    bounds: new google.maps.LatLngBounds(
                        new google.maps.LatLng(parent.southwest.latitude, parent.southwest.longitude),
                        new google.maps.LatLng(parent.northeast.latitude, parent.northeast.longitude)
                    ),
                    draggable: true,
                    editable: true,
                    map: self.map
                });
                
                var markerCenter = self.marker.getBounds().getCenter();
                parent.latitude = markerCenter.lat();
                parent.longitude = markerCenter.lng();
                this.map.setCenter(markerCenter);
                
                google.maps.event.addListener(self.map, 'dblclick', function(e) {
                    var markerBounds = self.marker.getBounds(),
                        markerCenter = markerBounds.getCenter(),
                        markerNorthEast = markerBounds.getNorthEast(),
                        markerSouthWest = markerBounds.getSouthWest(),
                        difference = {
                            lat: e.latLng.lat() - markerCenter.lat(),
                            lng: e.latLng.lng() - markerCenter.lng()
                        };
                    
                    self.marker.setBounds(new google.maps.LatLngBounds(
                        new google.maps.LatLng(markerSouthWest.lat() + difference.lat, markerSouthWest.lng() + difference.lng),
                        new google.maps.LatLng(markerNorthEast.lat() + difference.lat, markerNorthEast.lng() + difference.lng)
                    ));
                });
                
                google.maps.event.addListener(self.marker, 'bounds_changed', function() {
                    var northEast = self.marker.getBounds().getNorthEast(),
                        southWest = self.marker.getBounds().getSouthWest(),
                        newNorthEast = {
                            latitude: Number(northEast.lat().toFixed(parent.precision)),
                            longitude: Number(northEast.lng().toFixed(parent.precision))
                        },
                        newSouthWest = {
                            latitude: Number(southWest.lat().toFixed(parent.precision)),
                            longitude: Number(southWest.lng().toFixed(parent.precision))
                        };
                        
                    if(parent.northeast.latitude != newNorthEast.latitude || parent.northeast.longitude != newNorthEast.longitude) {
                        parent.elements.neLatInput.value = parent.northeast.latitude = newNorthEast.latitude;
                        parent.elements.neLngInput.value = parent.northeast.longitude = newNorthEast.longitude;
                        
                        if(typeof parent.events.northeast == 'function') {
                            parent.events.northeast(newNorthEast);
                        }
                    }
                    
                    if(parent.southwest.latitude != newSouthWest.latitude || parent.southwest.longitude != newSouthWest.longitude) {
                        parent.elements.swLatInput.value = parent.southwest.latitude = newSouthWest.latitude;
                        parent.elements.swLngInput.value = parent.southwest.longitude = newSouthWest.longitude;
                        
                        if(typeof parent.events.southwest == 'function') {
                            parent.events.southwest(newSouthWest);
                        }
                    }
                    
                    parent.latitude = self.marker.getBounds().getCenter().lat();
                    parent.longitude = self.marker.getBounds().getCenter().lng();
                });
                
                parent.elements.neLatInput.addEventListener('change', function(e) {
                    var markerBounds = self.marker.getBounds();
                    
                    self.marker.setBounds(new google.maps.LatLngBounds(
                        markerBounds.getSouthWest(),
                        new google.maps.LatLng(Number(e.target.value), markerBounds.getNorthEast().lng())
                    ));
                    
                    self.map.setCenter(self.marker.getBounds().getCenter());
                });
                
                parent.elements.neLngInput.addEventListener('change', function(e) {
                    var markerBounds = self.marker.getBounds();
                    
                    self.marker.setBounds(new google.maps.LatLngBounds(
                        markerBounds.getSouthWest(),
                        new google.maps.LatLng(markerBounds.getNorthEast().lat(), Number(e.target.value))
                    ));
                    
                    self.map.setCenter(self.marker.getBounds().getCenter());
                });
                
                parent.elements.swLatInput.addEventListener('change', function(e) {
                    var markerBounds = self.marker.getBounds();
                    
                    self.marker.setBounds(new google.maps.LatLngBounds(
                        new google.maps.LatLng(Number(e.target.value), markerBounds.getSouthWest().lng()),
                        markerBounds.getNorthEast()
                    ));
                    
                    self.map.setCenter(self.marker.getBounds().getCenter());
                });
                
                parent.elements.swLngInput.addEventListener('change', function(e) {
                    var markerBounds = self.marker.getBounds();
                    
                    self.marker.setBounds(new google.maps.LatLngBounds(
                        new google.maps.LatLng(markerBounds.getSouthWest().lat(), Number(e.target.value)),
                        markerBounds.getNorthEast()
                    ));
                    
                    self.map.setCenter(self.marker.getBounds().getCenter());
                });
            } else if(parent.latitude !== null && parent.longitude !== null) {
                if(parent.radius !== null) {
                    self.marker = new google.maps.Circle({
                        center: self.map.getCenter(),
                        draggable: true,
                        editable: true,
                        map: self.map,
                        radius: parent.radius
                    });
                    
                    google.maps.event.addListener(self.map, 'dblclick', function(e) {
                        self.marker.setCenter(e.latLng);
                    });
                    
                    google.maps.event.addListener(self.marker, 'center_changed', function() {
                        var latLng = self.marker.getCenter(),
                            newLat = Number(latLng.lat().toFixed(parent.precision)),
                            newLng = Number(latLng.lng().toFixed(parent.precision));
                        
                        if(newLat != parent.latitude) {
                            parent.elements.latInput.value = parent.latitude = newLat;
                            
                            if(typeof parent.events.latitude == 'function') {
                                parent.events.latitude(newLat);
                            }
                        }
                        
                        if(newLng != parent.longitude) {
                            parent.elements.lngInput.value = parent.longitude = newLng;
                            
                            if(typeof parent.events.longitude == 'function') {
                                parent.events.longitude(newLng);
                            }
                        }
                    });
                    
                    google.maps.event.addListener(self.marker, 'radius_changed', function() {
                        parent.elements.radInput.value = parent.radius = Math.round(self.marker.getRadius());
                        
                        if(typeof parent.events.radius == 'function') {
                            parent.events.radius(parent.radius);
                        }
                    });
                    
                    parent.elements.latInput.addEventListener('change', function(e) {
                        self.marker.setCenter({ lat: Number(e.target.value), lng: parent.longitude });
                        self.map.setCenter(self.marker.getCenter());
                    });
                    
                    parent.elements.lngInput.addEventListener('change', function(e) {
                        self.marker.setCenter({ lat: parent.latitude, lng: Number(e.target.value) });
                        self.map.setCenter(self.marker.getCenter());
                    });
                    
                    parent.elements.radInput.addEventListener('change', function(e) {
                        self.marker.setRadius(parent.radius = Number(e.target.value));
                    });
                } else {
                    self.marker = new google.maps.Marker({
                        position: self.map.getCenter(),
                        draggable: true,
                        map: self.map
                    });
                    
                    google.maps.event.addListener(self.map, 'dblclick', function(e) {
                        self.marker.setPosition(e.latLng);
                    });
                    
                    google.maps.event.addListener(self.marker, 'position_changed', function() {
                        var latLng = self.marker.getPosition(),
                            newLat = Number(latLng.lat().toFixed(parent.precision)),
                            newLng = Number(latLng.lng().toFixed(parent.precision));
                        
                        if(newLat != parent.latitude) {
                            parent.elements.latInput.value = parent.latitude = newLat;
                            
                            if(typeof parent.events.latitude == 'function') {
                                parent.events.latitude(newLat);
                            }
                        }
                        
                        if(newLng != parent.longitude) {
                            parent.elements.lngInput.value = parent.longitude = newLng;
                            
                            if(typeof parent.events.longitude == 'function') {
                                parent.events.longitude(newLng);
                            }
                        }
                    });
                    
                    parent.elements.latInput.addEventListener('change', function(e) {
                        self.marker.setPosition({ lat: Number(e.target.value), lng: parent.longitude });
                        self.map.setCenter(self.marker.getPosition());
                    });
                    
                    parent.elements.lngInput.addEventListener('change', function(e) {
                        self.marker.setPosition({ lat: parent.latitude, lng: Number(e.target.value) });
                        self.map.setCenter(self.marker.getPosition());
                    });
                }
            }
        }
    };
    
    Mapsel.api.Google.prototype = {
        center: function(latitude, longitude) {
            if(this.map) {
                this.map.setCenter({ lat: latitude, lng: longitude });
            }
        }
    };
    
}})();

/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

(function() { if(window.L && window.L.map) {
    
    L.MapselCircle = L.Circle.extend({
        options: {
            color: '#000',
            draggable: false,
            editable: false,
            weight: 2
        },
        
        _initMarkers: function() {
            var center = this.getLatLng();
            
            this._markers = {};
            this._layerGroup = new L.LayerGroup();
            
            if(this.options.draggable) {
                this._markers.move = new L.Marker(center, {
                    draggable: true,
                    icon: new L.DivIcon({
                        iconSize: new L.Point(8, 8),
                        className: 'mapsel-icon mapsel-icon-move'
                    })
                }).on('drag', this._onMove, this);
                
                this._layerGroup.addLayer(this._markers.move);
            }
            
            if(this.options.editable) {
                this._markers.resize = new L.Marker(center, {
                    draggable: true,
                    icon: new L.DivIcon({
                        iconSize: new L.Point(8, 8),
                        className: 'mapsel-icon mapsel-icon-resize-ew'
                    })
                }).on('drag', this._onResize, this);
                
                this._layerGroup.addLayer(this._markers.resize);
            }
            
            this._updateMarkers();
            this._map.addLayer(this._layerGroup);
        },
        
        _updateMarkers: function() {
            if(this._markers) {
                var bounds = this.getBounds(),
                    center = bounds.getCenter(),
                    northEast = bounds.getNorthEast();
                
                if(this._markers.move) {
                    this._markers.move.setLatLng(center);
                }
                
                if(this._markers.resize) {
                    this._markers.resize.setLatLng(new L.LatLng(center.lat, northEast.lng));
                }
            }
        },
        
        _onMove: function(e) {
            var marker = e.target;
            this.setLatLng(marker.getLatLng());
            this.fire('center_changed');
        },

        _onResize: function(e) {
            var marker = e.target,
                center = this.getLatLng(),
                distance = center.distanceTo(marker._latlng);
                
            this.setRadius(distance);
            var northEast = this.getBounds().getNorthEast();
            marker.setLatLng(new L.LatLng(center.lat, northEast.lng));
            this.fire('radius_changed');
        },
        
        onAdd: function(map) {
            L.Path.prototype.onAdd.call(this, map);
            this._initMarkers();
        },
        
        onRemove: function(map) {
            L.Path.prototype.onRemove.call(this, map);
            
            if(this._map && this._layerGroup) {
                this._map.removeLayer(this._layerGroup);
            }
            
            delete this._markers;
            delete this._layerGroup;
        },
        
        setLatLng: function(latlng) {
            L.Circle.prototype.setLatLng.call(this, latlng);
            this._updateMarkers();
        },
        
        setRadius: function(radius) {
            L.Circle.prototype.setRadius.call(this, radius);
            this._updateMarkers();
        }
    });
    
    Mapsel.api.Leaflet = function(parent) {
        var self = this;
        
        this.map = null;
        this.marker = null;
        
        function latLngWrapped(latLng) {
            if(latLng && latLng.lat && latLng.lng) {
                var ret = new L.LatLng(latLng.lat, latLng.lng);
                
                // Wrap latitude
                while(ret.lat > 90.0)   ret.lat = -(180.0 - ret.lat);
                while(ret.lat < -90.0)  ret.lat = ret.lat + 180.0;
                
                // Wrap longitude
                while(ret.lng > 180.0)  ret.lng = -(360.0 - ret.lng);
                while(ret.lng < -180.0) ret.lng = ret.lng + 360.0;
                
                return ret;
            }
            
            return latLng;
        }
        
        if(typeof parent == 'object') {
            // Initialize map
            self.map = new L.Map(parent.elements.mapContainer, {
                center: { lat: parent.latitude, lng: parent.longitude },
                doubleClickZoom: false,
                zoom: 2
            });
            
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '<a href="http://osm.org/copyright">OpenStreetMap</a>',
                minZoom: 0,
                maxZoom: 16
            }).addTo(self.map);
            
            // Initialize marker
            if(parent.northeast !== null && parent.southwest !== null) {
                
                // TODO
                
            } else if(parent.latitude !== null && parent.longitude !== null) {
                if(parent.radius !== null) {
                    self.marker = new L.MapselCircle(self.map.getCenter(), parent.radius, {
                        draggable: true,
                        editable: true
                    }).addTo(self.map);
                    
                    self.map.on('dblclick', function(e) {
                        self.marker.setLatLng(e.latlng);
                        parent.latitude = parent.elements.latInput.value = e.latlng.lat.toFixed(parent.precision);
                        parent.longitude = parent.elements.lngInput.value = e.latlng.lng.toFixed(parent.precision);
                    });
                    
                    self.marker.on('center_changed', function() {
                        var latLng = latLngWrapped(self.marker.getLatLng()),
                            newLat = Number(latLng.lat.toFixed(parent.precision)),
                            newLng = Number(latLng.lng.toFixed(parent.precision));
                            
                        if(newLat != parent.latitude) {
                            parent.elements.latInput.value = parent.latitude = newLat;
                            
                            if(typeof parent.events.latitude == 'function') {
                                parent.events.latitude(newLat);
                            }
                        }
                        
                        if(newLng != parent.longitude) {
                            parent.elements.lngInput.value = parent.longitude = newLng;
                            
                            if(typeof parent.events.longitude == 'function') {
                                parent.events.longitude(newLng);
                            }
                        }
                    });
                    
                    self.marker.on('radius_changed', function() {
                        parent.elements.radInput.value = parent.radius = Math.round(self.marker.getRadius());
                        
                        if(typeof parent.events.radius == 'function') {
                            parent.events.radius(parent.radius);
                        }
                    });
                    
                    parent.elements.latInput.addEventListener('change', function(e) {
                        self.marker.setLatLng({ lat: (parent.latitude = Number(e.target.value)), lng: parent.longitude });
                        self.map.setView(self.marker.getLatLng());
                    });
                    
                    parent.elements.lngInput.addEventListener('change', function(e) {
                        self.marker.setLatLng({ lat: parent.latitude, lng: (parent.longitude = Number(e.target.value)) });
                        self.map.setView(self.marker.getLatLng());
                    });
                    
                    parent.elements.radInput.addEventListener('change', function(e) {
                        self.marker.setRadius(parent.radius = Number(e.target.value));
                    });
                } else {
                    self.marker = new L.Marker(self.map.getCenter(), {
                        draggable: true
                    }).addTo(self.map);
                    
                    self.map.on('dblclick', function(e) {
                        self.marker.setLatLng(e.latlng);
                    });
                    
                    self.marker.on('move', function(e) {
                        var latLng = latLngWrapped(e.latlng),
                            newLat = Number(latLng.lat.toFixed(parent.precision)),
                            newLng = Number(latLng.lng.toFixed(parent.precision));
                            
                        if(newLat != parent.latitude) {
                            parent.elements.latInput.value = parent.latitude = newLat;
                            
                            if(typeof parent.events.latitude == 'function') {
                                parent.events.latitude(newLat);
                            }
                        }
                        
                        if(newLng != parent.longitude) {
                            parent.elements.lngInput.value = parent.longitude = newLng;
                            
                            if(typeof parent.events.longitude == 'function') {
                                parent.events.longitude(newLng);
                            }
                        }
                    });
                    
                    parent.elements.latInput.addEventListener('change', function(e) {
                        self.marker.setLatLng({ lat: Number(e.target.value), lng: parent.longitude });
                        self.map.setView(self.marker.getLatLng());
                    });
                    
                    parent.elements.lngInput.addEventListener('change', function(e) {
                        self.marker.setLatLng({ lat: parent.latitude, lng: Number(e.target.value) });
                        self.map.setView(self.marker.getLatLng());
                    });
                }
            }
        }
    };
    
    Mapsel.api.Leaflet.prototype = {
        center: function(latitude, longitude) {
            if(this.map) {
                this.map.setView({ lat: latitude, lng: longitude });
            }
        }
    };
    
}})();
