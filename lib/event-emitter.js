var createEventObject = require('./helpers/event-object'),
	eventEmitterProto, EventEmitter,
	createListenersData, getAllListeners;

getAllListeners = function (listenerData) {
	var res = listenerData.listeners;
	for (var key in listenerData) {
		res = res.concat(getAllListeners(listenerData[key]));
	}
	return res;
};

createListenersData = function (parent) {
	return Object.create(null, {
		listeners: {
			enumberable: false,
			writable: false,
			value: []
		},
		_parent: {
			enumberable: false,
			writable: false,
			value: parent
		}
	});
};

module.exports = EventEmitter = function (declaredEvents) {
	var ee = Object.create(eventEmitterProto, {
		_listeners: {
			enumberable: false,
			writable: false,
			value: {}
		},
		_parentEmitter: {
			enumberable: false,
			writable: true,
			configurable: true
		},
		_events: {
			enumberable: false,
			writable: false,
			value: declaredEvents || {}
		}
	});
	return ee;
};

eventEmitterProto = {
	constructor: EventEmitter,

	setParentEmitter: function (parent) {
		this._parentEmitter = parent;
	},
	getParentEmitter: function () {
		return this._parentEmitter || null;
	},
	declareEvent: function (eventName, data) {
		this._events[eventName] = data;
	},
	getListeners: function (eventName) {
		var listeners, listData = this._getListenersData(eventName.split('.'));

		listeners = listData ? getAllListeners(listData) : [];

		if (this._listeners[':all']) {
			listeners = listeners.concat(this._listeners[':all'].listeners);
		}
		return listeners;
	},
	_getListenersData: function (eventsPath) {
		var parent = this._listeners;
		for (var i = 0; i < eventsPath.length; i++) {
			if (parent[eventsPath[i]]) {
				parent = parent[eventsPath[i]];
			} else {
				return null;
			}
		}
		return parent;
	},
	addEventListener: function (eventName, listener, scope, once) {
		var eventsPath = eventName.split('.'), parent = this._listeners, eName;
		for (var i = 0; i < eventsPath.length; i++) {
			eName = eventsPath[i];
			if (!parent[eName]) {
				parent[eName] = createListenersData(parent);
			}
			parent = parent[eName];
		}
		parent.listeners.push({
			fn: listener,
			scope: scope || undefined,
			once: once || false
		});
	},
	removeEventListener: function (eventName, listener) {
		var eventsPath = eventName.split('.'), listeners,
			listData = this._getListenersData(eventsPath);
		if (!listData) {
			return;
		}
		if (!listener) {
			listData._parent[eventsPath[eventsPath.length - 1]] = createListenersData(listData._parent);
		} else {
			for (var i = 0; i < listData.listeners.length; i++) {
				if (listData.listeners[i].fn === listener) {
					listData.listeners.splice(i, 1);
					return;
				}
			}
		}
	},
	emit: function (eventName) {
		var args = Array.prototype.slice.call(arguments, 1);
		args.unshift(createEventObject(this, eventName));

		this._processEvent(eventName, args);
	},
	_processEvent: function (eventName, args) {
		var listeners = this.getListeners(eventName), res, eObj = args[0];
		for (var i = 0; i < listeners.length; i++) {
			res = listeners[i].fn.apply(listeners[i].scope, args);
			if (listeners[i].once === true) {
				listeners.splice(i, 1);
				i--;
			}
			if (eObj.isCancelable === true && (res === false || eObj.cancelled === true)) {
				return;
			}
		}
		if (eObj.isBubbling === true && eObj.stopped !== true && this.getParentEmitter()) {
			this.getParentEmitter()._processEvent(eventName, args);
		}
	},
	on: function () {
		this.addEventListener.apply(this, arguments);
	},
	once: function (eventName, listener, scope) {
		this.addEventListener.call(this, eventName, listener, scope, true);
	},
	off: function () {
		this.removeEventListener.apply(this, arguments);
	}
};