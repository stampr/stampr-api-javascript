var restify = require('restify')
  , Hmmac = require('hmmac');

var AbsModel = require('./models/abstract')
  , Batch = require('./models/batch')
  , Config = require('./models/config')
  , Mailing = require('./models/mailing');

var hmmac = new Hmmac({
  scheme: Hmmac.schemes.load('aws4'),
  schemeConfig: {
    region: 'us-1',
    service: 'stampr'
  }
});

function Stampr(email, password, endpoint) {
  var self = this;
  endpoint = endpoint || 'https://stam.pr';

  self.hmmac = hmmac;

  self.quicksend_config_id = null;
  self.quicksend_batch_id = null;

  var opts = {
    url: endpoint,
    agent: false
  };

  if (!~email.indexOf('@')) {
    opts.signRequest = function(req) {
      req.headers = req._headers;

      var auth = self.hmmac.sign(req, {
            key: email
          , secret: password
        }, true);

      req.setHeader('authorization', auth);
    };
  }

  self.client = restify.createJsonClient(opts);

  if (~email.indexOf('@')) {
    self.client.basicAuth(email, password);
  }
}

Stampr.prototype.initDebug = function(first_argument) {
  var self = this;
  ['get','post','del','put'].forEach(function(verb) {
    var _origFn = self.client[verb];
    self.client[verb] = function() {
      console.log(verb.toUpperCase(), arguments);
      _origFn.apply(self.client, arguments);
    };
  });
};

Stampr.prototype.factory = function(type) {
  var obj = null;

  switch (type) {
    case AbsModel.ModelTypes.Batch:
      obj = new Batch(this);
    break;

    case AbsModel.ModelTypes.Config:
      obj = new Config(this);
    break;

    case AbsModel.ModelTypes.Mailing:
      obj = new Mailing(this);
    break;
  }

  if (!obj) return callback(new Error('Stampr: Invalid model type'));

  return obj;
};

Stampr.prototype.findAll = function(type, status, start, end, page, callback) {
  return this.factory(type).findAll(status, start, end, page, callback);
};

Stampr.prototype.mailings = function(status, start, end, page, callback) {
  return this.findAll('Mailing', status, start, end, page, callback);
};

Stampr.prototype.batches = function(status, start, end, page, callback) {
  return this.findAll('Batch', status, start, end, page, callback);
};

Stampr.prototype.configs = function(status, start, end, page, callback) {
  return this.findAll('Config', status, start, end, page, callback);
};

Stampr.prototype.getQuicksendBatchId = function(callback) {
  var self = this;

  if (!self.quicksend_config_id) {
    return self.factory('Config').create(function(err, config) {
      if (err) return callback(err);
      self.quicksend_config_id = config.getId();

      if (!self.quicksend_batch_id) {
        var batch = self.factory('Batch');
        batch.set('config_id', self.quicksend_config_id);
        return batch.create(function(err, batch) {
          if (err) return callback(err);
          self.quicksend_batch_id = batch.getId();

          return callback(null, self.quicksend_batch_id);
        });
      }
    });
  }
  else if (!self.quicksend_batch_id) {
    return self.factory('Batch').set('config_id', self.quicksend_config_id).create(function(err, batch) {
      if (err) return callback(err);
      self.quicksend_batch_id = batch.getId();
      return callback(null, batch.getId());
    });
  }
  else {
    return callback(null, self.quicksend_batch_id);
  }
};

Stampr.prototype.mail = function(to, from, message, batch_id, callback) {
  if (typeof batch_id == 'function') callback = batch_id, batch_id = null;

  var self = this;
  var createMailing = function(batch_id, callback) {
    var mailing = self.factory('Mailing');

    mailing.set('batch_id', batch_id);
    mailing.set('address', to);
    mailing.set('returnaddress', from);
    mailing.set('format', Mailing.Formats.html);
    mailing.set('data', message);

    mailing.create(callback);
  };

  if (!batch_id) {
    self.getQuicksendBatchId(function(err, batch_id) {
      if (err) return callback(err);
      return createMailing(batch_id, callback);
    });
  }
  else {
    createMailing(batch_id, callback);
  }

  return this;
};

Stampr.prototype.ping = function(callback) {
  return this.client.get('/api/test/ping', function(err, restReq, restRes, data) {
    callback(err, data);
  });
};

Stampr.prototype.health = function(callback) {
  return this.client.get('/api/health', function(err, restReq, restRes, data) {
    callback(err, data);
  });
};

module.exports = Stampr;
