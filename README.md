## Catchie
[![CircleCI](https://circleci.com/gh/dial-once/node-catchie.svg?style=svg)](https://circleci.com/gh/dial-once/node-catchie)

Repeats the provided function (sync and async) n times if an error occurs during its execution.

```
npm i -S catchie
```

## Config

### Max Retry
You can set the ``CATCHIE_MAX_RETRY`` env variable to set the cap amount of retries for ``Catchie``

### Custom Logger
You can set your own logger during the module initialization:
```js
const winston = require('winston');
const catchie = require('catchie')(new winston.Logger());
```
By default, a __console__ will be used as a logger

### Silence
You can also silence the module and not let it log info about retries if you pass the boolean value:
```js
// 2nd parameter is silence { boolean }
const catchie = require('catchie')(new winston.Logger(), true); 
```

## Usage

### Sync
Provide a function and amount of retries. If the function throws error, it will be repeated 10 times

If after 10 retries it throws again, the Error will pop out of the function and will not be consumed by catchie.

__That is why you may want to wrap it in try { } catch { }__
```js
const catchie = require('catchie')();
catchie.retry(func, 10);
```

### Async
Catchie can also handle a function, returning Promise. If the promise gets rejected, it will be repeated given amount of times

If after 5 retries it throws again, the Error will pop out of the function and will not be consumed by catchie.
```js
catchie.retry(func, 5)
.then((result) => {
  // logic
})
.catch((e) => {});
```
## Results
You can see the results of catchie's work on the last function if you use the following properties of module's instance:

* ``successCount`` - amount of successful function executions
* ``failureCount`` - amount of unsuccessful function executions
* ``callCount`` - sum of successful and unsuccessful executions

## Errors
* @throws if any other type of item but ``function`` was passed into a function

* @throws if after given ``n`` times of function retry, it ends up with an error
