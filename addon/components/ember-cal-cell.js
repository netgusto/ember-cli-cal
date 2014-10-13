
/* global moment */
import Ember from 'ember';
var component;

component = Ember.Component.extend({
  tagName: 'div',
  classNames: ['bk-daycell'],
  classNameBindings: ['isOtherMonth:bk-othermonth', 'active', 'isToday:bk-today', 'dayname'],
  isOtherMonth: (function() {
    var date;
    date = this.get('date');
    return (date.month() + 1) !== this.get('curmonth') || (date.year() !== this.get('curyear'));
  }).property('date', 'curyear', 'curmonth'),
  isToday: (function() {
    return moment().isSame(this.get('date'), 'day');
  }).property('date'),
  dayname: (function() {
    return 'bk-day-' + this.get('date').format('ddd').toLowerCase();
  }).property('date'),
  date: null,
  curmonth: null,
  curyear: null,
  dayofmonth: (function() {
    return this.get('date').date();
  }).property('date'),
  monthname: (function() {
    if (this.get('dayofmonth') === 1) {
      return this.get('date').format('MMMM');
    }
  }).property('date'),
  click: function() {
    return this.sendAction('dateClicked', this.get('date'));
  }
});

export default component;
