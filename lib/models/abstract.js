var util = require('util');

function StamprAbstractModel(parent) {
  this.id = null;
  this.parent = parent;
}

StamprAbstractModel.prototype.getId = function() {
  return this.id;
};

StamprAbstractModel.prototype.client = function() {
  return this.parent.client;
};

StamprAbstractModel.prototype.set = function(k, v) {
  this[k] = v;
  return this;
};

StamprAbstractModel.prototype.importFromResource = function(uri, callback) {
  var self = this;
  self.parent.client.get(uri, function(err, restReq, restRes, data) {
    if (err) return callback(err);
    self.importFromJsonRepresentation(data);
    callback(null, self);
  });

  return this;
};

StamprAbstractModel.prototype.importAllFromResource = function(uri, status, start, end, page, callback) {
  var self = this;
  if (typeof page == 'function') callback = page, page = null;
  if (typeof end == 'function') callback = end, end = null;
  if (typeof start == 'function') callback = start, start = null;
  if (typeof status == 'function') callback = status, status = null;

  page = page || 0;

  uri += !status ? '/browse' + (~uri.indexOf('configs') ? '/all' : '') : '/with/' + status;
  if (!!start) uri += '/'  + encodeURIComponent(start);
  if (!!start && !!end) uri += '/' . encodeURIComponent(end);
  uri += '/' + page;

  var results = [];
  self.parent.client.get(uri, function(err, restReq, restRes, data) {
    if (err) return callback(err);
    if (!util.isArray(data)) return callback(new Error('Stampr: Invalid result set returned'));

    for (var i=0; i < data.length; i++) {
      var obj = self.parent.factory(self.type);
      obj.importData(data[i]);
      results.push(obj);
    }

    return callback(null, results);
  });

  return this;
};

StamprAbstractModel.prototype.importFromJsonRepresentation = function(json) {
  typeName = this.type;
  typeId = typeName.toLowerCase() + '_id';

  // console.log(this);
  for (var k in json) {
    prop = k == typeId ? 'id' : k; // translate ID key
    // console.log('importing data', k, json[k], typeof this[prop]);
    if (typeof this[prop] != 'undefined') this[prop] = json[k];
    // TODO: debug mode, emit warning
  }

  return this;
};

StamprAbstractModel.prototype.saveToResource = function(uri, data, callback) {
  var self = this;
  self.parent.client.post(uri, data, function(err, restReq, restRes, data) {
    if (err) return callback(err);
    self.importFromJsonRepresentation(data);
    // console.log(uri, data)
    return callback(null, self);
  });

  return this;
};

StamprAbstractModel.prototype.removeFromResource = function(uri) {
  self.parent.client.del(uri, function(err, restReq, restRes, data) {
    if (err) return callback(err);
    if (true !== data) return callback(new Error('Stampr: Unable to remove'));
  });

  return this;
};

StamprAbstractModel.prototype.importData = function(data) {
  this.importFromJsonRepresentation(data);
  return this;
};

StamprAbstractModel.prototype.save = function(callback) {
  return !this.id ? this.create(callback) : this.update(callback);
};

StamprAbstractModel.prototype.create = function(callback) {
  throw new Error('Stampr: Unsupported action "create"');
};

StamprAbstractModel.prototype.find = function(id, callback) {
  throw new Error('Stampr: Unsupported action "find"');
};

StamprAbstractModel.prototype.findAll = function(status, start, end, page, callback) {
  throw new Error('Stampr: Unsupported action "findAll"');
};

StamprAbstractModel.prototype.update = function(callback) {
  throw new Error('Stampr: Unsupported action "update"');
};

StamprAbstractModel.prototype.delete = function(callback) {
  throw new Error('Stampr: Unsupported action "delete"');
};

StamprAbstractModel.ModelTypes = {
  Batch: 'Batch',
  Config: 'Config',
  Mailing: 'Mailing'
};

module.exports = StamprAbstractModel;
