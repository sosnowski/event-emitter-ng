module.exports = function (emitter, eventName) {
	var eventData = emitter._events[eventName] || {};
	return Object.create(eventObjProto, {
		isBubbling: {
			writable: false,
			value: eventData.bubbling || false
		},
		isCancelable: {
			writable: false,
			value: eventData.cancelable === false ? false : true
		},
		cancelled: {
			writable: true,
			value: false
		},
		stopped: {
			writable: true,
			value: false
		},
		name: {
			writable: false,
			value: eventName
		},
		target: {
			writable: false,
			value: emitter
		}
	});
};

eventObjProto = {
	cancel: function () {
		this.cancelled = true;
	},
	stopPropagation: function () {
		this.stopped = true;
	}
};