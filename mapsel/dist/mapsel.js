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
    
    this.api = options.api || 'google';
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
        if(this.element) {
            this.element.style.display = 'none';
        }
        
        this.visible = false;
    },
    
    focus: function(element) {
        if(this.elements) {
            switch(element) {
            case 'lat':
            case 'latitude':
                if(this.elements.latInput) {
                    this.elements.latInput.focus();
                }
                break;
                
            case 'lng':
            case 'longitude':
                if(this.elements.lngInput) {
                    this.elements.lngInput.focus();
                }
                break;
                
            case 'rad':
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
            if(parent.radius) {
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
            if(parent.radius) {
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
                    var latLng = self.marker.getLatLng(),
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
                    var latLng = e.latlng,
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
    };
    
    Mapsel.api.Leaflet.prototype = {
        center: function(latitude, longitude) {
            if(this.map) {
                this.map.setView({ lat: latitude, lng: longitude });
            }
        }
    };
    
}})();
