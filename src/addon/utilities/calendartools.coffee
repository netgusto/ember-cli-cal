### jslint node:true, shadow:true, unused:false ###
### global _, moment ###

"use strict"

`import Ember from 'ember'`

# @Author: Jérôme Schneider, Net Gusto <http://netgusto.com>
# Inspired by http://stackoverflow.com/a/404078

###
# The layout methods
###

# This method lays the passed events on lanes, maximizing the compacity of the layout while avoiding overlaps
layoutEvents = (events) ->

    return [] if events not instanceof Array

    # On ordonnance le tableau d'évènement avant traitement
    events.sort((a, b) ->
        # descending length, then ascending start date, then ascending label
        aLength = a.getLength()
        bLength = b.getLength()

        if aLength == bLength

            if a.start.isSame(b.start)
                # ascending label
                if a.label > b.label then return 1 else return -1
            else
                # ascending start date
                if a.start.isAfter(b.start) then return 1 else return -1

        else
            # descending length
            if aLength < bLength then return 1 else return -1
    )

    # events are now sorted, we may lay them out
    remainingEvents = events.slice(0) # cloning array
    result = []

    sortFunc = (a, b) -> if a.start.isAfter(b.start) then return 1 else return -1

    lane = 0
    while remainingEvents.length > 0
        laneEvents = []
        
        for e in remainingEvents
            laneEvents.push(e) if e.isCompatibleWith(laneEvents)

        for de in laneEvents
            remainingEvents = _.without(remainingEvents, de)

        laneEvents.sort(sortFunc)

        result.push({lane: lane, events: laneEvents})
        ++lane

    return result

splitTimeInWeeks = (startMonday, endSunday) ->
    
    weeks = []
    weekstart = startMonday.clone()
    weekend = startMonday.clone().add(7, 'days')
    
    while weekstart.isBefore(endSunday)

        weeks.push({start: weekstart.clone(), end: weekend.clone()})

        weekstart.add('7', 'days')
        weekend.add('7', 'days')

    weeks

getEventsVisibleInPeriod = (events, start, end) ->

    visibleevents = []

    # On retire tous les éléments dépassant de la vue
    for event in events
        
        if event.isVisible(start, end)
            visibleevents.push event

    visibleevents

getEventsByWeek = (events, startMonday, endSunday) ->

    res = []
    weeks = splitTimeInWeeks(startMonday.clone(), endSunday.clone())
    
    for week in weeks

        periodevents = getEventsVisibleInPeriod(events, week['start'], week['end'])

        res.push(
            start: week.start.clone()
            end: week.end.clone()
            events: periodevents
        )

    res

getLayoutsByWeek = (events, startMonday, endSunday) ->

    res = []
    eventsbyweek = getEventsByWeek(events, startMonday, endSunday)
    for week in eventsbyweek
        res.push(
            start: week.start.clone()
            end: week.end.clone()
            layout: layoutEvents(week.events)
        )

    res

###
# Testing and debugging
# To visualize with debugLayout, use only 1 char labels
###

visualizeLayout = (layout, viewstart, viewend) ->

    result = ''

    zero = () -> viewstart.clone()
    echo = (msg) -> result += msg
    
    distance = (date) ->
        date.diff(zero(), 'days')

    return '' if layout.length == 0

    echo '\n'
    echo '   |1234567|' + '\n'

    for lane in layout

        lanecursor = 0
        echo lane.lane + ': |'
        
        for event in lane.events
            
            evdist = distance(event.getVisibleStart(viewstart))
            evvisiblelength = event.getVisibleLength(viewstart, viewend)
            #console.log('DEBUG:', event.label, evvisiblelength)
            
            _.times(evdist - lanecursor, echo.apply(@, ' '))
            _.times(evvisiblelength, echo.apply(@, event.label))
            lanecursor = evdist + evvisiblelength
            
            #console.log(event.label, evdist, evvisiblelength, event.getVisibleStart(viewstart).toString())

        echo '\n'

    return result

###
# The CalendarTools.Event class
# Represents a simple calendar event (start date, end date, label, payload)
# Used to manipulate events; simply store your own events in the payload property
# example: new CalendarTools.Event({ start: myEvent.getStart(), end: myEvent.getEnd(), label: myEvent.getLabel(), payload: myEvent })
###

class DisplayedEvent
    
    start: null
    end: null
    label: null
    payload: null
    
    active: false
    hover: false

    constructor: (hash) ->
        @start = moment(hash.start || null)
        @end = moment(hash.end || null)
        @label = hash.label || '?'
        @payload = hash.payload || null

    # total number of days
    getLength: () ->
        return (@end.diff(@start, 'days'))

    getVisibleStart: (viewstart) ->

        if @start.isAfter(viewstart) or @start.isSame(viewstart)
            return @start
        else
            return viewstart

    getVisibleLength: (viewstart, viewend) ->
        return 0 if not @isVisible(viewstart, viewend)

        if @start.isAfter(viewstart) or @start.isSame(viewstart)
            if @end.isBefore(viewend) or @end.isSame(viewend)
                return @getLength()
            else
                return viewend.diff(@start, 'days')
        else
            if @end.isBefore(viewend) or @end.isSame(viewend)
                return @end.diff(viewstart, 'days')
            else
                return viewend.diff(viewstart, 'days')

    isVisible: (viewstart, viewend) ->
        return (not @end.isBefore(viewstart) and not @end.isSame(viewstart) and not @start.isSame(viewend) and not @start.isAfter(viewend))

    # true if this event and the one passed have NO days in common
    isCompatible: (event) ->

        # Ordering dates ASC
        if @start.isBefore(event.start)
            one = @
            two = event
        else
            one = event
            two = @

        return one.end.isBefore(two.start) or one.end.isSame(two.start)

    # true if this is compatible with all passed events
    isCompatibleWith: (events) ->

        for event in events
            return false if not @isCompatible(event)

        return true

    isTruncatedLeft: (viewstart, viewend) ->
        return true if (@start.isBefore(viewstart) and @end.isAfter(viewstart))

        return false

    isTruncatedRight: (viewstart, viewend) ->
        return true if (@end.isAfter(viewend) and @start.isBefore(viewend))

        return false

###
# The CalendarTools.Range class
###

class Range
    
    start: null
    end: null

    constructor: (hash) ->
        @start = moment(hash.start || null)
        @end = moment(hash.end || null)

lib = {
    DisplayedEvent: Ember.Object.extend(DisplayedEvent.prototype)
    Range: Range
    layoutEvents: layoutEvents
    getLayoutsByWeek: getLayoutsByWeek
    visualizeLayout: visualizeLayout
}

`export default lib`