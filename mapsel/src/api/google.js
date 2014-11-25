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
