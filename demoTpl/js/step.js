(function () {

	var cookie = {
		set: function (name, value, seconds) {
			var str = name + '=' + encodeURIComponent(value) + ';max-age=' + seconds + ';';
			document.cookie = str;
		},
		get: function (name) {
			var cookieValue = null;
			var search = name + "=";
			if (document.cookie.length > 0) {
				offset = document.cookie.indexOf(search);
				if (offset != -1) {
					offset += search.length;
					end = document.cookie.indexOf(";", offset);
					if (end == -1) end = document.cookie.length;
					cookieValue = unescape(document.cookie.substring(offset, end))
				}
			}
			return cookieValue;
		}
	};


	var data = {
		validateUser: function (thirdID, mac, imei, callback) {
			var data = JSON.stringify({thirdID: thirdID, mac: mac, imei: imei});
			com.ajax({
				url: com.configs.apiHost + 'validateUser',
				data: {param: data},
				checkStatus: true,
				success: function (result) {
					if (result.status && result.status.status_code == 'PHONE_REBIND') {

						var config = {
							className: 'dialog-rebind',
							url: 'tpl/dialog-rebind.ejs?vv=1234',
							funs: [function () {
								window.location.href = 'step3-1.html';
							}]
						};

						dialog(config);
						return false;

					} else {
						if (result.status && result.status.status_code) {
							return com.checkStatus(result);
						}
					}
					if (callback && result) {
						callback(result);
					}
				}
			})
		},

		validatePhone: function (thirdID, phone, mac, imei, callback, checkstats) {
			var data = JSON.stringify({thirdID: thirdID, mac: mac, imei: imei, phone: phone});
			com.ajax({
				url: com.configs.apiHost + 'validatePhone',
				data: {param: data},
				success: function (result) {
					if (callback && result) {
						callback(result);
					}
				}
			})
		},

		renewUser: function (phone, code, callback) {
			var data = JSON.stringify({phone: phone, code: code});
			com.ajax({
				url: com.configs.apiHost + 'renewUser',
				data: {param: data},
				success: function (result) {
					if (callback && result) {
						callback(result);
					}
				}
			})
		},

		checkUserHasLogin: function (state, callback) {
			if (!state) {
				state = com.query('userID') || com.query('state');
			}

			if (!state) {
				return;
			}

			var data = JSON.stringify({state: state});
			com.ajax({
				url: com.configs.apiHost + 'checkUserHasLogin',
				data: {param: data},
				hideLoading: 0,
				success: function (result) {
					if (callback && result) {
						callback(result);
					}
				}
			})
		},

		setPhonePassword: function (code, phoneNum, password, callback) {

			var callbackUrl = com.query('callback'),
				callerId = com.query('callerId'),
				userId = com.query('userID'),
				sign = com.query('sign');


			var data = JSON.stringify(
				{
					code: code,
					phone: phoneNum,
					password: password
				}
			);

			com.ajax({
				url: com.configs.apiHost + 'setPhonePassword',
				data: {
					param: data,
					callbackUrl: callbackUrl,
					callerId: callerId,
					userId: userId,
					sign: sign
				},
				success: function (result) {
					if (callback && result) {
						callback(result);
					}
				}
			})
		}
	};


	$('#toStep3').click(function(){
		var thirdID = $('#thirdID'),
			val = thirdID.val().trim(),
			config = {};

		if(!val){
			config.content='请输入淘宝账号';
			config.closeBack = function(){
				thirdID.focus();
			};

			dialog(config);

			return false;
		}
	});


	//获取验证码
	$('#getCode').click(function () {
		var obj = $(this),
			config={};

		var phone = $('#phone').val();
		if (!phone || !/^1\d{10}$/.test(phone)) {

			config.content='请输入正确的手机号码';
			config.closeBack = function(){
				$('#phone').focus();
			};

			dialog(config);

			return false;
		}

		var mac = com.query('mac') || '',
			imei = com.query('imei') || '',
			thirdID = com.query('thirdID');

		cookie.set('phoneNum', phone, 60);

		data.validatePhone(thirdID, phone, mac, imei, function (result) {
			cookie.set('codeTime', 1, 60);
			cookie.set('setCodeTime', new Date().getTime() + 60 * 1000, 60);

			setCodeButton();
		}, true);
	});


	$('#checkCode').click(function(){
		var obj = $('#code'),
			config = {},
			code = obj.val().trim();

		if(!code || code.length<6){
			config.content='请输入正确的验证码';
			config.closeBack = function(){
				obj.focus();
			};

			dialog(config);

			return false;
		}
	});



	window.onload = function () {
		$('body').removeClass('bodyLoading');
	};

})();


var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-41808505-1']);
_gaq.push(['_setDomainName', 'koudai.com']);
_gaq.push(['_trackPageview']);

(function () {
	var ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
})();



