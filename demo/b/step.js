(function(){
	window.com={

		isFunction: function (it) {
			return toString.call(it) == "[object Function]";
		},

		isString: function (it) {
			return toString.call(it) == "[object String]";
		},

		isArray: function (it) {
			return toString.call(it) == "[object Array]";
		},

		isObject: function (it) {
			return toString.call(it) == "[object Object]";
		},

		getRender: function (url, config) {
			return new EJS({url: url}).render({md: config})
		},

		dialog:function(config){
			if(!config.content){
				var url = config.url || 'tpl/dialog';
				delete config.url;
				config.content = this.getRender(url,config);
			}
			return dialog(config);
		},
		alert:function(config){

			if(!config){
				config={};
			}
			if(!config.content){
				config.url = config.url || 'tpl/alert';
			}

			config.className='alertDialog';

			return this.dialog(config)
		}

	};
})();


(function(){
	window.com={

		//渲染数据返回html
		getRender: function (url, config) {
			return new EJS({url: url}).render({md: config})
		},

		dialog:function(config){
			if(!config.content){
				var url = config.url || 'tpl/dialog';//这个是模板文件
				delete config.url;
				config.content = this.getRender(url,config);//获取渲染后的html
			}
			return dialog(config);
		},
		alert:function(config){

			if(!config){
				config={};
			}
			if(!config.content){
				config.url = config.url || 'tpl/alert';//这个是模板文件
			}

			config.className='alertDialog';

			return this.dialog(config)
		}

	};
})();