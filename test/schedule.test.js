'use strict';

var lolex = require('lolex');
var assert = require('proclaim');
var sinon = require('sinon');
var Schedule = require('../lib/schedule');

describe('Schedule', function() {
  var clock;
  var schedule;

  beforeEach(function() {
    clock = lolex.createClock(0);
    Schedule.setClock(clock);
    schedule = new Schedule();
  });

  afterEach(function() {
    Schedule.resetClock();
  });

  describe('run', function() {
    it('should call task after timeout', function() {
      var timeout = 500;
      var spyFn = sinon.spy();
      schedule.run(spyFn, timeout);
      clock.tick(timeout);
      assert(spyFn.calledOnce);
    });

    it('should call task ASAP after timeout even after long duration', function() {
      var timeout = 500;
      var spyFn = sinon.spy();
      schedule.run(spyFn, timeout, Schedule.Modes.ASAP);
      clock.setSystemTime(timeout * 2);
      clock.tick(timeout);
      assert(spyFn.calledOnce);
    });

    it('should not call ABANDON task if past duration factor', function() {
      var timeout = 500;
      var spyFn = sinon.spy();
      schedule.run(spyFn, timeout, Schedule.Modes.ABANDON);
      // Fast forwards time but doesnt trigger timers
      clock.setSystemTime(timeout * 2);
      // Trigger timers here
      clock.tick(timeout);
      assert(spyFn.notCalled);
      clock.tick(timeout);
      // Ensure task is not rescheduled
      assert(spyFn.notCalled);
    });

    it('should call ABANDON task if running on time', function() {
      var timeout = 500;
      var spyFn = sinon.spy();
      schedule.run(spyFn, timeout, Schedule.Modes.ABANDON);

      clock.tick(timeout);
      assert(spyFn.calledOnce);
    });

    it('should RESCHEDULE and call task if skipped', function() {
      var timeout = 500;
      var spyFn = sinon.spy();
      schedule.run(spyFn, timeout, Schedule.Modes.RESCHEDULE);
      // Fast forwards time but doesnt trigger timers
      clock.setSystemTime(timeout * 2);
      // Trigger timers here
      clock.tick(timeout);
      assert(spyFn.notCalled);
      clock.tick(timeout);
      assert(spyFn.calledOnce);
    });
  });
});
