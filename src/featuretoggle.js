(function () {
    'use strict';
}());

function FeatureToggleCache(options) {
    if(options.cache_storage === 'session') {
        var storage = sessionStorage;
    }
    else {
        var storage = localStorage;
    }
    this.manager = typeof storage !== 'undefined' ? storage : null;
    this.keys = {};
    this.options = options;
}

FeatureToggleCache.prototype.clear = function() {
    this.manager.clear();
    this.keys = {};
    this.updateKeys();
};

FeatureToggleCache.prototype.get = function(key) {
    if(this.manager) {
        // Check if key is set
        if(typeof this.keys[key] !== 'undefined') {
            // Check if key has expired
            if(this.keys[key] < Math.floor(Date.now() / 1000)) {
                var value = this.manager.getItem(key);
                return JSON.parse(value);
            }
        }
        else if(key === this.options.cache_keys_name) {
            var value = this.manager.getItem(key);
            return JSON.parse(value);
        }
    }

    return null;
};

FeatureToggleCache.prototype.set = function(key, value) {
    if(this.manager) {
        //Add to cache list
        if(key !== this.options.cache_keys_name && typeof this.keys[key] === 'undefined') {
            this.keys[key] = Math.floor(Date.now() / 1000) + this.options.cache_timeout;
        }

        var cachedValue = this.get(key);

        if(JSON.stringify(cachedValue) !== JSON.stringify(value) ) {
            // Add to local storage
            this.manager.setItem(key, JSON.stringify(value));
            var persisted = this.manager.getItem(key); //

            // Update keys list
            if (key !== this.options.cache_keys_name) {
                this.updateKeys();
            }
        }
    }
};

FeatureToggleCache.prototype.remove = function(key) {
    // Remove from local storage
    if(this.manager) {
        this.manager.removeItem(key);
    }

    // Update keys list
    if(key !== this.options.cache_keys_name) {
        this.updateKeys();
    }
};

FeatureToggleCache.prototype.updateKeys = function() {
    this.set(this.options.cache_keys_name, this.keys);
};

function FeatureToggle(customerKey, environmentKey, options) {
    if(options === undefined) {
        options = {};
    }

    this.VERSION = '1.0';

    this.customerKey = customerKey;
    this.environmentKey = environmentKey;
    this.options = this.extend({
        'api': 'https://api.featuretoggle.com',
        'auth': null,
        'cache_timeout': 300, // in seconds
        'version': 'v1',
        'debug': false,
        'cache_keys_name': 'featuretoggle-cache'
    }, options);

    this.options.auth = this.customerKey + ':' + this.environmentKey;

    this.cache = new FeatureToggleCache(this.options);

    // Get cached values
    if(this.cache.manager) {
        var keys = this.cache.get(this.options.cache_keys_name);
        if(keys) {
            this.cache.keys = keys;
        }
    }
}

FeatureToggle.prototype.extend = function(obj1, obj2) {
    if(Object.assign !== undefined) {
        return Object.assign(obj1, obj2);
    }
    else {
        Object.keys(obj2).forEach(function(key){
            obj1[key] = obj2[key];
        });
        return obj1;
    }
};

FeatureToggle.prototype.apiRequest = function (endpoint, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', this.options.api + endpoint);
    request.setRequestHeader('Authorization', this.options.auth);
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('X-Accept-Version', this.options.version);
    request.setRequestHeader('User-Agent', 'FeatureToggle-JS/' + this.VERSION);
    request.onreadystatechange = function () {
        if (4 === request.readyState) {
            var res = JSON.parse(request.responseText);
            var data = {
                success: false,
                message: ''
            };

            switch (request.status) {
                case 200:
                {
                    for (var attr in res) {
                        if(res[attr] !== undefined) {
                            data[attr] = res[attr];
                        }
                    }
                    break;
                }
                default:
                {
                    data.message = res.error.message;
                    break;
                }
            }

            callback(data);
        }
    };
    request.send(null);
};

FeatureToggle.prototype.getFeatures = function (callback) {
    var self = this;
    var features = self.cache.get('features');
    if(features !== null) {
        callback(null, features);
    }
    else {
        this.apiRequest('/features', function (res) {
            //return res.features !== undefined ? callback(null, res.features) : callback(res.message, null);
            if (typeof res.features !== 'undefined') {
                self.cache.set('features', res.features);
                callback(null, res.features)
            }
            else {
                callback(res.message, null)
            }
        });
    }
};

FeatureToggle.prototype.isEnabled = function (feature, callback) {
    var self = this;
    this.apiRequest('/features/' + feature, function (res) {
        //return res.enabled !== undefined ? callback(null, res.enabled) : callback(res.message, null);
        if(typeof res.enabled !== 'undefined') {
            self.cache.set(feature, res.enabled);
            callback(null, res.enabled)
        }
        else {
            callback(res.message, null)
        }
    });
};
