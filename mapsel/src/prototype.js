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
