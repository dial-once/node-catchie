let defaultLogger = console;

/**
  @class Catchie
  Consume errors and retry the function execution given times

  Supported environment variables:
  CATCHIE_MAX_RETRY - cap amount of function retry
**/
class Catchie {
  /**
    @constructor
    Construct instance of the module
    @param logger {Object} - logger instnace
    @param silent {boolean} - log or not the info about retries
  **/
  constructor(logger, silent) {
    this.logger = logger || defaultLogger;
    this.successCount = 0;
    this.failCount = 0;
    this.silent = silent;
  }

  /**
    @function clear
    Reset the values of successCount and failureCount
  **/
  clear() {
    this.successCount = 0;
    this.failureCount = 0;
  }

  /**
    @function callCount
    Get the total amount of given function calls
    @return {number} - total amount of function calls
  **/
  get callCount() {
    return this.successCount + this.failureCount;
  }

  /**
    @function retry
    Execute the function given amount of times
    @param fn { Function } - a function returning value / Promise
    @retryCount { string|number } - amount of times to repeat a function on error
    @return
      { any } - if function is sync
      { Promise } - if function is async
    @throws if after the retryCount times of function execution the function still ended up with an error
    @throws if fn param is not a function
  **/
  retry(fn, retryCount = 1) {
    this.clear();
    let timesToRetry = parseInt(retryCount || process.env.CATCHIE_MAX_RETRY, 10);

    if (isNaN(timesToRetry)) {
      timesToRetry = 0;
    }

    if (typeof fn !== 'function') {
      throw new Error('Wrong function type');
    }

    let timesRetried = 0;

    const loopCheck = (e, args) => {
      if (timesRetried >= timesToRetry) {
        throw new Error(e);
      }

      timesRetried += 1;
      if (!this.silent) {
        this.logger.info(`Retrying function due to ${e} error`);
      }
      return repeatable(...args); // eslint-disable-line
    };

    const repeatable = () => {
      // in case the function does not return a promise -> a simple try catch will work
      try {
        // if it throws, it will go to catch after execution
        const value = fn(...arguments);
        if (value instanceof Promise) {
          // for promises a plain-old-catch does not work
          return Promise.resolve()
          .then(() => value)
          .then((result) => {
            this.successCount ++;
            return result;
          })
          .catch((e) => {
            this.failureCount ++;
            return loopCheck(e, arguments);
          });
        }
        // if did not throw -> return either a Promise or an actual value
        this.successCount ++;
        return value;
      } catch (e) {
        this.failureCount ++;
        return loopCheck(e, arguments);
      }
    };

    return repeatable();
  }
}

/**
  @function
  @param loggerInstance {object} - instance of a logger to use
  @param silet {boolean} - log or not log the info about retries
  @return {Object} - new instance of the module
**/
module.exports = (loggerInstance, silent = false) => {
  if (![null, undefined].includes(loggerInstance)) {
    defaultLogger = loggerInstance;
  }
  return new Catchie(loggerInstance, silent);
};
