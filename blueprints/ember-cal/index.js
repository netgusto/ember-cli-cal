module.exports = {
  normalizeEntityName: function() {},
  afterInstall: function() {
    var that = this;
    return this.addBowerPackageToProject('momentjs').then(function() {
        return that.addBowerPackageToProject('lodash');
    });
  }
};
