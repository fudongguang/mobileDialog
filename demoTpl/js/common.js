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

		render: function (source, data, dest) {
			dest = dest ? dest : source + "Dest";
			new EJS({element: source}).update(dest, {md: data});
		},

		getRender: function (source, data) {
			return new EJS({element: source}).render({md: data});
		},


		loading: {
			show: function () {
				var str = '<div class="box boxCenter"></div>';
				dialog({loadingContent:str,className:'loading'});
			},
			hide: function () {
				$('.loading').remove();
			}
		},


		ajax: function (configs) {
			var self = this;

			if(!configs.hideLoading){
				this.loading.show();
			}

			var checkStatus = function (result) {
				var status_code = 0;
				if (result.status && result.status.status_code) {
					status_code = result.status.status_code;
				}

				if (status_code) {
					if(result.result.desc){
						var config={
							content:result.result.desc
						};

						dialog(config);
					}
					return false;
				}else{
					return true;
				}
			};

			this.checkStatus = checkStatus;

			var a = {
				type: 'GET',
				dataType: 'jsonp',
				url: self.configs.host,
				data: '',
				success: function (result) {

				},
				error: function () {
					alert('链接失败');
				},
				complete: function (result) {
					self.loading.hide();
				}
			};



			this.mix(a, configs);
			a.success = function (result) {
				if (!configs.checkStatus && checkStatus(result)) {
					configs.success(result);
				}

				if(configs.checkStatus){
					configs.success(result);
				}
			};

			$.ajax(a);
		},



		/**
		 * 合并对象
		 * @param target
		 * @param source
		 */

		mix: function (target, source) {
			var k;
			for (k in target) {
				if (target.hasOwnProperty(k) && source.hasOwnProperty(k) && source[k]) {
					target[k] = source[k];
				}
			}
		},


		queryArray: [],
		query: function (name) {
			if (!name) {
				return false;
			}

			if (this.queryArray.length) {
				return this.queryArray[name];
			} else {
				var href = window.location.href;
				href=href.replace(/#[^&]*$/,'');//去除锚点

				var reg = /\?(.+)/,
					m = href.match(reg);

				if (m && m[1]) {
					var s = m[1].split('&');
					for (a in s) {
						var b = s[a].split('='),
							k = b[0],
							v = b[1];

						this.queryArray[k] = v;
					}

					return this.queryArray[name];

				} else {
					return '';
				}
			}
		}
	};
})();