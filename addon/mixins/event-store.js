
/* global _ */
import Ember from 'ember';
var component;

component = Ember.Mixin.create({
  calendarevents: [],
  mergeEvents: function(occurences) {
    var calendarevents, filterFunc, filteredOccurences, occurence, _i, _len;
    calendarevents = this.get('calendarevents');
    filteredOccurences = [];
    filterFunc = function(item) {
      if ((item.payload == null) || (item.payload.id == null)) {
        return false;
      }
      return item.payload.id === occurence.payload.id && item.start.isSame(occurence.start) && item.end.isSame(occurence.end);
    };
    for (_i = 0, _len = occurences.length; _i < _len; _i++) {
      occurence = occurences[_i];
      if (!_.find(calendarevents, filterFunc)) {
        filteredOccurences.push(occurence);
      }
    }
    return this.get('calendarevents').pushObjects(filteredOccurences);
  },
  getEvents: function() {
    return this.get('calendarevents');
  }
});

export default component;
