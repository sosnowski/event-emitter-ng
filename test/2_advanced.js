var expect       = require('expect.js'),
	EventEmitter = require('../index');

describe("Advanced", function () {

	describe("Declaring events", function () {
		var ee;
		beforeEach(function () {
			ee = new EventEmitter({
				test: {
					bubbling: true,
					cancelable: true
				}
			});
		});

		it("Should declare events via constructor", function () {
			expect(ee._events).to.be.ok();
			expect(ee._events).to.be.an('object');
			expect(ee._events).to.have.keys('test');
		});

		it("Should execute listener with proper event object", function () {
			var i = 0;
			ee.on('test', function (eObj) {
				i++;
				expect(eObj).to.be.an('object');
				expect(eObj).to.have.property('isBubbling', true);
				expect(eObj).to.have.property('isCancelable', true);
				expect(eObj).to.have.property('cancelled', false);
				expect(eObj).to.have.property('stopped', false);

				expect(eObj.stopPropagation).to.be.a('function');
				expect(eObj.cancel).to.be.a('function');
			});
			ee.emit('test');
			expect(i).to.be.equal(1);
		});

		it("Should execute listener with default event object", function () {
			ee.on('smth', function (eObj) {
				expect(eObj).to.have.property('isBubbling', false);
				expect(eObj).to.have.property('isCancelable', true);
			});
		});
	});

	describe("Bubbling", function () {
		var ee, parent;
		beforeEach(function () {
			parent = new EventEmitter();
			ee = new EventEmitter({
				test: {
					bubbling: true
				}
			});
			ee.setParentEmitter(parent);
		});

		it("Should return parent emitter", function () {
			expect(ee.getParentEmitter()).to.be.equal(parent);
		});

		it("Should fire listener through bubbling", function () {
			var i = 0;
			parent.on('test', function () {
				expect(i).to.be.equal(1);
				i++;
			});
			ee.on('test', function () {
				expect(i).to.be.equal(0);
				i++;
			});
			ee.emit('test');
			expect(i).to.be.equal(2);
		});

		it("Should set the proper event target", function () {
			parent.on('test', function (eObj) {
				expect(eObj.target).to.be.equal(ee);
			});
			ee.on('test', function (eObj) {
				expect(eObj.target).to.be.equal(ee);
			});
			ee.emit('test');
		});

		it("Should bubble only up", function () {
			var grandparent = new EventEmitter(), i = 0;
			parent.setParentEmitter(grandparent);
			parent.declareEvent('test', {
				bubbling: true
			});

			ee.on('test', function () {
				i++;
			});
			parent.on('test', function () {
				expect(i).to.be.equal(0);
				i++;
			});
			grandparent.on('test', function () {
				expect(i).to.be.equal(1);
				i++;
			});
			parent.emit('test');
			expect(i).to.be.equal(2);
		});
	});

	describe("Cancelling and stopping propagation", function () {
		var ee;
		beforeEach(function () {
			ee = new EventEmitter({
				test: {
					cancelable: true,
					bubbling: true
				}
			});
		});

		it("Should stop executing events when eObj.cancel() is called", function () {
			var i = 0;
			ee.on('test', function (eObj) {
				expect(i).to.be.equal(0);
				i++;
				eObj.cancel();
			});
			ee.on('test', function () {
				i++;
			});
			ee.emit('test');
			expect(i).to.be.equal(1);
		});

		it("Should stop executing events when false is returned", function () {
			var i = 0;
			ee.on('test', function (eObj) {
				expect(i).to.be.equal(0);
				i++;
				return false;
			});
			ee.on('test', function () {
				i++;
			});
			ee.emit('test');
			expect(i).to.be.equal(1);
		});

		it("Should not bubble cancelled event", function () {
			var parent = new EventEmitter(), i = 0;
			ee.setParentEmitter(parent);

			parent.on('test', function () {
				i++;
			});
			ee.on('test', function () {
				return false;
			});
			ee.emit('test');
			expect(i).to.be.equal(0);
		});

		it("Should not bubble stopped event", function () {
			var parent = new EventEmitter(), i = 0;
			ee.setParentEmitter(parent);

			parent.on('test', function () {
				i++;
			});

			ee.on('test', function (eObj) {
				expect(i).to.be.equal(0);
				i++;
				eObj.stopPropagation();
			});
			ee.on('test', function () {
				expect(i).to.be.equal(1);
				i++;
			});
			ee.emit('test');

			expect(i).to.be.equal(2);
		});

	});

	describe("Namespaces", function () {
		describe("Special event :all", function () {
			var ee;
			beforeEach(function () {
				ee = new EventEmitter();
			});
			it("Should return listener for all events", function () {
				var callback = function () {};
				ee.on(':all', callback);

				expect(ee.getListeners('test')[0].fn).to.be.equal(callback);
				expect(ee.getListeners('test2')[0].fn).to.be.equal(callback);
				expect(ee.getListeners('test3')[0].fn).to.be.equal(callback);
			});

			it("Should execute :all listeners for every event", function () {
				var i = 0;
				ee.on(':all', function () {
					i++;
				});
				ee.emit('test');
				ee.emit('test2');
				ee.emit('test3');
				expect(i).to.be.equal(3);
			});

			it("Should execute :all listeners after normal listeners", function () {
				var i = 0;
				ee.on(':all', function () {
					expect(i).to.be.equal(2);
					i++;
				});
				ee.on('test', function () {
					i++;
				});
				ee.on('test', function () {
					i++;
				});
				ee.emit('test');
				expect(i).to.be.equal(3);
			});
		});

		describe("Namespaced events", function () {
			var ee;
			beforeEach(function () {
				ee = new EventEmitter();
			});

			it("Should execute simple namespaced events", function () {
				var i = 0;
				ee.on('test.name', function () {
					i++;
				});
				ee.on('test.name2', function () {
					i++;
				});
				ee.emit('test');
				expect(i).to.be.equal(2);
			});
			
			it("Should remove one nested listener", function () {
				var i = 0, toRemove = function () { i++; };
				ee.on('test', function () {
					i++;
				});
				ee.on('test.name', function () {
					i++;
				});
				ee.on('test.name', toRemove);
				ee.emit('test');
				expect(i).to.be.equal(3);
				i = 0;
				ee.off('test.name', toRemove);
				ee.emit('test');
				expect(i).to.be.equal(2);
			});

			it("Should remove namespaced listeners and its children", function () {
				var i = 0, callback = function () { i++; };
				ee.on('test', callback);
				ee.on('test.name', callback);
				ee.on('test.name', callback);
				ee.on('test.name.sub', callback);
				ee.emit('test');
				expect(i).to.be.equal(4);

				i = 0;
				ee.off('test.name');
				ee.emit('test');
				expect(i).to.be.equal(1);
			});

			it("Should execute deeply nested namespaces", function () {
				var i = 0;
				ee.on('test', function () {
					i++;
				});
				ee.on('test.name', function () {
					i++;
				});
				ee.on('test.name2', function () {
					i++;
				});
				ee.on('test.name.surname', function () {
					i++;
				});
				ee.on('test.name.surname.smth', function () {
					i++;
				});
				ee.emit('test');
				expect(i).to.be.equal(5);
			});
			it("Should execute not nested listeners first", function () {
				var  i = 0;
				ee.on('test.name.surname', function () {
					expect(i).to.be.equal(4);
					i++;
				});
				ee.on('test.name', function () {
					expect(i).to.be.equal(2);
					i++;
				});
				ee.on('test.name', function () {
					expect(i).to.be.equal(3);
					i++;
				});
				ee.on('test', function () {
					expect(i).to.be.equal(0);
					i++;
				});
				ee.on('test', function () {
					expect(i).to.be.equal(1);
					i++;
				});
				ee.emit('test');
				expect(i).to.be.equal(5);
			});
			it("Should not execute parent events from the same namespace", function () {
				var i = 0, callback = function () { i++; };
				ee.on('test', callback);
				ee.on('test.child1', callback);
				ee.on('test.child1.child2', callback);
				ee.on('test.child1.child2.child3', callback);
				ee.on('test.child1.child2.child3.child4', callback);
				ee.emit('test');
				expect(i).to.be.equal(5);
				i = 0;
				ee.emit('test.child1');
				expect(i).to.be.equal(4);
				i = 0;
				ee.emit('test.child1.child2.child3');
				expect(i).to.be.equal(2);
			});
		});
	});
});