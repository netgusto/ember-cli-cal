### global moment ###
`import Ember from 'ember'`

component = Ember.Component.extend

    tagName: 'div'
    classNames: ['bk-daycell']
    classNameBindings: ['isOtherMonth:bk-othermonth', 'active', 'isToday:bk-today', 'dayname']

    isOtherMonth: (->
        date = @get('date')
        (
            (date.month() + 1) != @get('curmonth') or
            (date.year() != @get('curyear'))
        )
    ).property 'date', 'curyear', 'curmonth'

    isToday: (->
        return moment().isSame(@get('date'), 'day')
    ).property 'date'

    dayname: (->
        return 'bk-day-' + @get('date').format('ddd').toLowerCase()
    ).property 'date'

    date: null
    curmonth: null
    curyear: null
    
    dayofmonth: (->
        @get('date').date()
    ).property('date')

    monthname: (->
        return @get('date').format('MMMM') if @get('dayofmonth') == 1
    ).property('date')

    click: () ->
        @sendAction('dateClicked', @get('date'))

`export default component`