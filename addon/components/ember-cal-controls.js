import Ember from 'ember';
var component;

component = Ember.Component.extend({
  tagName: 'div',
  classNames: ['bk-header-controls'],
  calendar: null,
  isPresentView: Ember.computed.oneWay('calendar.isPresentView'),
  actions: {
    prev: function() {
      return this.get('calendar').send('prev');
    },
    next: function() {
      return this.get('calendar').send('next');
    },
    today: function() {
      return this.get('calendar').send('today');
    }
  }
});

export default component;
