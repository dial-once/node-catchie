const assert = require('assert');
const sinon = require('sinon');
const catchie = require('../src/index');

describe('Catchie module', () => {
  it('should use default logger if not provided', () => {
    const instance = catchie();
    assert.notEqual(instance.logger, undefined);
    assert.deepEqual(instance.logger, console);
  });

  it('should fallback to default logger if null', () => {
    const instance = catchie(null);
    assert.notEqual(instance.logger, undefined);
    assert.deepEqual(instance.logger, console);
  });

  it('should use given logger if provided', () => {
    const logger = sinon.stub();
    const instance = catchie(logger);
    assert.notEqual(instance.logger, undefined);
    assert.deepEqual(instance.logger, logger);
  });
});
