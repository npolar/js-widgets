/**
 * Konsoll.js - Developer Console for output/input
 * Customisable and interactive JavaScript console widget.
 *
 * Norsk Polarinstitutt 2014, http://npolar.no/
 */

var Konsoll = function(options) {
	if(typeof options != 'object') {
		options = {};
	}
	
	this.autoHide		= (typeof options.autoHide == 'boolean' ? options.autoHide : true);
	this.container		= (options.container ? (document.getElementById(options.container) || null) : null);
	this.echo			= (typeof options.echo == 'boolean' ? options.echo : true);
	this.history		= (typeof options.history == 'number' ? Math.abs(Math.round(options.history)) : 0);
	this.scrollback		= (typeof options.scrollback == 'number' ? Math.max(-1, Math.round(options.scrollback)) : -1);
	this.visible		= (typeof options.visible == 'boolean' ? options.visible : false);
	this.escHide		= (typeof options.escHide == 'boolean' ? options.escHide : true);
	
	this.callbacks		= { clear: this.clear.bind(this), help: this.help.bind(this) };
	this.inputHistory	= [];
	this.mouseOver		= false;
	this.listElement	= null;
	this.formElement	= null;
	this.inputElement	= null;
	
	if(this.container) {
		for(var child = 0; child < this.container.children.length; ++child) {
			if(this.container.children[child].tagName == 'OL' || this.container.children[child].tagName == 'UL') {
				this.listElement = this.container.children[child];
			}
			
			if(this.container.children[child].tagName == 'FORM') {
				this.formElement = this.container.children[child];
				
				for(var e = 0; e < this.formElement.elements.length; ++e) {
					var elem = this.formElement.elements[e];
					
					if(elem.tagName == 'INPUT' && elem.type == 'text') {
						this.inputElement = elem;
						break;
					}
				}
			}
		}
		
		if(!this.listElement) {
			this.listElement = document.createElement('OL');
			this.container.appendChild(this.listElement);
		}
		
		if(!this.formElement) {
			this.formElement = document.createElement('FORM');
			
			this.inputElement = document.createElement('INPUT');
			this.inputElement.setAttribute('type', 'text');
			this.formElement.appendChild(this.inputElement);
			
			var submitElement = document.createElement('INPUT');
			submitElement.setAttribute('type', 'submit');
			submitElement.setAttribute('value', 'OK');
			this.formElement.appendChild(submitElement);
			
			this.container.appendChild(this.formElement);
		}
		
		this.formElement.addEventListener('submit', function(event) {
			this.call(this.inputElement.value);
			this.inputElement.value = '';
			this.inputElement.focus();
			event.preventDefault();
		}.bind(this));
		
		// Enable history-search
		this.inputElement.addEventListener('keydown', function(event) {
			if(this.history > 0 && this.inputHistory.length) {
				var index = this.inputHistory.indexOf(this.inputElement.value);
				
				if(event.keyCode == 38) { 			// Up
					this.inputElement.value = this.inputHistory[(++index >= this.inputHistory.length ? 0 : index)];
					event.preventDefault();
				} else if(event.keyCode == 40) {	// Down
					this.inputElement.value = this.inputHistory[(--index < 0 ? this.inputHistory.length - 1 : index)];
					event.preventDefault();
				}
			}
		}.bind(this));
		
		// Montitor mouse hovering
		this.container.addEventListener('mouseenter', function() { this.mouseOver = true; }.bind(this));
		this.container.addEventListener('mouseleave', function() { this.mouseOver = false; }.bind(this));
		
		// Enable auto-hiding
		document.addEventListener('click', function() {
			function hasFocus(parent) {
				if(document.activeElement == parent) {
					return true;
				}
				
				for(var c = 0; c < parent.children.length; ++c) {
					if(hasFocus(parent.children[c])) {
						return true;
					}
				}
				
				return false;
			}
			
			if((this.autoHide = !!this.autoHide)) {
				if(!this.mouseOver && !hasFocus(this.container)) {
					this.hide();
				}
			}
		}.bind(this));
		
		// Initially show/hide to override default styling
		if(this.visible) {
			this.show();
		} else {
			this.hide();
		}
	}
	
	if(typeof options.toggleKey == 'number') {
		document.addEventListener('keydown', function(event) {
			if(document.activeElement != this.inputElement) {
				if(event.keyCode == Math.round(options.toggleKey)) {
					this.toggle();
					event.preventDefault();
				}
			}
		}.bind(this));
	}
	
	if(this.escHide) {
		document.addEventListener('keydown', function(event) {
			if(this.visible && event.keyCode == 27) {
				this.hide();
			}
		}.bind(this));
	}
};

Konsoll.VERSION = "0.1.2";
Konsoll.AUTHORS = [ "Remi A. Solås <remi@npolar.no>" ];

