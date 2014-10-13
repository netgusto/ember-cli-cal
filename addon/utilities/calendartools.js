
/* jslint node:true, shadow:true, unused:false */

/* global _, moment */
"use strict";
import Ember from 'ember';

/*
 * The layout methods
 */
var DisplayedEvent, Range, getEventsByWeek, getEventsVisibleInPeriod, getLayoutsByWeek, layoutEvents, lib, splitTimeInWeeks, visualizeLayout;

layoutEvents = function(events) {
  var de, e, lane, laneEvents, remainingEvents, result, sortFunc, _i, _j, _len, _len1;
  if (!(events instanceof Array)) {
    return [];
  }
  events.sort(function(a, b) {
    var aLength, bLength;
    aLength = a.getLength();
    bLength = b.getLength();
    if (aLength === bLength) {
      if (a.start.isSame(b.start)) {
        if (a.label > b.label) {
          return 1;
        } else {
          return -1;
        }
      } else {
        if (a.start.isAfter(b.start)) {
          return 1;
        } else {
          return -1;
        }
      }
    } else {
      if (aLength < bLength) {
        return 1;
      } else {
        return -1;
      }
    }
  });
  remainingEvents = events.slice(0);
  result = [];
  sortFunc = function(a, b) {
    if (a.start.isAfter(b.start)) {
      return 1;
    } else {
      return -1;
    }
  };
  lane = 0;
  while (remainingEvents.length > 0) {
    laneEvents = [];
    for (_i = 0, _len = remainingEvents.length; _i < _len; _i++) {
      e = remainingEvents[_i];
      if (e.isCompatibleWith(laneEvents)) {
        laneEvents.push(e);
      }
    }
    for (_j = 0, _len1 = laneEvents.length; _j < _len1; _j++) {
      de = laneEvents[_j];
      remainingEvents = _.without(remainingEvents, de);
    }
    laneEvents.sort(sortFunc);
    result.push({
      lane: lane,
      events: laneEvents
    });
    ++lane;
  }
  return result;
};

splitTimeInWeeks = function(startMonday, endSunday) {
  var weekend, weeks, weekstart;
  weeks = [];
  weekstart = startMonday.clone();
  weekend = startMonday.clone().add(7, 'days');
  while (weekstart.isBefore(endSunday)) {
    weeks.push({
      start: weekstart.clone(),
      end: weekend.clone()
    });
    weekstart.add('7', 'days');
    weekend.add('7', 'days');
  }
  return weeks;
};

getEventsVisibleInPeriod = function(events, start, end) {
  var event, visibleevents, _i, _len;
  visibleevents = [];
  for (_i = 0, _len = events.length; _i < _len; _i++) {
    event = events[_i];
    if (event.isVisible(start, end)) {
      visibleevents.push(event);
    }
  }
  return visibleevents;
};

getEventsByWeek = function(events, startMonday, endSunday) {
  var periodevents, res, week, weeks, _i, _len;
  res = [];
  weeks = splitTimeInWeeks(startMonday.clone(), endSunday.clone());
  for (_i = 0, _len = weeks.length; _i < _len; _i++) {
    week = weeks[_i];
    periodevents = getEventsVisibleInPeriod(events, week['start'], week['end']);
    res.push({
      start: week.start.clone(),
      end: week.end.clone(),
      events: periodevents
    });
  }
  return res;
};

getLayoutsByWeek = function(events, startMonday, endSunday) {
  var eventsbyweek, res, week, _i, _len;
  res = [];
  eventsbyweek = getEventsByWeek(events, startMonday, endSunday);
  for (_i = 0, _len = eventsbyweek.length; _i < _len; _i++) {
    week = eventsbyweek[_i];
    res.push({
      start: week.start.clone(),
      end: week.end.clone(),
      layout: layoutEvents(week.events)
    });
  }
  return res;
};


/*
 * Testing and debugging
 * To visualize with debugLayout, use only 1 char labels
 */

