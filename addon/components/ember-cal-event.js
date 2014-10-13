import Ember from 'ember';
import ColorTools from 'ember-cal/utilities/colortools';
var component;

component = Ember.Component.extend({
  tagName: 'div',
  classNames: ['bk-event'],
  classNameBindings: ['active', 'hover'],
  attributeBindings: ['style'],
  style: (function() {
    if (this.get('hover') || this.get('active')) {
      return 'background-color: ' + this.get('color') + '; color: ' + this.get('textcolor');
    }
    if (this.get('visibleLength') > 0) {
      return 'background-color: ' + this.get('fadedcolor');
    }
  }).property('color', 'textcolor', 'active', 'hover'),
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
    this.get('classNames').pushObjects(classNames);
    return this.set('fadedcolor', ColorTools.shadeColor(this.get('color'), 0.7));
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
