import Ember from 'ember';
var component;

component = Ember.Component.extend({
  tagName: 'div',
  classNames: ['bk-event'],
  classNameBindings: ['active', 'hover'],
  event: null,
  lane: null,
  row: null,
  active: Ember.computed.alias('event.active'),
  hover: Ember.computed.alias('event.hover'),
  visibleLength: (function() {
    return this.get('event').getVisibleLength(this.get('row.events.start'), this.get('row.events.end'));
  }).property('event', 'row.events.start', 'row.events.end'),
  _setup: (function() {
    var classNames;
    classNames = ['bk-lane-' + (this.get('lane').lane + 1), 'bk-duration-' + this.get('visibleLength'), 'bk-offset-' + this.get('event').getVisibleStart(this.get('row.events.start')).diff(this.get('row.events.start'), 'days')];
    if (this.get('event').isTruncatedLeft(this.get('row.events.start'), this.get('row.events.end'))) {
      classNames.push('bk-truncated-left');
    }
    if (this.get('event').isTruncatedRight(this.get('row.events.start'), this.get('row.events.end'))) {
      classNames.push('bk-truncated-right');
    }
    return this.get('classNames').pushObjects(classNames);
  }).on('init'),
  click: function() {
    return this.sendAction('eventClicked', this.get('event'));
  },
  mouseEnter: function() {
    return this.get('event').set('hover', true);
  },
  mouseLeave: function() {
    return this.get('event').set('hover', false);
  }
});

export default component;
