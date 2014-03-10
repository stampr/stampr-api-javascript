var util = require('util')
  , crypto = require('crypto');

var AbsModel = require('./abstract');

function StamprMailing(parent) {
  this.type = AbsModel.ModelTypes.Mailing;

  this.batch_id = null;
  this.address = null;
  this.returnaddress = null;
  this.format = StamprMailing.Formats.none;
  this.data = null;
  this.md5 = null;

  AbsModel.call(this, parent);
}

util.inherits(StamprMailing, AbsModel);

StamprMailing.prototype.verify = function() {
  if (!this.batch_id) throw new Error('Stampr: Batch ID required');
  if (!this.address) throw new Error('Stampr: Address required');
  if (!this.returnaddress) throw new Error('Stampr: Return address required');
  if (!this.format) throw new Error('Stampr: Mail format required');
  if (this.format != StamprMailing.Formats.none && !this.data) throw new Error('Stampr: Mail body required if mail format is not None');
};

StamprMailing.prototype.create = function(callback) {
  if (!!this.getId()) throw new Error('Stampr: Unable to create, already exists');

  this.verify();

  var encodedData = (this.data || new Buffer(0)).toString('base64');
  this.saveToResource('/api/mailings', {
    'batch_id': this.batch_id,
    'address': this.address,
    'returnaddress': this.returnaddress,
    'format': this.format,
    'data': encodedData,
    'md5': crypto.createHash('md5').update(encodedData).digest('hex'),
  }, callback);

  return this;
};

StamprMailing.prototype.find = function(id, callback) {
  if (!id) id = this.getId();
  return this.importFromResource('/api/mailings/' + id, callback);
};

StamprMailing.prototype.findAll = function(status, start, end, page, callback) {
  return this.importAllFromResource('/api/mailings', status, start, end, page, callback);
};

StamprMailing.prototype.delete = function(status, start, end, page, callback) {
  if (!this.getId()) return callback(new Error('Stampr: Unable to delete.  Does not exist'));

  this.removeFromResource('/api/mailings/' + this.getId());

  return this;
};

StamprMailing.Formats = {
  none: 'none',
  json: 'json',
  html: 'html',
  pdf: 'pdf'
};

module.exports = StamprMailing;
