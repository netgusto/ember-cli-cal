var path = require('path');

function unwatchedTree(dir) {
    return {
        read: function() { return dir; },
        cleanup: function() { }
    };
}

module.exports = {
  name: 'ember-cal',
  included: function(app) {
      this._super.included(app);
      //console.log(app);
      app.import(app.bowerDirectory + '/momentjs/moment.js');
      app.import(app.bowerDirectory + '/lodash/dist/lodash.js');
  },
  treeFor: function(treeName) {
    if (treeName !== 'styles') { return false; }
    var treePath = path.join();
    return unwatchedTree(treePath);
  }
};
