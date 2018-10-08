const assert = require('assert');
const sinon = require('sinon');
const catchie = require('../src/index')();

describe('Repeater module tests', () => {
  before(() => {
    this.maxRetry = process.env.CATCHIE_MAX_RETRY;
  });

  after(() => {
    process.env.CATCHIE_MAX_RETRY = this.maxRetry;
  });

  it('Should retry the function on error', (done) => {
    let toThrow = true;
    const functionToRepeat = () => {
      if (toThrow) {
        toThrow = false;
        throw new Error();
      }
    };
    const spy = sinon.spy(functionToRepeat);
    catchie.retry(spy);
    assert.equal(spy.callCount, catchie.callCount);
    done();
  });

  it('Should not enter the infinite loop when the function throws error', (done) => {
    const spy = sinon.spy(sinon.stub().throws());
    // try,catch -> for test not to fail due to a 2nd time an error is thrown.
    try {
      catchie.retry(spy);
    } catch (e) {
      assert(e instanceof Error);
      assert.equal(spy.callCount, catchie.callCount);
      assert(spy.threw());
      done();
    }
  });

  it('Should be able to retry n times', (done) => {
    const spy = sinon.spy(sinon.stub().throws());
    try {
      catchie.retry(spy, 4);
    } catch (e) {
      assert(e instanceof Error);
    }
    // 1 call + 4 retrys
    assert.equal(spy.callCount, catchie.callCount);
    assert(spy.threw());
    done();
  });

  it('Should be able to retry n times [arrow function]', (done) => {
    const spy = sinon.spy(() => { throw new Error(); });
    try {
      catchie.retry(spy, 4);
    } catch (e) {
      assert(e instanceof Error);
    }
    // 1 call + 4 retrys
    assert.equal(spy.callCount, catchie.callCount);
    assert(spy.threw());
    done();
  });

  it('Should not loose args passed to the function during retrys [no promise]', (done) => {
    let toThrow = true;
    const functionToRepeat = (arg1, arg2) => {
      if (toThrow) {
        toThrow = false;
        throw new Error();
      }
      assert.equal(arg1, 'Hello');
      assert.equal(arg2, 'World');
      return arg1 + arg2;
    };
    const spy = sinon.spy(functionToRepeat.bind(this, 'Hello', 'World'));
    const result = catchie.retry(spy);
    assert.equal(spy.callCount, catchie.callCount);
    assert.equal(result, 'HelloWorld');
    done();
  });

  it('Should not loose args passed to the function during retrys [no promise] [arrow function]', (done) => {
    let toThrow = true;
    const functionToRepeat = (arg1, arg2) => {
      if (toThrow) {
        toThrow = false;
        throw new Error();
      }
      assert.equal(arg1, 'Hello');
      assert.equal(arg2, 'World');
      return arg1 + arg2;
    };
    const spy = sinon.spy(functionToRepeat.bind(this, 'Hello', 'World'));
    const result = catchie.retry(spy);
    assert.equal(spy.callCount, catchie.callCount);
    assert.equal(result, 'HelloWorld');
    done();
  });

  it('Should not loose args passed to the function during retrys [promise]', () => {
    let toThrow = true;
    const functionToRepeat = (arg1, arg2) => (new Promise((resolve, reject) => {
      if (toThrow) {
        toThrow = false;
        reject();
      }
      assert.equal(arg1, 'Hello');
      assert.equal(arg2, 'World');
      resolve(arg1 + arg2);
    }));
    const spy = sinon.spy(functionToRepeat.bind(this, 'Hello', 'World'));
    return catchie.retry(spy).then((result) => {
      assert.equal(spy.callCount, catchie.callCount);
      assert.equal(result, 'HelloWorld');
    });
  });

  it('Should not loose args passed to the function during retrys [promise] [arrow function]', () => {
    let toThrow = true;
    const functionToRepeat = (arg1, arg2) => (new Promise((resolve, reject) => {
      if (toThrow) {
        toThrow = false;
        reject();
      }
      assert.equal(arg1, 'Hello');
      assert.equal(arg2, 'World');
      resolve(arg1 + arg2);
    }));
    const spy = sinon.spy(functionToRepeat.bind(this, 'Hello', 'World'));
    return catchie.retry(spy).then((result) => {
      assert.equal(spy.callCount, catchie.callCount);
      assert.equal(result, 'HelloWorld');
    });
  });

  it('Should propagate rejection after retries cap reached', () => {
    const spy = sinon.spy(sinon.stub().returns(Promise.reject(new Error('Promise rejected'))));
    return catchie.retry(spy, 5).catch((e) => {
      assert(e instanceof Error);
      assert.equal(e, 'Error: Error: Promise rejected');
      assert.equal(spy.callCount, catchie.callCount);
    });
  });

  it('Should fail when function result is being passed [no-promise]', (done) => {
    const functionStub = sinon.stub().returns('Hello world');
    try {
      catchie.retry(functionStub());
    } catch (e) {
      assert.equal(e.message, 'Wrong function type');
      done();
    }
  });

  it('Should fail when function result is being passed [no-promise]', (done) => {
    const functionStub = sinon.stub().returns(Promise.resolve('Hello world'));
    try {
      catchie.retry(functionStub());
    } catch (e) {
      assert.equal(e.message, 'Wrong function type');
      done();
    }
  });

  it('Should fallback to default retry count when undefined', (done) => {
    const spy = sinon.spy(sinon.stub().throws());
    try {
      catchie.retry(spy, undefined);
    } catch (e) {
      assert(e instanceof Error);
      assert.equal(spy.callCount, catchie.callCount);
      done();
    }
  });

  it('Should depend on the env var', (done) => {
    process.env.CATCHIE_MAX_RETRY = 10;
    const spy = sinon.spy(sinon.stub().throws());
    try {
      catchie.retry(spy);
    } catch (e) {
      assert(e instanceof Error);
      // one original call + 10 times retried
      assert.equal(spy.callCount, catchie.callCount);
      done();
    }
  });

  it('Should fallback to default if passed null or empty string', (done) => {
    const spy = sinon.spy(sinon.stub().throws());
    try {
      catchie.retry(spy, null);
    } catch (e) {
      assert(e instanceof Error);
      assert.equal(spy.callCount, catchie.callCount);
      done();
    }
  });

  it('Should fallback to default if passed null or empty string', (done) => {
    const spy = sinon.spy(sinon.stub().throws());
    try {
      catchie.retry(spy, '');
    } catch (e) {
      assert(e instanceof Error);
      assert.equal(spy.callCount, catchie.callCount);
      done();
    }
  });

  it('Should call function only once if 0 is passed', (done) => {
    const spy = sinon.spy(sinon.stub().throws());
    try {
      catchie.retry(spy, 0);
    } catch (e) {
      assert(e instanceof Error);
      assert.equal(spy.callCount, catchie.callCount);
      done();
    }
  });

  it('should not loose context [no promise]', (done) => {
    const spy = sinon.spy(sinon.stub().throws());
    setTimeout(() => {
      try {
        catchie.retry(spy, 5);
      } catch (e) {
        assert(e instanceof Error);
        assert.equal(spy.callCount, catchie.callCount);
        done();
      }
    }, 250);
  });

  it('should not loose context [promise] [rejected]', (done) => {
    const spy = sinon.spy(sinon.stub().returns(Promise.reject()));
    const badFunction = () => (new Promise((resolve) => {
      setTimeout(() => resolve(spy()), 250);
    }));
    catchie.retry(badFunction, 5)
      .catch((e) => {
        assert(e instanceof Error);
        assert.equal(spy.callCount, catchie.callCount);
        done();
      });
  });

  it('should not loose context [promise] [resolved]', (done) => {
    const spy = sinon.spy(sinon.stub().returns(Promise.resolve(15)));
    const badFunction = () => (new Promise((resolve) => {
      setTimeout(() => resolve(spy()), 250);
    }));
    catchie.retry(badFunction, 5)
      .then((val) => {
        assert.equal(val, 15);
        assert.equal(spy.callCount, catchie.callCount);
        done();
      });
  });
});
