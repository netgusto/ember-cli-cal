`import Ember from 'ember'`

component = Ember.Component.extend

    tagName: 'div'
    classNames: ['bk-header-controls']
    calendar: null

    isPresentView: Ember.computed.oneWay('calendar.isPresentView')

    actions:
        prev: () -> @get('calendar').send('prev')

        next: () -> @get('calendar').send('next')

        today: () -> @get('calendar').send('today')

`export default component`