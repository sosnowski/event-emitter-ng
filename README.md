#event-emitter-ng
================

Advanced JavaScript event emitter, allows bubbling and namespaced events

##Basic API

###Creating an instance

```javascript
var ee = new EventEmitter();
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

You can pass additional arguments to listeners.

```javascript
ee.on('eventName', function (arg1, arg2, arg3) {
  
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

tbd

###Bubbling

tbd

###Canceling events

tbd

###Stopping propagation

tbd
