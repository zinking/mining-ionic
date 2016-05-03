function BaseRestfulService(endPoint, TOKEN, $q, $http) {
    this.$q = $q;
    this.$http = $http;
    this._deferred = $q.defer();
    this.promise = this._deferred.promise;
    this._data = [];
    this.used = false;
    
    //TODO Set a cache here to avoid requesting data too frequently.

    if (!TOKEN) {
    	//throw new Error("Please login and procceed your actions!");
    }
    this.requestSettings = {
        method: 'GET',
        url: endPoint,
        headers: {
            'X-Spree-Token': TOKEN
        },
        timeout: 60000
    };
}

BaseRestfulService.prototype.POST = function(data, success, error, retryable) {
    this.requestSettings.method = 'POST';
    this.requestSettings.data = data;
    this._process(success, error);
    
    return this.promise;
};

BaseRestfulService.prototype.PUT = function(success, error, retryable) {
    this.requestSettings.method = 'PUT';
    this._process(success, error);
    
    return this.promise;
};

BaseRestfulService.prototype.GET = function(success, error, retryable) {
    this.requestSettings.method = 'GET';
    this._process(success, error);

    return this.promise;
};

BaseRestfulService.prototype._process = function(success, error) {
    if (this.used) {
    	this._deferred = this.$q.defer();
        this.promise = this._deferred.promise;
    }
    
    var me = this;
    
    this.$http(this.requestSettings).
        success(function(rawData) {
            var data = success.call(me, rawData);
            me.used = true;
            me._deferred.resolve(data);
        }).
        error(function(rawData){
            var data = error.call(me, rawData);
            me.used = true;
            me._deferred.reject(data);
        });
};
