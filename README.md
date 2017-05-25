## Catchie

Repeats the provided function (sync and async) n times if an error occurs during its execution.


### Config
You can set the ``MAX_REPEAT`` env variable to let ``Catchie`` know how many times you want to repeat the function.

You can set your own logger during the module initialization:
```js
const winston = require('winston');
const catchie = require('catchie')(new winston.Logger()); // default logger is console
```

### Usage
```js
const catchie = require('catchie')();

//sync

/**
  Provide a function and amount of retries
  If the function throws error, it will be repeated 10 times
  If after 10 repeats it throws again, the Error will pop out of the function
  and will not be consumed by catchie. That is why you may want to wrap it in try { } catch { }
**/
catchie.retry(func, 10);

// async

/**
  Provide a function returning promise
  If the promise gets rejected, it will be repeated 5 times
  If after 5 repeats it throws again, the Error will pop out of the function
  and will not be consumed by catchie
**/
catchie.retry(func, 5)
.then((result) => {
  // logic
})
.catch((e) => {});
```

You can see the results of function execution if you use the following properties:
```js
catchie.successCount; // amount of successful function execution
catchie.failureCount; // amount of unsuccessful function execution
catchie.callCount; // sum of successful and unsuccessful execution
```
