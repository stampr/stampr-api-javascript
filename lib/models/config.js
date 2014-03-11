var util = require('util');

var AbsModel = require('./abstract');

function StamprConfig(parent) {
  this.type = AbsModel.ModelTypes.Config;

  this.size = StamprConfig.Sizes.standard;
  this.turnaround = StamprConfig.Turnarounds.threeday;
  this.style = StamprConfig.Styles.color;
  this.output = StamprConfig.Outputs.simplex;
  this.returnenvelope = false;

  AbsModel.call(this, parent);
}

util.inherits(StamprConfig, AbsModel);

StamprConfig.prototype.verify = function() {
  // No verification needed except maybe ensuring settings are real, but meh, we'll leave that up to the user
};

StamprConfig.prototype.create = function(callback) {
  if (!!this.getId()) throw new Error('Stampr: Unable to create, already exists');

  this.verify();

  this.saveToResource('/api/configs', {
    'size': this.size,
    'turnaround': this.turnaround,
    'style': this.style,
    'output': this.output,
    'returnenvelope': this.returnenvelope,
  }, callback);

  return this;
};

StamprConfig.prototype.find = function(id, callback) {
  if (!id) id = this.getId();
  return this.importFromResource('/api/configs/' + id, callback);
};

StamprConfig.prototype.findAll = function(status, start, end, page, callback) {
  return this.importAllFromResource('/api/configs', status, start, end, page, callback);
};

StamprConfig.prototype.Sizes = function() {
  return StamprConfig.Sizes;
};

StamprConfig.prototype.Turnarounds = function() {
  return StamprConfig.Turnarounds;
};

StamprConfig.prototype.Styles = function() {
  return StamprConfig.Styles;
};

StamprConfig.prototype.Outputs = function() {
  return StamprConfig.Outputs;
};

StamprConfig.Sizes = {
  standard: 'standard',
  postcard: 'postcard',
  legal: 'legal'
};

StamprConfig.Turnarounds = {
  weekend: 'weekend',
  overnight: 'overnight',
  threeday: 'threeday',
  week: 'week'
};

StamprConfig.Styles = {
  color: 'color',
  mono: 'mono'
};

StamprConfig.Outputs = {
  simplex: 'single',
  duplex: 'double'
};

module.exports = StamprConfig;
