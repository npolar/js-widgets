/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

(function() { if(google && google.maps) {
    
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
                    self.map.marker.setPosition(e.latLng);
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
