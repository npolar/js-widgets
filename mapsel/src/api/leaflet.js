/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

(function() { if(window.L && window.L.map) {
    
    Mapsel.api.Leaflet = function(parent) {
        var self = this;
        
        this.map = null;
        this.marker = null;
        
        if(typeof parent == 'object') {
            // Initialize map
            self.map = L.map(parent.elements.mapContainer, {
                center: { lat: parent.latitude, lng: parent.longitude },
                doubleClickZoom: false,
                zoom: 2
            });
            
            L.tileLayer('http://tilestream.data.npolar.no/v2/WorldHax/{z}/{x}/{y}.png').addTo(self.map);
            
            // Initialize marker
            if(parent.radius) {
                self.marker = L.circle(self.map.getCenter(), parent.radius).addTo(self.map);
                self.marker.mapselEvent = { move: false, resize: false };
                
                self.map.on('dblclick', function(e) {
                    self.marker.setLatLng(e.latlng);
                    parent.latitude = e.latlng.lat.toFixed(parent.precision);
                    parent.longitude = e.latlng.lng.toFixed(parent.precision);
                });
                
                // TODO: Move/Resize events
                
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
                self.marker = L.marker(self.map.getCenter(), {
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
