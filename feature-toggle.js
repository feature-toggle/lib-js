function FeatureToggle(customerKey, environmentKey) {
    this.customerKey = customerKey,
            this.environmentKey = environmentKey,
            this.api = "https://www.feature-toggle.com/api"
}
!function () {
    "use strict"
}(),
        FeatureToggle.prototype.apiRequest = function (endpoint, callback) {
            var request = new XMLHttpRequest;
            request.open("GET", this.api + endpoint),
                    request.setRequestHeader("Authorization", this.customerKey + ":" + this.environmentKey),
                    request.onreadystatechange = function () {
                        if (4 === request.readyState) {
                            var res = JSON.parse(request.responseText);
                            var data = {
                                success: false,
                                message: '',
                            };
                            switch (request.status) {
                                case 200:
                                {
                                    for (var attr in res) {
                                        data[attr] = res[attr];
                                    }
                                    break;
                                }
                                default:
                                {
                                    data.message = res.error.message;
                                    break;
                                }
                            };
                            callback(data);
                        }
                    },
                    request.send(null);
        },
        FeatureToggle.prototype.getFeatures = function (callback) {
            this.apiRequest('/features', function (res) {
                res.success ? callback(null, res.features) : callback(res.message, null)
            });
        },
        FeatureToggle.prototype.isEnabled = function (feature, callback) {
            this.apiRequest('/features/' + feature, function (res) {
                res.success ? callback(null, res.enabled) : callback(res.message, null)
            });
        };