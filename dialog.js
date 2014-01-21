/**
 * Created with IntelliJ IDEA.
 * User: fudongguang
 * Date: 13-9-3
 * Time: PM4:20
 * To change this template use File | Settings | File Templates.
 */


(function(){

	var dialog = function(config){
		var className  = config.className,
			funs = config.funs,
			content = config.content || '',
			coverEl = document.createElement('div'),//遮罩图层
			dialogEl = document.createElement('div'),//dialog外围图层
			contentEl = document.createElement('div'),//内容图层
			tokenEl = document.createElement('div');//在body最下面写入token

		coverEl.className = 'cover';
		dialogEl.className = 'dialog';
		tokenEl.className='clear';

		if (className) {
			$(coverEl).addClass(className);
		}

		contentEl.className = 'dialogInner';
		contentEl.innerHTML = content;

		dialogEl.appendChild(contentEl);
		coverEl.appendChild(dialogEl);

		document.body.appendChild(coverEl);
		document.body.appendChild(tokenEl);
		coverEl.style['visibility'] = 'hidden';

		var scrollTop = document.body.scrollTop,
			h = dialogEl.offsetHeight,
			t = scrollTop+ window.innerHeight / 2 - h / 2 - 10,
			a = document.body.scrollHeight;

		if(t<20){
			t=20;//与浏览器上边框高度最低为20
		}

		var getdialogElHeightTimes = 0;
		(function(){
			getdialogElHeightTimes++;
			h = dialogEl.offsetHeight;
			if(!h && getdialogElHeightTimes<20){
				setTimeout(arguments.callee(),50)
			}else{
				t = scrollTop+ window.innerHeight / 2 - h / 2 - 10;
				if(t<=scrollTop){
					t=scrollTop;
				}

				dialogEl.style['top'] = t.toString() + 'px';
				coverEl.style['visibility'] = 'visible';
			}
		}());


		var setCoverHeightTimes=0;
		(function(){
			var tokenTop = tokenEl.offsetTop;
			var coverHeight = tokenTop>a?tokenTop:a;
			coverEl.style['height'] = coverHeight.toString() + 'px';

			setCoverHeightTimes++;

			if(tokenTop<a && setCoverHeightTimes<20){
				setTimeout(arguments.callee,50);
			}else{
				$(tokenEl).remove();
			}
		}());


		var dialogButtons = $(dialogEl).find('.J-dialogButton');

		if (funs && funs.length) {
			dialogButtons.each(function (k, v) {
				if (funs[k]) {
					$(this).click(function () {
						funs[k]();
					})
				}
			});
		}

		$(dialogEl).find('.J-dialogClose').click(function () {
			$(coverEl).remove();
			$(tokenEl).remove();
			if(config.closeBack){
				config.closeBack();
			}
			return false;
		});


		return coverEl;

	};

	window.dialog = dialog;
}());