Konsoll.prototype = {
	call: function(str) {
		if(this.history > 0) {
			var index = this.inputHistory.indexOf(str);
			
			if(index != -1) {
				this.inputHistory.splice(index, 1);
			}
			
			this.inputHistory.unshift(str);
			
			while(this.inputHistory.length > this.history) {
				this.inputHistory.pop();
			}
		}
		
		var call = str.split(' ');
		if(this.callbacks[call[0]]) {
			this.callbacks[call[0]](call.splice(1));
		} else if(this.echo) {
			this.log(str);
		}
	},
	callback: function(keyword, callback) {
		if(typeof keyword == 'string' && typeof callback == 'function') {
			this.callbacks[keyword] = callback;
		}
	},
	clear: function() {
		if(this.listElement) {
			while(this.listElement.children.length) {
				this.listElement.removeChild(this.listElement.firstChild);
			}
		}
	},
	help: function() {
		var callbacks = [];
		
		for(var c in this.callbacks) {
			callbacks.push('<strong>' + c + '</strong>');
		}
		
		this.log('Available commands: ' + callbacks.join(', '));
	},
	hide: function() {
		if(this.container && this.formElement) {
			var classes = (this.container.className.length ? this.container.className.split(' ') : []), index;
			
			for(var child = 0; child < this.formElement.children.length; ++child) {
				this.formElement.children[child].setAttribute('disabled', 'disabled');
				this.formElement.children[child].blur();
			}
			
			if((index = classes.indexOf('visible')) != -1) {
				classes.splice(index, 1);
				this.container.className = classes.join(' ');
			}
			
			this.visible = false;
		}
	},
	show: function() {
		if(this.container && this.formElement) {
			var classes = (this.container.className.length ? this.container.className.split(' ') : []);
			
			for(var child = 0; child < this.formElement.children.length; ++child) {
				this.formElement.children[child].removeAttribute('disabled');
			}
			
			if(classes.indexOf('visible') == -1) {
				classes.push('visible');
				this.container.className = classes.join(' ');
			}
			
			this.inputElement.focus();
			this.visible = true;
		}
	},
	toggle: function() {
		if(this.visible) {
			this.hide();
		} else {
			this.show();
		}
	},
	write: function(className, args) {
		function arrayToString(arr) {
			var str = [];
			
			for(var a = 0; a < arr.length; ++a) {
				if(arr[a] instanceof Array			||
				   arr[a] instanceof Int8Array		||
				   arr[a] instanceof Uint8Array		||
				   arr[a] instanceof Int16Array		||
				   arr[a] instanceof Uint16Array	||
				   arr[a] instanceof Int32Array		||
				   arr[a] instanceof Uint32Array	||
				   arr[a] instanceof Float32Array	||
				   arr[a] instanceof Float64Array) {
					str.push('[' + arrayToString(arr[a]) + ']');
				} else if(typeof arr[a] == 'object') {
					str.push(JSON.stringify(arr[a]));
				} else if(typeof arr[a] == 'number') {
					str.push(arr[a].toString());
				} else if(typeof arr[a] == 'string') {
					var splitted = arr[a].split(' '), url;
					
					for(var e in splitted) {
						if((url = /^https?:\/\/.+/i.exec(splitted[e]))) {
							splitted[e] = splitted[e].replace(url[0],
								'<a href="' + url[0] + '" title="Click to open URL">' + url[0] + '</a>'
							);
						}
					}
					
					str.push(splitted.join(' '));
				} else switch(arr[a]) {
					case undefined:
						str.push('undefined');
						break;
						
					case null:
						str.push('null');
						break;
						
					default:
						str.push(arr[a]);
				}
			}
			
			return str.join(', ');
		}
		
		if(!this.listElement || !args) {
			return;
		}
		
		var message = arrayToString(args);
		var listItem = document.createElement('LI');
		
		if(className) {
			listItem.className = className;
		}
		
		var date = new Date().toISOString();
		var timestamp = /^(\d{4}(?:-\d{2}){2})T((?:\d{2}:){2}\d{2})/.exec(date);
		
		if(timestamp) {
			timestamp = (timestamp[1] + ', ' + timestamp[2]);
			listItem.setAttribute('title', timestamp);
		}
		
		listItem.innerHTML = message;
		this.listElement.appendChild(listItem);
		this.listElement.scrollTop = this.listElement.scrollHeight;
		
		if(this.scrollback > -1) {
			while(this.listElement.children.length > this.scrollback) {
				this.listElement.removeChild(this.listElement.firstChild);
			}
		}
	},
	log: function(a) {
		this.write('', arguments);
	},
	info: function() {
		this.write('info', arguments);
	},
	warn: function() {
		this.write('warning', arguments);
	},
	error: function() {
		this.write('error', arguments);
	}
};
