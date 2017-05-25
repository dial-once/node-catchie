let defaultLogger = console;

class Catchie {
  constructor(logger) {
    this.logger = [undefined, null].includes(logger) ? defaultLogger : logger;
    this.successCount = 0;
    this.failCount = 0;
  }

  clear() {
    this.successCount = 0;
    this.failureCount = 0;
  }

  get callCount() {
    return this.successCount + this.failureCount;
  }

  retry(fn, retryCount = 1) {
    this.clear();
    let timesToRetry = parseInt(retryCount, 10);

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
      this.logger.info(`Retrying function due to ${e} error`);
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


module.exports = (loggerInstance) => {
  if (![null, undefined].includes(loggerInstance)) {
    defaultLogger = loggerInstance;
  }
  return new Catchie(loggerInstance);
};
