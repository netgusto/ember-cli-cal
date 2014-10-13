`import Ember from 'ember'`

component = Ember.Component.extend

    tagName: 'div'
    classNames: ['bk-weekrow', 'clearfix']
    classNameBindings: ['rowclass']

    row: null

    rowclass: (->
        return 'bk-weekrow-height-' + @get('row.events.layout').length
    ).property 'row.events.layout.@each'

    actions:
        eventClicked: (event) ->
            @sendAction('eventClicked', event)

        dateClicked: (date) ->
            @sendAction('dateClicked', date)

`export default component`