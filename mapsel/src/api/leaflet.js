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
