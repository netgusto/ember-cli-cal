import Ember from 'ember';
var component;

component = Ember.Component.extend({
  tagName: 'div',
  classNames: ['bk-header-title'],
  calendar: null,
  title: Ember.computed.oneWay('calendar.title')
});

export default component;
