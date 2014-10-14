module.exports = {
    name: 'ember-cli-cal',
    included: function(app) {
        this._super.included(app);
        
        app.import(app.bowerDirectory + '/momentjs/moment.js');
        app.import(app.bowerDirectory + '/lodash/dist/lodash.js');
        app.import('vendor/ember-cli-cal.css');
    }
};