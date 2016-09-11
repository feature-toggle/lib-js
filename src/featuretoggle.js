var FeatureToggle;

(function () {
    'use strict';

    FeatureToggle = function(customerKey, environmentKey, options) {
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
            'debug': false
        }, options);

        this.options.auth = this.customerKey + ':' + this.environmentKey;
    };

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
        this.apiRequest('/features', function (res) {
            return res.features !== undefined ? callback(null, res.features) : callback(res.message, null);
        });
    };

    FeatureToggle.prototype.isEnabled = function (feature, callback) {
        this.apiRequest('/features/' + feature, function (res) {
            return res.enabled !== undefined ? callback(null, res.enabled) : callback(res.message, null);
        });
    };
})();