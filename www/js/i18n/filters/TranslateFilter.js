angular.module('mining.globalization')
	.filter('translate', function($locale, TRANSLATED_STRING_VALUE) {
	    return function(key, params) {
	        return TRANSLATED_STRING_VALUE[$locale.id + '_' + key];
	    };
	})
	.constant('TRANSLATED_STRING_VALUE', {//TODO Use local storage for this.
		'en-us_product' : '产品',

		'zh-cn_product' : '产品',
		'zh-cn_checkout' : '购买确认'
	});