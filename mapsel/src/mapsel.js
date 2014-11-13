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
    this.height = Math.max(options.height || 250, 250);
    this.instance = Mapsel.instances++;
    this.language = options.language || 'en';
    this.latitude = clamp((typeof options.latitude == 'number' ? options.latitude : 65.0), -90.0, 90.0);
    this.longitude = clamp((typeof options.longitude == 'number' ? options.longitude : 0.0), -90.0, 90.0);
    this.map = { api: null, marker: null };
    this.opacity = clamp((typeof options.opacity == 'number' ? options.opacity : 1.0), 0.0, 1.0);
    this.precision = clamp((typeof options.precision == 'number' ? options.precision : 2), 0, 8);   // Number of coordinate decimals
    this.radius = Math.max(Math.round(options.radius || 0), 0) || null;
    this.visible = (options.visible === false) ? false: true;
    this.width = Math.max(options.width || 200, 200);
    this.x = options.x || 0;
    this.y = options.y || 0;
    
    // Function used to append children to the container element
    function append(tag, attribs, value) {
        var elem = document.createElement(tag);
        
        for(var a in attribs) {
            elem.setAttribute(a, attribs[a]);
        }
        
        if(value !== undefined) {
            elem.innerHTML = value;
        }
        
        self.element.appendChild(elem);
        return elem;
    }
    
    // Append a close-button if the current container element is closeable
    if(this.closeable) {
        this.elements.closeButton = append('a', { href: '#', title: Mapsel.i18n[this.language].CLOSE }, 'X');
        this.elements.closeButton.addEventListener('click', function() { self.hide(); });
    }
    
    // Determine the input step-value based on precision
    var stepString = this.precision ? '0.' : '1';
    for(var i = 0; i < this.precision; ++i) {
        stepString += (i == (this.precision - 1) ? 1 : 0);
    }
    
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
        labelStyle = 'width: ' + labelWidthPercent + '%',
        inputStyle = 'width: ' + (100 - labelWidthPercent) + '%';
    
    // Append mandatory children to the current container element
    this.elements.mapContainer = append('div', { id: 'mapsel_map_' + this.instance });
    this.elements.latLabel = append('label', { for: 'mapsel_lat_' + this.instance, style: labelStyle }, Mapsel.i18n[this.language].LATITUDE);
    this.elements.latInput = append('input', { id: 'mapsel_lat_' + this.instance, style: inputStyle, type: 'number', title: Mapsel.i18n[this.language].LATITUDE, min: -90, max: 90, step: stepString, value: this.latitude });
    this.elements.lngLabel = append('label', { for: 'mapsel_lng_' + this.instance, style: labelStyle }, Mapsel.i18n[this.language].LONGITUDE);
    this.elements.lngInput = append('input', { id: 'mapsel_lng_' + this.instance, style: inputStyle, type: 'number', title: Mapsel.i18n[this.language].LONGITUDE, min: -180, max: 180, step: stepString, value: this.longitude });
    
    // Append a radius input-field if the radius-value is specified
    if(this.radius !== null) {
        this.elements.radLabel = append('label', { for: 'mapsel_rad_' + this.instance, style: labelStyle }, Mapsel.i18n[this.language].RADIUS);
        this.elements.radInput = append('input', { id: 'mapsel_rad_' + this.instance, style: inputStyle, type: 'number', title: Mapsel.i18n[this.language].RADIUS, step: 1, value: this.radius });
    }
    
    // Set element specific styles
    this.element.className = 'mapsel';
    this.element.style.background = this.background;
    this.element.style.fontSize = this.font.size;
    this.element.style.height = this.height + 'px';
    this.element.style.left = this.x + 'px';
    this.element.style.opacity = this.opacity;
    this.element.style.top = this.y + 'px';
    this.element.style.width = this.width + 'px';
    this.elements.mapContainer.style.height = (this.height - ((this.closeable ? 30 : 10) + (30 * (this.radius ? 3 : 2)))) + 'px';
    
    // Initialize the map-container
    this.map.api = new google.maps.Map(this.elements.mapContainer, {
        center: { lat: this.latitude, lng: this.longitude },
        disableDoubleClickZoom: true,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        streetViewControl: false,
        zoom: 1
    });
    
    // Initialize map-marker and related events
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
    
    // Append the current container element to the document
    if(this.container) {
        this.container.appendChild(this.element);
    } else document.body.appendChild(this.element);
};

Mapsel.instances = 0;
