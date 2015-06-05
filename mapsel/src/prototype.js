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
        if(sw instanceof Array) {
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
