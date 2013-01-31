var expect       = require('expect.js');
	EventEmitter = require('../index');

describe("Basics", function () {
	describe("EventEmitter creation", function () {
		var ee = new EventEmitter(),
			ee2 = new EventEmitter();
		it("Should created using new operator", function () {
			expect(ee).to.be.ok();
			expect(ee).to.be.an('object');
			expect(ee).not.to.be.equal(ee2);
		});
		it("Should have unique listeners collection and the same methods", function () {
			expect(ee).to.have.property('_listeners');
			expect(ee._listeners).not.to.be.equal(ee2._listeners);
			expect(ee.addEventListener).to.be.equal(ee2.addEventListener);
		});
	});

	describe("Adding and removing listeners", function () {
		var ee = new EventEmitter(), listener = function () {};

		describe("addEventListener", function () {
			it("Add listeners", function () {
				ee.addEventListener('test', listener);
				ee.addEventListener('test', function () {});
				expect(ee.getListeners('test')).to.have.length(2);
			});

			it("Should add another listener", function () {
				ee.on('test2', function () {});
				expect(ee.getListeners('test2')).to.have.length(1);
			});
		});

		describe("removeEventListener", function () {
			it("Should remove one listener", function () {
				var list;
				ee.removeEventListener('test', listener);
				list = ee.getListeners('test');
				expect(list).to.have.length(1);
				for (var i = 0; i < list.length; i++) {
					expect(list[i].listener).not.to.be.equal(listener);
				}
			});

			it("Should remove all listeners", function () {
				ee.off('test2');
				expect(ee.getListeners('test2')).to.have.length(0);
			});

			it("Should try to remove not existing listener", function () {
				var fn = function () {
					ee.off('not-existing-event', function () {

					});
				};
				expect(fn).to.not.throwException();
				fn();
			});
		});

		describe("Limited number of calls", function () {
			var ee;
			beforeEach(function () {
				ee = new EventEmitter();
			});

			it("Should add one time listener", function () {
				ee.once('test', function () {});
				expect(ee.getListeners('test')).to.have.length(1);
				expect(ee.getListeners('test')[0]).to.have.property('once', true);
			});

			it("Should execute added listener only once", function () {
				var i = 0;
				ee.once('test', function () {
					i++;
				});
				ee.on('test', function () {
					i++;
				});
				ee.emit('test');
				expect(i).to.be.equal(2);
				expect(ee.getListeners('test')).to.have.length(1);
				ee.emit('test');
				expect(i).to.be.equal(3);
			});
		});
	});

	describe("Emmiting events", function () {
		var ee;
		beforeEach(function () {
			ee = new EventEmitter();
		});
		it("Should execute event listeners", function () {
			var i = 0;
			ee.addEventListener('test', function () {
				expect(i).to.be.equal(0);
				i++;
			});
			ee.addEventListener('test', function () {
				expect(i).to.be.equal(1);
				i++;
			});

			ee.emit('test');
			expect(i).to.be.equal(2);
		});

		it("Should not change the context of a listener if no context is provided", function () {
			var global = Function('return this;')(), custom = {
				foo: "bar"
			};
			ee.on('test', function () {
				expect(this).to.be.equal(global);
			});
			ee.on('test', function () {
				expect(this).to.be.equal(custom);
			}.bind(custom));
			ee.emit('test');
		});

		it("Should execute listener with a proper context", function () {
			var obj = {
				foo: "bar"
			};
			ee.addEventListener('test', function () {
				expect(this).to.have.property('foo', 'bar');
				expect(this).to.be.equal(obj);
			}, obj);
			ee.emit('test');
		});

		it("Should execute listener with proper arguments", function () {
			var argObj = {
				foo: "bar"
			};
			ee.addEventListener('test', function (eObj, arg1, arg2, arg3) {
				expect(arg1).to.be.equal(1234);
				expect(arg2).to.be.equal("bar");
				expect(arg3).to.be.equal(argObj);
				expect(arguments).to.have.length(4);
			});
			ee.emit('test', 1234, "bar", argObj);
		});
	});
});
