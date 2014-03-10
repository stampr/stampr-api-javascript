var util = require('util');

var AbsModel = require('./abstract');

function StamprBatch(parent) {
  this.type = AbsModel.ModelTypes.Batch;

  this.config_id = null;
  this.template = null;
  this.status = StamprBatch.Statuses.processing;

  AbsModel.call(this, parent);
}

util.inherits(StamprBatch, AbsModel);

StamprBatch.prototype.verify = function() {
  if (!this.config_id) throw new Error('Stampr: Config ID required');
  if (!this.status) throw new Error('Stampr: Batch status required');
};

StamprBatch.prototype.create = function(callback) {
  if (!!this.getId()) throw new Error('Stampr: Unable to create, already exists');

  this.verify();

  this.saveToResource('/api/batches', {
    'config_id': this.config_id,
    'template': this.template,
    'status': this.status
  }, callback);

  return this;
};

StamprBatch.prototype.find = function(id, callback) {
  if (!id) id = this.getId();
  return this.importFromResource('/api/batches/' + id, callback);
};

StamprBatch.prototype.findAll = function(status, start, end, page, callback) {
  return this.importAllFromResource('/api/batches', status, start, end, page, callback);
};

StamprBatch.prototype.mailings = function(status, start, end, page, callback) {
  if (!this.getId()) return callback(new Error('Stampr: Batch not created, cannot find mailings'));
  return this.importAllFromResource('/api/batches/' + this.getId() + '/mailings', status, start, end, page, callback);
};

StamprBatch.prototype.update = function(callback) {
  if (!this.getId()) return callback(new Error('Stampr: Unable to update.  Does not exist'));

  this.verify();

  this.saveToResource('/api/batches/' + this.getId(), {
    'status': this.status
  }, callback);

  return this;
};

StamprBatch.prototype.delete = function(callback) {
  if (!this.getId()) return callback(new Error('Stampr: Unable to delete.  Does not exist'));
  
  this.removeFromResource('/api/batches/' + this.getId(), callback);

  return this;
};

StamprBatch.Statuses = {
  processing: 'processing',
  hold: 'hold'
};

module.exports = StamprBatch;
