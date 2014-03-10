var restify = require('restify')
  , Hmmac = require('hmmac');

var hmmac = new Hmmac({
  scheme: Hmmac.schemes.load('aws4'),
  schemeConfig: {
    region: 'us-1',
    service: 'stampr'
  }
});

var rest = restify.createJsonClient({
  url: res.app.settings['api location'],
  signRequest: function(req) {
    req.headers = req._headers;

    var auth = hmmac.sign(req, {
          key: res.locals.user.apikey
        , secret: res.locals.user.apisecret
      }, true);

    req.setHeader('authorization', auth);
  }
});

rest.post(config.get('app:api:prefix')+'/configs', {
      size: 'standard'
    , turnaround: 'threeday'
    , style: 'color'
    , output: 'single'
    , returnenvelope: false
  }, function(err, restReq, restRes, data) {
    if (err || !restRes || restRes.statusCode != 200) return res.send(restRes ? restRes.statusCode : 500, data);

    console.log('config created', typeof data, data);

    rest.post(config.get('app:api:prefix')+'/batches', {
          config_id: data.config_id
      }, function(err, restReq, restRes, data) {
    if (err || !restRes || restRes.statusCode != 200) return res.send(restRes ? restRes.statusCode : 500, data);

        db.Batch.find(data.batch_id).success(function(batch) {
          callback(null, batch);
          batch.name = batchName;
          batch.save().error(function(err) {
            res.send(500, 'Problem setting batch name');
          });
        });
      });
  });


function StamprClient(email, password, endpoint) {
  endpoint = endpoint || 'https://stam.pr/api';

  parent::__construct($endpoint);
  $authPlugin = new CurlAuthPlugin($user, $password);
  $this->addSubscriber($authPlugin);
}

module.exports = StamprClient;
