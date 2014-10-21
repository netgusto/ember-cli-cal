### global moment ###

`import Ember from 'ember'`
`import CalendarTools from 'ember-cli-cal/utilities/calendartools'`
`import ColorTools from 'ember-cli-cal/utilities/colortools'`

component = Ember.Component.extend

    component: null
    events: null

    color: null
    textcolor: null

    calendarStyleTag: null
    
    curmonth: null
    curyear: null

    _selectedEvent: null
    _selectedDate: null

    _setup: (->

        # Registering the component in the controller using 2 ways binding 
        @set('component', @)
        @displayMonthForYear(moment().month() + 1, moment().year())

        fadedColor = ColorTools.shadeColor(@get('color'), 0.7)

        uniqid = 'bk-uniqid-' + Date.now() + Math.floor(Math.random() * 100000)

        @set('classNames', [uniqid])

        @set('calendarStyleTag', '<style type="text/css">

            .' + uniqid + ' .bk-calendar .bk-event {
                background-color: ' + fadedColor + ';
            }

            .' + uniqid + ' .bk-calendar .bk-event.bk-duration-0 {
                background-color: transparent;
            }

            .' + uniqid + ' .bk-calendar .bk-event.hover,
            .' + uniqid + ' .bk-calendar .bk-event.active {
                background-color: ' + @get('color') + ';
            }

            .' + uniqid + ' .bk-calendar .bk-event.bk-duration-0:before {
                background-color: ' + fadedColor + ';
            }

            .' + uniqid + ' .bk-calendar .bk-event.active.bk-duration-0:before,
            .' + uniqid + ' .bk-calendar .bk-event.hover.bk-duration-0:before {
                background-color: white;
            }
        </style>');

    ).on 'init'

    firstdayofcurmonth: (->
        pad = (n, width, z) ->
            z = z || '0'
            n = n + ''
            if n.length >= width
                return n
            else
                return new Array(width - n.length + 1).join(z) + n

        moment(@get('curyear') + '-' + pad(@get('curmonth'), 2) + '-01T00:00:00.000Z').utc()  # UTC
    ).property 'curyear', 'curmonth'

    viewstart: (->
        @get('firstdayofcurmonth').clone().isoWeekday(1)
    ).property 'firstdayofcurmonth'

    viewend: (->
        @get('firstdayofcurmonth').clone().endOf('month').isoWeekday(7).add(1, 'second').millisecond(0) # aligning date on 00:00:00~000 (otherwise, moment().endOf('month') gives '23:59:59~999')
    ).property 'firstdayofcurmonth'

    title: (->
        @get('firstdayofcurmonth').format('MMMM YYYY')
    ).property 'firstdayofcurmonth'

    isPresentView: (->
        return @get('curyear') == moment().year() and @get('curmonth') == (moment().month() + 1)
    ).property 'curyear', 'curmonth'

    ###
    debugVisualization: (->
        # Debug lanes, week by week

        res = []
        layoutsbyweek = CalendarTools.getLayoutsByWeek(@get('events'), @get('viewstart').clone(), @get('viewend').clone())
        
        for week in layoutsbyweek
            res.push week['start'].toString() + ' => ' + week['end'].toString()
            res.push CalendarTools.visualizeLayout(week.layout, week['start'].clone(), week['end'].clone())

        res.join('\n')

    ).property 'events.@each', 'viewstart', 'viewend'
    ###

    rows: (->

        date = @get('viewstart').clone()
        layoutsbyweek = CalendarTools.getLayoutsByWeek(@get('events'), @get('viewstart').clone(), @get('viewend').clone())

        rows = []
        for weeklayout in layoutsbyweek

            weekdates = []
            
            for col in [1..7]
                weekdates.push date.clone()
                date.add('1', 'day')

            rows.push(
                dates: weekdates
                events: weeklayout
            )

        return rows
        
    ).property 'events.@each', 'viewstart', 'viewend'

    displayMonthForYear: (month, year) ->

        oldstart = @get('viewstart').clone()
        oldend = @get('viewend').clone()

        @setProperties(
            curmonth: month
            curyear: year
        )

        range = new CalendarTools.Range(
            start: @get('viewstart').clone()
            end: @get('viewend').clone()
        )

        oldrange = new CalendarTools.Range(
            start: oldstart
            end: oldend
        )

        @sendAction('viewChanged', range, oldrange)

    unselectEvent: () ->
        @sendAction('eventUnselected', @get('_selectedEvent'))
        @set('_selectedEvent', null)

    actions:
        prev: () ->
            newday = @get('firstdayofcurmonth').clone().subtract(1, 'month')
            @displayMonthForYear(newday.month() + 1, newday.year())

        next: () ->
            newday = @get('firstdayofcurmonth').clone().add(1, 'month')
            @displayMonthForYear(newday.month() + 1, newday.year())

        today: () ->
            newday = moment()
            @displayMonthForYear(newday.month() + 1, newday.year())

        eventClicked: (event) ->

            if @get('_selectedDate')
                @sendAction('dateUnselected', @get('_selectedDate'))
                @set('_selectedDate', null)

            same = false

            if @get('_selectedEvent')
                same = true if event == @get('_selectedEvent')

                @sendAction('eventUnselected', event)
                @set('_selectedEvent', null)

            if not same
                @set('_selectedEvent', event)
                @sendAction('eventSelected', event)

        dateClicked: (date) ->

            if @get('_selectedEvent')
                @sendAction('eventUnselected', @get('_selectedEvent'))
                @set('_selectedEvent', null)

            same = false

            if @get('_selectedDate')
                same = true if date == @get('_selectedDate')

                @sendAction('dateUnselected', date)
                @set('_selectedDate', null)

            if not same
                @set('_selectedDate', date)
                @sendAction('dateSelected', date)

`export default component`