stampr-api-javascript
=====================

## Installing

`npm install stampr`

## Examples

### Quick-Send a New Postal Mailing

```javascript
var Stampr = require('stampr');
var stampr = new Stampr('[email]', '[password]');

var to = [
  'blah',
  '123 f st',
  'fdas, ca 12345'
].join('\n');

var from = [
  'blah',
  '123 f st',
  'fdas, ca 12345'
].join('\n');

var message = '<html>Hello World!</html>';

stampr.mail(to, from, message, function(err, data) {
  if (err) throw err;
  console.log('Mailing', data);
});
```

### Advanced Implementation

```javascript
var Stampr = require('stampr');

var stampr = new Stampr('[email]', '[password]');

// Create empty object
var batch = stampr.factory('Batch');

// Load existing object
batch.find(1234, function(err, batch) {
    if (err) throw err;
    // do something with batch
    console.log('batch', batch.getId());
});

// Save to API
batch = stampr->factory('Batch').set('config_id', 1111);
batch.create(function(err, batch) {
    if (err) throw err;
    // do something with batch
    console.log('batch', batch.getId());
});

// Update
// load batch
batch.set('status', 'hold');
batch.update(function(err, batch) {
    if (err) throw err;
    // do something with batch
    console.log('batch', batch.getId());
});

// Delete
// load batch
batch.delete(function(err, batch) {
    if (err) throw err;
    // do something with batch
    console.log('batch', batch.getId());  
});
```
