# Feature Toggle

A Javascript client library for interacting with [featuretoggle.com](https://featuretoggle.com).  This library is under active development and is likely to change frequently.  Bug reports and pull requests are welcome.

## Installation

Install with [Bower](https://bower.io/)

```bash
bower install featuretoggle-lib-js
```

Install with [NPM](https://npmjs.com/)

```bash
npm install featuretoggle-lib-js
```

## Usage

```javascript
// Create instance
var ft = new FeatureToggle(customerKey, environmentKey);

var myFeature, myFeatures;

// Get features list
ft.getFeatures(function(error,features){
    if(error !== null) {
        console.log(error);
    }
    else {
        myFeatures = features;
    }
});

// Check if specific feature is active
if(myFeatures['feature-name']) {
    console.log('Feature is active, run code');
}

// Get status of specific feature
ft.isEnabled('feature-name',function(error,enabled){
    if(error !== null) {
        console.log(error);
    }
    else {
        myFeature = enabled;
    }
});

// Check if single feature is active
if(myFeature) {
    console.log('Feature is active, run code');
}

```

### Configuration Options
The library caches responses from received the Feature Toggle API locally to limit the number of requests. The default cache timeout is 300 seconds (5 minutes).  You can adjust the cache timeout by providing the 'cache_timeout' config option when initializing the library.

```javascript
{
    'cache_timeout': SECONDS, // optional, defaults to 300 seconds
}
```
## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/featuretoggle/lib-js.


## License

The library is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).