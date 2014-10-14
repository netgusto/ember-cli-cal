
/* global moment */
import Ember from 'ember';
import CalendarTools from 'ember-cli-cal/utilities/calendartools';
var component;

component = Ember.Component.extend({
  component: null,
  events: null,
  color: null,
  textcolor: null,
  curmonth: null,
  curyear: null,
  _selectedEvent: null,
  _selectedDate: null,
  _setup: (function() {
    this.set('component', this);
    return this.displayMonthForYear(moment().month() + 1, moment().year());
  }).on('init'),
  firstdayofcurmonth: (function() {
    var pad;
    pad = function(n, width, z) {
      z = z || '0';
      n = n + '';
      if (n.length >= width) {
        return n;
      } else {
        return new Array(width - n.length + 1).join(z) + n;
      }
    };
    return moment(this.get('curyear') + '-' + pad(this.get('curmonth'), 2) + '-01T00:00:00.000Z').utc();
  }).property('curyear', 'curmonth'),
  viewstart: (function() {
    return this.get('firstdayofcurmonth').clone().isoWeekday(1);
  }).property('firstdayofcurmonth'),
  viewend: (function() {
    return this.get('firstdayofcurmonth').clone().endOf('month').isoWeekday(7).add(1, 'second').millisecond(0);
  }).property('firstdayofcurmonth'),
  title: (function() {
    return this.get('firstdayofcurmonth').format('MMMM YYYY');
  }).property('firstdayofcurmonth'),
  isPresentView: (function() {
    return this.get('curyear') === moment().year() && this.get('curmonth') === (moment().month() + 1);
  }).property('curyear', 'curmonth'),

  /*
  debugVisualization: (->
       * Debug lanes, week by week
  
      res = []
      layoutsbyweek = CalendarTools.getLayoutsByWeek(@get('events'), @get('viewstart').clone(), @get('viewend').clone())
      
      for week in layoutsbyweek
          res.push week['start'].toString() + ' => ' + week['end'].toString()
          res.push CalendarTools.visualizeLayout(week.layout, week['start'].clone(), week['end'].clone())
  
      res.join('\n')
  
  ).property 'events.@each', 'viewstart', 'viewend'
   */
  rows: (function() {
    var col, date, layoutsbyweek, rows, weekdates, weeklayout, _i, _j, _len;
    date = this.get('viewstart').clone();
    layoutsbyweek = CalendarTools.getLayoutsByWeek(this.get('events'), this.get('viewstart').clone(), this.get('viewend').clone());
    rows = [];
    for (_i = 0, _len = layoutsbyweek.length; _i < _len; _i++) {
      weeklayout = layoutsbyweek[_i];
      weekdates = [];
      for (col = _j = 1; _j <= 7; col = ++_j) {
        weekdates.push(date.clone());
        date.add('1', 'day');
      }
      rows.push({
        dates: weekdates,
        events: weeklayout
      });
    }
    return rows;
  }).property('events.@each', 'viewstart', 'viewend'),
  displayMonthForYear: function(month, year) {
    var oldend, oldrange, oldstart, range;
    oldstart = this.get('viewstart').clone();
    oldend = this.get('viewend').clone();
    this.setProperties({
      curmonth: month,
      curyear: year
    });
    range = new CalendarTools.Range({
      start: this.get('viewstart').clone(),
      end: this.get('viewend').clone()
    });
    oldrange = new CalendarTools.Range({
      start: oldstart,
      end: oldend
    });
    return this.sendAction('viewChanged', range, oldrange);
  },
  unselectEvent: function() {
    this.sendAction('eventUnselected', this.get('_selectedEvent'));
    return this.set('_selectedEvent', null);
  },
  actions: {
    prev: function() {
      var newday;
      newday = this.get('firstdayofcurmonth').clone().subtract(1, 'month');
      return this.displayMonthForYear(newday.month() + 1, newday.year());
    },
    next: function() {
      var newday;
      newday = this.get('firstdayofcurmonth').clone().add(1, 'month');
      return this.displayMonthForYear(newday.month() + 1, newday.year());
    },
    today: function() {
      var newday;
      newday = moment();
      return this.displayMonthForYear(newday.month() + 1, newday.year());
    },
    eventClicked: function(event) {
      var same;
      if (this.get('_selectedDate')) {
        this.sendAction('dateUnselected', this.get('_selectedDate'));
        this.set('_selectedDate', null);
      }
      same = false;
      if (this.get('_selectedEvent')) {
        if (event === this.get('_selectedEvent')) {
          same = true;
        }
        this.sendAction('eventUnselected', event);
        this.set('_selectedEvent', null);
      }
      if (!same) {
        this.set('_selectedEvent', event);
        return this.sendAction('eventSelected', event);
      }
    },
    dateClicked: function(date) {
      var same;
      if (this.get('_selectedEvent')) {
        this.sendAction('eventUnselected', this.get('_selectedEvent'));
        this.set('_selectedEvent', null);
      }
      same = false;
      if (this.get('_selectedDate')) {
        if (date === this.get('_selectedDate')) {
          same = true;
        }
        this.sendAction('dateUnselected', date);
        this.set('_selectedDate', null);
      }
      if (!same) {
        this.set('_selectedDate', date);
        return this.sendAction('dateSelected', date);
      }
    }
  }
});

export default component;
