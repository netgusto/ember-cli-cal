`import Ember from 'ember'`
`import ColorTools from 'ember-cal/utilities/colortools'`

component = Ember.Component.extend

    tagName: 'div'
    classNames: ['bk-event']
    classNameBindings: ['active', 'hover']

    attributeBindings: ['style']
    style: (->
        return 'background-color: ' + @get('color') + '; color: ' + @get('textcolor') if (@get('hover') or @get('active'))
        return 'background-color: ' + @get('fadedcolor') if @get('visibleLength') > 0
    ).property 'active', 'hover'

    event: null
    lane: null
    row: null
    fadedcolor: null

    active: Ember.computed.alias('event.active')
    hover: Ember.computed.alias('event.hover')

    visibleLength: (->
        @get('event').getVisibleLength(@get('row.events.start'), @get('row.events.end'))
    ).property 'event', 'row.events.start', 'row.events.end'

    _setup: (->


        classNames = [
            'bk-lane-' + (@get('lane').lane + 1)
            'bk-duration-' + @get('visibleLength')
            'bk-offset-' + @get('event').getVisibleStart(@get('row.events.start')).diff(@get('row.events.start'), 'days')
        ]

        if @get('event').isTruncatedLeft(@get('row.events.start'), @get('row.events.end'))
            classNames.push('bk-truncated-left')

        if @get('event').isTruncatedRight(@get('row.events.start'), @get('row.events.end'))
            classNames.push('bk-truncated-right')

        @get('classNames').pushObjects(classNames)

        @set('fadedcolor', ColorTools.shadeColor(@get('color'), 0.7))

    ).on 'init'

    click: () -> @sendAction('eventClicked', @get('event'))

    mouseEnter: () -> @get('event').set('hover', true)

    mouseLeave: () -> @get('event').set('hover', false)

`export default component`