visualizeLayout = function(layout, viewstart, viewend) {
  var distance, echo, evdist, event, evvisiblelength, lane, lanecursor, result, zero, _i, _j, _len, _len1, _ref;
  result = '';
  zero = function() {
    return viewstart.clone();
  };
  echo = function(msg) {
    return result += msg;
  };
  distance = function(date) {
    return date.diff(zero(), 'days');
  };
  if (layout.length === 0) {
    return '';
  }
  echo('\n');
  echo('   |1234567|' + '\n');
  for (_i = 0, _len = layout.length; _i < _len; _i++) {
    lane = layout[_i];
    lanecursor = 0;
    echo(lane.lane + ': |');
    _ref = lane.events;
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      event = _ref[_j];
      evdist = distance(event.getVisibleStart(viewstart));
      evvisiblelength = event.getVisibleLength(viewstart, viewend);
      _.times(evdist - lanecursor, echo.apply(this, ' '));
      _.times(evvisiblelength, echo.apply(this, event.label));
      lanecursor = evdist + evvisiblelength;
    }
    echo('\n');
  }
  return result;
};


/*
 * The CalendarTools.Event class
 * Represents a simple calendar event (start date, end date, label, payload)
 * Used to manipulate events; simply store your own events in the payload property
 * example: new CalendarTools.Event({ start: myEvent.getStart(), end: myEvent.getEnd(), label: myEvent.getLabel(), payload: myEvent })
 */

DisplayedEvent = (function() {
  DisplayedEvent.prototype.start = null;

  DisplayedEvent.prototype.end = null;

  DisplayedEvent.prototype.label = null;

  DisplayedEvent.prototype.payload = null;

  DisplayedEvent.prototype.active = false;

  DisplayedEvent.prototype.hover = false;

  function DisplayedEvent(hash) {
    this.start = moment(hash.start ||  null);
    this.end = moment(hash.end ||  null);
    this.label = hash.label || '?';
    this.payload = hash.payload || null;
  }

  DisplayedEvent.prototype.getLength = function() {
    return this.end.diff(this.start, 'days');
  };

  DisplayedEvent.prototype.getVisibleStart = function(viewstart) {
    if (this.start.isAfter(viewstart) || this.start.isSame(viewstart)) {
      return this.start;
    } else {
      return viewstart;
    }
  };

  DisplayedEvent.prototype.getVisibleLength = function(viewstart, viewend) {
    if (!this.isVisible(viewstart, viewend)) {
      return 0;
    }
    if (this.start.isAfter(viewstart) || this.start.isSame(viewstart)) {
      if (this.end.isBefore(viewend) || this.end.isSame(viewend)) {
        return this.getLength();
      } else {
        return viewend.diff(this.start, 'days');
      }
    } else {
      if (this.end.isBefore(viewend) || this.end.isSame(viewend)) {
        return this.end.diff(viewstart, 'days');
      } else {
        return viewend.diff(viewstart, 'days');
      }
    }
  };

  DisplayedEvent.prototype.isVisible = function(viewstart, viewend) {
    return !this.end.isBefore(viewstart) && !this.end.isSame(viewstart) && !this.start.isSame(viewend) && !this.start.isAfter(viewend);
  };

  DisplayedEvent.prototype.isCompatible = function(event) {
    var one, two;
    if (this.start.isBefore(event.start)) {
      one = this;
      two = event;
    } else {
      one = event;
      two = this;
    }
    return one.end.isBefore(two.start) || one.end.isSame(two.start);
  };

  DisplayedEvent.prototype.isCompatibleWith = function(events) {
    var event, _i, _len;
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      event = events[_i];
      if (!this.isCompatible(event)) {
        return false;
      }
    }
    return true;
  };

  DisplayedEvent.prototype.isTruncatedLeft = function(viewstart, viewend) {
    if (this.start.isBefore(viewstart) && this.end.isAfter(viewstart)) {
      return true;
    }
    return false;
  };

  DisplayedEvent.prototype.isTruncatedRight = function(viewstart, viewend) {
    if (this.end.isAfter(viewend) && this.start.isBefore(viewend)) {
      return true;
    }
    return false;
  };

  return DisplayedEvent;

})();


/*
 * The CalendarTools.Range class
 */

Range = (function() {
  Range.prototype.start = null;

  Range.prototype.end = null;

  function Range(hash) {
    this.start = moment(hash.start ||  null);
    this.end = moment(hash.end ||  null);
  }

  return Range;

})();

lib = {
  DisplayedEvent: Ember.Object.extend(DisplayedEvent.prototype),
  Range: Range,
  layoutEvents: layoutEvents,
  getLayoutsByWeek: getLayoutsByWeek,
  visualizeLayout: visualizeLayout
};

export default lib;
