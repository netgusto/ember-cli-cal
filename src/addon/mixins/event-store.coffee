### global _ ###
`import Ember from 'ember'`

component = Ember.Mixin.create
    
    calendarevents: []

    mergeEvents: (occurences) ->

        calendarevents = @get('calendarevents')
        filteredOccurences = []

        filterFunc = (item) ->
            return false if not item.payload? or not item.payload.id?
            item.payload.id == occurence.payload.id and item.start.isSame(occurence.start) and item.end.isSame(occurence.end)

        for occurence in occurences
            filteredOccurences.push(occurence) if not _.find(calendarevents, filterFunc)

        @get('calendarevents').pushObjects(filteredOccurences)

    getEvents: () ->
        return @get('calendarevents')

`export default component`