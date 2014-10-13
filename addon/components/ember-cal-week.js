import Ember from 'ember';
var component;

component = Ember.Component.extend({
  tagName: 'div',
  classNames: ['bk-weekrow', 'clearfix'],
  classNameBindings: ['rowclass'],
  row: null,
  rowclass: (function() {
    return 'bk-weekrow-height-' + this.get('row.events.layout').length;
  }).property('row.events.layout.@each'),
  actions: {
    eventClicked: function(event) {
      return this.sendAction('eventClicked', event);
    },
    dateClicked: function(date) {
      return this.sendAction('dateClicked', date);
    }
  }
});

export default component;
