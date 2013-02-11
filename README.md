#event-emitter-ng
================

Advanced JavaScript event emitter, allows bubbling and namespaced events

##Basic API

###Creating an instance

```javascript
var ee = new EventEmitter();
var ee2 = EventEmitter(); //will also work without "new" operator
```

###Adding listeners

```javascript
ee.addEventListener('eventName', listener, [scope]);
ee.on(); //alias for addEventListener
```
 - eventName - the name of the event that you want to listen
 - listener - function that will be executed when the event is emitted
 - scope - optional, the scope for the listener

You can add as many listeners as you want

###Removing listeners

```javascript
ee.removeEventListener('eventName'); // will remove all listeners for "eventName" event
ee.removeEventListener('eventName', listener); //will remove the single listener that is attached to "eventName"
ee.off(); //alias for removeEventListener
```

###Emitting events

```javascript
ee.emit('eventName');
```

You can pass additional arguments to listeners. Every listener receives event object as a first argument.

```javascript
ee.on('eventName', function (eventObject, arg1, arg2, arg3) {
  
});

//emit event with additional arguments
ee.emit('eventName', "arg1", "arg2", "arg3");
```

##Advanced API

###Special ":all" event

Listeners added to ":all" event will be executed when any other event is emitted.

```javascript
ee.on(':all', function () {
  console.log("I'm executed!");
});

ee.emit('test'); //I'm executed
ee.emit('smth'); //I'm executed
```

###Namespaces

You can use namespaced events names for more complex solutions. Simply use namespaced event name when adding event listener.
Namespaces are separated by "." character.

```javascript
ee.on('test.smth', function () {
  //...
});
ee.on('test.smth.another', function () {
  //...
});
```

When event is emitted, all it's listeners are executed. Then all listeners attached to its sub-events are launched.

```javascript
ee.on('test', function () {
  console.log('test');
});
ee.on('test.smth', function () {
  console.log('smth');
});
ee.on('test.smth.another', function () {
  console.log('another');
});

ee.emit('test'); //output: test smth another
ee.emit('test.smth'); //output: smth another
ee.emit('test.smth.another'); //output: another
```

###Events declaration

By default all events are cancelable. Also, default events are not propagating (bubbling) to parent emitter.
Behavior of specified events can be changed by passing proper config object to the constructor.

```javascript
var ee = new EventEmitter({
 eventName: { //event "eventName" will be cancelable and bubbling
  cancelable: true,
  bubbling: true
 },
 eventName2: { //event will not be cancelable and wont propagate to parent emitter
  cancelable: false,
  bubbling: false
 }
});
```

###Bubbling

When event is declared as "bubbling" it will be propagated to the parent emitter, after current emitter executes all its listeners.

```javascript
var ee = new EventEmitter({
  'test': {
     bubbling: true,
     cancelable: true
  }
}), parent = new EventEmitter();

ee.setParentEmitter(parent); //parent emitter has to be specified

parent.on('test', function () {
 console.log("I've bubbled!");
});

ee.on('test', function () {
 console.log("I will be first");
});

ee.emit('test');
```

###Canceling events

Events can be cancelled (unless it is set as non cancelable) using "cancel" method of event object that is passed to the listener

```javascript
var ee = new EventEmitter(); //events are cancelable by default so there is no need to pass configuration
ee.on('test', function (eObj) {
 console.log(1);
});
ee.on('test', function (eObj) {
 console.log(2);
 eObj.cancel();
});
ee.on('test', function (eObj) {
 console.log(3);
});
ee.emit('test'); // will return: 1 2
```
Same effect will be achieved if listener returns false.
Cancelled event will not bubble.

###Stopping propagation

Also propagation of an event can be stopped. Stopped event will not bubble to parent emitter.

```javascript
var ee = new EventEmitter({
  'test': {
     bubbling: true,
     cancelable: true
  }
}), parent = new EventEmitter();

ee.setParentEmitter(parent); //parent emitter has to be specified

parent.on('test', function () {
 console.log("2");
});

ee.on('test', function (eObj) {
 console.log("1");
 eObj.stopPropagation();
});

ee.emit('test'); //will display: 1
```

##EventObject

EventObject is a simple object passed as a first argument to every listener.
It provides methods for controlling event behavior and some usefull data about emitted event.

###Methods:
 - cancel() - cancels event, no more listeners will be executed
 - stopPropagation() - stops propagation of an event, event will not bubble to parent emitter

###Attributes:
 - isBubbling - flag that indicates if event is configured as bubbling
 - isCancelable - flag that indicates if event is configured as cancelable
 - cancelled - true if event is cancelled (f.e. by cancel() method)
 - stopped - true if event is stopped by stopPropagation() method
 - name - name of emitted event
 - target - the original emitter that has emitted this event
