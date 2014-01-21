(function(){var rsplit=function(string,regex){var result=regex.exec(string),retArr=new Array(),first_idx,last_idx,first_bit;while(result!=null){first_idx=result.index;last_idx=regex.lastIndex;if((first_idx)!=0){first_bit=string.substring(0,first_idx);retArr.push(string.substring(0,first_idx));string=string.slice(first_idx)}retArr.push(result[0]);string=string.slice(result[0].length);result=regex.exec(string)}if(!string==""){retArr.push(string)}return retArr},chop=function(string){return string.substr(0,string.length-1)},extend=function(d,s){for(var n in s){if(s.hasOwnProperty(n)){d[n]=s[n]}}};EJS=function(options){options=typeof options=="string"?{view:options}:options;this.set_options(options);if(options.precompiled){this.template={};this.template.process=options.precompiled;EJS.update(this.name,this);return}if(options.element){if(typeof options.element=="string"){var name=options.element;options.element=document.getElementById(options.element);if(options.element==null){throw name+"does not exist!"}}if(options.element.value){this.text=options.element.value}else{this.text=options.element.innerHTML}this.name=options.element.id;this.type="["}else{if(options.url){options.url=EJS.endExt(options.url,this.extMatch);this.name=this.name?this.name:options.url;var url=options.url;var template=EJS.get(this.name,this.cache);if(template){return template}if(template==EJS.INVALID_PATH){return null}try{this.text=EJS.request(url+(this.cache?"":"?"+Math.random()))}catch(e){}if(this.text==null){throw ({type:"EJS",message:"There is no template at "+url})}}}var template=new EJS.Compiler(this.text,this.type);template.compile(options,this.name);EJS.update(this.name,this);this.template=template};EJS.prototype={render:function(object,extra_helpers){object=object||{};this._extra_helpers=extra_helpers;var v=new EJS.Helpers(object,extra_helpers||{});return this.template.process.call(object,object,v)},update:function(element,options){if(typeof element=="string"){element=document.getElementById(element)}if(options==null){_template=this;return function(object){EJS.prototype.update.call(_template,element,object)}}if(typeof options=="string"){params={};params.url=options;_template=this;params.onComplete=function(request){var object=eval(request.responseText);EJS.prototype.update.call(_template,element,object)};EJS.ajax_request(params)}else{element.innerHTML=this.render(options)}},out:function(){return this.template.out},set_options:function(options){this.type=options.type||EJS.type;this.cache=options.cache!=null?options.cache:EJS.cache;this.text=options.text||null;this.name=options.name||null;this.ext=options.ext||EJS.ext;this.extMatch=new RegExp(this.ext.replace(/\./,"."))}};EJS.endExt=function(path,match){if(!path){return null}match.lastIndex=0;return path+(match.test(path)?"":this.ext)};EJS.Scanner=function(source,left,right){extend(this,{left_delimiter:left+"%",right_delimiter:"%"+right,double_left:left+"%%",double_right:"%%"+right,left_equal:left+"%=",left_comment:left+"%#"});this.SplitRegexp=left=="["?/(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/:new RegExp("("+this.double_left+")|(%%"+this.double_right+")|("+this.left_equal+")|("+this.left_comment+")|("+this.left_delimiter+")|("+this.right_delimiter+"\n)|("+this.right_delimiter+")|(\n)");this.source=source;this.stag=null;this.lines=0};EJS.Scanner.to_text=function(input){if(input==null||input===undefined){return""}if(input instanceof Date){return input.toDateString()}if(input.toString){return input.toString()}return""};EJS.Scanner.prototype={scan:function(block){scanline=this.scanline;regex=this.SplitRegexp;if(!this.source==""){var source_split=rsplit(this.source,/\n/);for(var i=0;i<source_split.length;i++){var item=source_split[i];this.scanline(item,regex,block)}}},scanline:function(line,regex,block){this.lines++;var line_split=rsplit(line,regex);for(var i=0;i<line_split.length;i++){var token=line_split[i];if(token!=null){try{block(token,this)}catch(e){throw {type:"EJS.Scanner",line:this.lines}}}}}};EJS.Buffer=function(pre_cmd,post_cmd){this.line=new Array();this.script="";this.pre_cmd=pre_cmd;this.post_cmd=post_cmd;for(var i=0;i<this.pre_cmd.length;i++){this.push(pre_cmd[i])}};EJS.Buffer.prototype={push:function(cmd){this.line.push(cmd)},cr:function(){this.script=this.script+this.line.join("; ");this.line=new Array();this.script=this.script+"\n"},close:function(){if(this.line.length>0){for(var i=0;i<this.post_cmd.length;i++){this.push(pre_cmd[i])}this.script=this.script+this.line.join("; ");line=null}}};EJS.Compiler=function(source,left){this.pre_cmd=["var ___ViewO = [];"];this.post_cmd=new Array();this.source=" ";if(source!=null){if(typeof source=="string"){source=source.replace(/\r\n/g,"\n");source=source.replace(/\r/g,"\n");this.source=source}else{if(source.innerHTML){this.source=source.innerHTML}}if(typeof this.source!="string"){this.source=""}}left=left||"<";var right=">";switch(left){case"[":right="]";break;case"<":break;default:throw left+" is not a supported deliminator";break}this.scanner=new EJS.Scanner(this.source,left,right);this.out=""};EJS.Compiler.prototype={compile:function(options,name){options=options||{};this.out="";var put_cmd="___ViewO.push(";var insert_cmd=put_cmd;var buff=new EJS.Buffer(this.pre_cmd,this.post_cmd);var content="";var clean=function(content){content=content.replace(/\\/g,"\\\\");content=content.replace(/\n/g,"\\n");content=content.replace(/"/g,'\\"');return content};this.scanner.scan(function(token,scanner){if(scanner.stag==null){switch(token){case"\n":content=content+"\n";buff.push(put_cmd+'"'+clean(content)+'");');buff.cr();content="";break;case scanner.left_delimiter:case scanner.left_equal:case scanner.left_comment:scanner.stag=token;if(content.length>0){buff.push(put_cmd+'"'+clean(content)+'")')}content="";break;case scanner.double_left:content=content+scanner.left_delimiter;break;default:content=content+token;break}}else{switch(token){case scanner.right_delimiter:switch(scanner.stag){case scanner.left_delimiter:if(content[content.length-1]=="\n"){content=chop(content);buff.push(content);buff.cr()}else{buff.push(content)}break;case scanner.left_equal:buff.push(insert_cmd+"(EJS.Scanner.to_text("+content+")))");break}scanner.stag=null;content="";break;case scanner.double_right:content=content+scanner.right_delimiter;break;default:content=content+token;break}}});if(content.length>0){buff.push(put_cmd+'"'+clean(content)+'")')}buff.close();this.out=buff.script+";";var to_be_evaled="/*"+name+"*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {"+this.out+" return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";try{eval(to_be_evaled)}catch(e){if(typeof JSLINT!="undefined"){JSLINT(this.out);for(var i=0;i<JSLINT.errors.length;i++){var error=JSLINT.errors[i];if(error.reason!="Unnecessary semicolon."){error.line++;var e=new Error();e.lineNumber=error.line;e.message=error.reason;if(options.view){e.fileName=options.view}throw e}}}else{throw e}}}};EJS.config=function(options){EJS.cache=options.cache!=null?options.cache:EJS.cache;EJS.type=options.type!=null?options.type:EJS.type;EJS.ext=options.ext!=null?options.ext:EJS.ext;var templates_directory=EJS.templates_directory||{};EJS.templates_directory=templates_directory;EJS.get=function(path,cache){if(cache==false){return null}if(templates_directory[path]){return templates_directory[path]}return null};EJS.update=function(path,template){if(path==null){return}templates_directory[path]=template};EJS.INVALID_PATH=-1};EJS.config({cache:true,type:"<",ext:".ejs"});EJS.Helpers=function(data,extras){this._data=data;this._extras=extras;extend(this,extras)};EJS.Helpers.prototype={view:function(options,data,helpers){if(!helpers){helpers=this._extras}if(!data){data=this._data}return new EJS(options).render(data,helpers)},to_text:function(input,null_text){if(input==null||input===undefined){return null_text||""}if(input instanceof Date){return input.toDateString()}if(input.toString){return input.toString().replace(/\n/g,"<br />").replace(/''/g,"'")}return""}};EJS.newRequest=function(){var factories=[function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new XMLHttpRequest()},function(){return new ActiveXObject("Microsoft.XMLHTTP")}];for(var i=0;i<factories.length;i++){try{var request=factories[i]();if(request!=null){return request}}catch(e){continue}}};EJS.request=function(path){var request=new EJS.newRequest();request.open("GET",path,false);try{request.send(null)}catch(e){return null}if(request.status==404||request.status==2||(request.status==0&&request.responseText=="")){return null}return request.responseText};EJS.ajax_request=function(params){params.method=(params.method?params.method:"GET");var request=new EJS.newRequest();request.onreadystatechange=function(){if(request.readyState==4){if(request.status==200){params.onComplete(request)}else{params.onComplete(request)}}};request.open(params.method,params.url);request.send(null)}})();EJS.Helpers.prototype.date_tag=function(c,g,e){if(!(g instanceof Date)){g=new Date()}var d=["January","February","March","April","May","June","July","August","September","October","November","December"];var p=[],b=[],f=[];var m=g.getFullYear();var o=g.getMonth();var h=g.getDate();for(var i=m-15;i<m+15;i++){p.push({value:i,text:i})}for(var r=0;r<12;r++){b.push({value:(r),text:d[r]})}for(var n=0;n<31;n++){f.push({value:(n+1),text:(n+1)})}var j=this.select_tag(c+"[year]",m,p,{id:c+"[year]"});var q=this.select_tag(c+"[month]",o,b,{id:c+"[month]"});var l=this.select_tag(c+"[day]",h,f,{id:c+"[day]"});return j+q+l};EJS.Helpers.prototype.form_tag=function(c,b){b=b||{};b.action=c;if(b.multipart==true){b.method="post";b.enctype="multipart/form-data"}return this.start_tag_for("form",b)};EJS.Helpers.prototype.form_tag_end=function(){return this.tag_end("form")};EJS.Helpers.prototype.hidden_field_tag=function(b,c,d){return this.input_field_tag(b,c,"hidden",d)};EJS.Helpers.prototype.input_field_tag=function(b,c,d,e){e=e||{};e.id=e.id||b;e.value=c||"";e.type=d||"text";e.name=b;return this.single_tag_for("input",e)};EJS.Helpers.prototype.is_current_page=function(b){return(window.location.href==b||window.location.pathname==b?true:false)};EJS.Helpers.prototype.link_to=function(d,b,c){if(!d){var d="null"}if(!c){var c={}}if(c.confirm){c.onclick=' var ret_confirm = confirm("'+c.confirm+'"); if(!ret_confirm){ return false;} ';c.confirm=null}c.href=b;return this.start_tag_for("a",c)+d+this.tag_end("a")};EJS.Helpers.prototype.submit_link_to=function(d,b,c){if(!d){var d="null"}if(!c){var c={}}c.onclick=c.onclick||"";if(c.confirm){c.onclick=' var ret_confirm = confirm("'+c.confirm+'"); if(!ret_confirm){ return false;} ';c.confirm=null}c.value=d;c.type="submit";c.onclick=c.onclick+(b?this.url_for(b):"")+"return false;";return this.start_tag_for("input",c)};EJS.Helpers.prototype.link_to_if=function(c,g,b,e,f,d){return this.link_to_unless((c==false),g,b,e,f,d)};EJS.Helpers.prototype.link_to_unless=function(c,f,b,e,d){e=e||{};if(c){if(d&&typeof d=="function"){return d(f,b,e,d)}else{return f}}else{return this.link_to(f,b,e)}};EJS.Helpers.prototype.link_to_unless_current=function(e,b,d,c){d=d||{};return this.link_to_unless(this.is_current_page(b),e,b,d,c)};EJS.Helpers.prototype.password_field_tag=function(b,c,d){return this.input_field_tag(b,c,"password",d)};EJS.Helpers.prototype.select_tag=function(g,d,c,e){e=e||{};e.id=e.id||g;e.value=d;e.name=g;var i="";i+=this.start_tag_for("select",e);for(var f=0;f<c.length;f++){var h=c[f];var b={value:h.value};if(h.value==d){b.selected="selected"}i+=this.start_tag_for("option",b)+h.text+this.tag_end("option")}i+=this.tag_end("select");return i};EJS.Helpers.prototype.single_tag_for=function(b,c){return this.tag(b,c,"/>")};EJS.Helpers.prototype.start_tag_for=function(b,c){return this.tag(b,c)};EJS.Helpers.prototype.submit_tag=function(b,c){c=c||{};c.type=c.type||"submit";c.value=b||"Submit";return this.single_tag_for("input",c)};EJS.Helpers.prototype.tag=function(f,d,e){if(!e){var e=">"}var g=" ";for(var b in d){if(d[b]!=null){var c=d[b].toString()}else{var c=""}if(b=="Class"){b="class"}if(c.indexOf("'")!=-1){g+=b+'="'+c+'" '}else{g+=b+"='"+c+"' "}}return"<"+f+g+e};EJS.Helpers.prototype.tag_end=function(b){return"</"+b+">"};EJS.Helpers.prototype.text_area_tag=function(b,c,d){d=d||{};d.id=d.id||b;d.name=d.name||b;c=c||"";if(d.size){d.cols=d.size.split("x")[0];d.rows=d.size.split("x")[1];delete d.size}d.cols=d.cols||50;d.rows=d.rows||4;return this.start_tag_for("textarea",d)+c+this.tag_end("textarea")};EJS.Helpers.prototype.text_tag=EJS.Helpers.prototype.text_area_tag;EJS.Helpers.prototype.text_field_tag=function(b,c,d){return this.input_field_tag(b,c,"text",d)};EJS.Helpers.prototype.url_for=function(b){return'window.location="'+b+'";'};EJS.Helpers.prototype.img_tag=function(d,c,b){b=b||{};b.src=d;b.alt=c;return this.single_tag_for("img",b)};function dialog(w){var d=w.className,u=w.funs,e=w.url||"dialog",g="./tpl/"+e+".ejs?v=123";var p=w.loadingContent||new EJS({url:g}).render({md:w});var r=document.createElement("div"),l=document.createElement("div"),i=document.createElement("div"),f=document.createElement("div");r.className="cover";l.className="dialog";f.className="clear";if(d){$(r).addClass(d)}i.className="dialogContent";i.innerHTML=p;l.appendChild(i);r.appendChild(l);document.body.appendChild(r);document.body.appendChild(f);r.style.visibility="hidden";var c=document.body.scrollTop;var q=l.offsetHeight;var n=c+window.innerHeight/2-q/2-10;var v=document.body.scrollHeight;if(n<20){n=20}var b=0;var s=function(){b++;q=l.offsetHeight;if(!q&&b<20){setTimeout(function(){s()},100)}else{n=c+window.innerHeight/2-q/2-10;if(n<=c){n=c}l.style.top=n.toString()+"px";r.style.visibility="visible"}};s();var j=0;var o=function(){var t=f.offsetTop;var h=t>v?t:v;r.style.height=h.toString()+"px";j++;if(t<v&&j<20){setTimeout(o,100)}else{$(f).remove()}};o();var m=$(l).find(".dialogButton");if(u&&u.length){m.each(function(t,h){if(u[t]){$(this).click(function(){u[t]()})}})}$(l).find(".J-dialogClose").click(function(){$(r).remove();$(f).remove();if(w.closeBack){w.closeBack()}return false});return r}(function(){var b={set:function(d,e,g){var f=d+"="+encodeURIComponent(e)+";max-age="+g+";";document.cookie=f},get:function(d){var f=null;var e=d+"=";if(document.cookie.length>0){offset=document.cookie.indexOf(e);if(offset!=-1){offset+=e.length;end=document.cookie.indexOf(";",offset);if(end==-1){end=document.cookie.length}f=unescape(document.cookie.substring(offset,end))}}return f}};var c={validateUser:function(d,h,e,g){var f=JSON.stringify({thirdID:d,mac:h,imei:e});com.ajax({url:com.configs.apiHost+"validateUser",data:{param:f},checkStatus:true,success:function(i){if(i.status&&i.status.status_code=="PHONE_REBIND"){var j={className:"dialog-rebind",url:"tpl/dialog-rebind.ejs?vv=1234",funs:[function(){window.location.href="step3-1.html"}]};dialog(j);return false}else{if(i.status&&i.status.status_code){return com.checkStatus(i)}}if(g&&i){g(i)}}})},validatePhone:function(e,d,j,f,i,h){var g=JSON.stringify({thirdID:e,mac:j,imei:f,phone:d});com.ajax({url:com.configs.apiHost+"validatePhone",data:{param:g},success:function(l){if(i&&l){i(l)}}})},renewUser:function(d,e,g){var f=JSON.stringify({phone:d,code:e});com.ajax({url:com.configs.apiHost+"renewUser",data:{param:f},success:function(h){if(g&&h){g(h)}}})},checkUserHasLogin:function(e,f){if(!e){e=com.query("userID")||com.query("state")}if(!e){return}var d=JSON.stringify({state:e});com.ajax({url:com.configs.apiHost+"checkUserHasLogin",data:{param:d},hideLoading:0,success:function(g){if(f&&g){f(g)}}})},setPhonePassword:function(d,m,j,l){var i=com.query("callback"),e=com.query("callerId"),h=com.query("userID"),f=com.query("sign");var g=JSON.stringify({code:d,phone:m,password:j});com.ajax({url:com.configs.apiHost+"setPhonePassword",data:{param:g,callbackUrl:i,callerId:e,userId:h,sign:f},success:function(n){if(l&&n){l(n)}}})}};$("#toStep2").click(function(){var d=$("#phone"),f=$("#pwd"),e={};if(!d.val()||!/^1\d{10}$/.test(d.val())){e.content="请输入正确的手机号码";e.closeBack=function(){d.focus()};dialog(e);return false}if(!f.val()){e.content="请输入密码";e.closeBack=function(){f.focus()};dialog(e);return false}});$("#getCode").click(function(){var h=$(this),e={};var d=$("#phone").val();if(!d||!/^1\d{10}$/.test(d)){e.content="请输入正确的手机号码";e.closeBack=function(){$("#phone").focus()};dialog(e);return false}var i=com.query("mac")||"",g=com.query("imei")||"",f=com.query("thirdID");b.set("phoneNum",d,60);c.validatePhone(f,d,i,g,function(j){b.set("codeTime",1,60);b.set("setCodeTime",new Date().getTime()+60*1000,60);setCodeButton()},true)});window.onload=function(){$("body").removeClass("bodyLoading")}})();var _gaq=_gaq||[];_gaq.push(["_setAccount","UA-41808505-1"]);_gaq.push(["_setDomainName","koudai.com"]);_gaq.push(["_trackPageview"]);(function(){var c=document.createElement("script");c.type="text/javascript";c.async=true;c.src=("https:"==document.location.protocol?"https://ssl":"http://www")+".google-analytics.com/ga.js";var b=document.getElementsByTagName("script")[0];b.parentNode.insertBefore(c,b)})();var JSON;if(!JSON){JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==="string"){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());(function(){window.com={isFunction:function(b){return toString.call(b)=="[object Function]"},isString:function(b){return toString.call(b)=="[object String]"},isArray:function(b){return toString.call(b)=="[object Array]"},isObject:function(b){return toString.call(b)=="[object Object]"},render:function(d,c,b){b=b?b:d+"Dest";new EJS({element:d}).update(b,{md:c})},getRender:function(c,b){return new EJS({element:c}).render({md:b})},configs:{apiHost:"http://logintest.koudai.com/udc/restore/"},loading:{show:function(){var b='<div class="box boxCenter"></div>';dialog({loadingContent:b,className:"loading"})},hide:function(){$(".loading").remove()}},ajax:function(e){var c=this;if(!e.hideLoading){this.loading.show()}var d=function(f){var h=0;if(f.status&&f.status.status_code){h=f.status.status_code}if(h){if(f.result.desc){var g={content:f.result.desc};dialog(g)}return false}else{return true}};this.checkStatus=d;var b={type:"GET",dataType:"jsonp",url:c.configs.host,data:"",success:function(f){},error:function(){alert("链接失败")},complete:function(f){c.loading.hide()}};this.mix(b,e);b.success=function(f){if(!e.checkStatus&&d(f)){e.success(f)}if(e.checkStatus){e.success(f)}};$.ajax(b)},injectFollowDiv:function(g,e){var c=this;var h=g.pageY,b=g.pageX,f=document.createElement("div");f.className="followMouse bodyClickRemove";f.style.left=b.toString()+"px";f.style.top=h.toString()+"px";f.innerHTML=e;var d=document.createElement("div");d.className="close";d.style.right="-10px";d.style.top="-10px";d.onclick=function(){$(this).parent().remove()};f.appendChild(d);setTimeout(function(){$("body").append(f);if(f.offsetWidth+b>=document.body.offsetWidth){var i=b-f.offsetWidth;f.style.left=i.toString()+"px"}f.style.display="block"},100);return false},mix:function(d,c){var b;for(b in d){if(d.hasOwnProperty(b)&&c.hasOwnProperty(b)&&c[b]){d[b]=c[b]}}},clon:function(e){var c,b=this;var d=function(g,f){if(b.isObject(g)){for(k in g){if(g.hasOwnProperty(k)){if(b.isObject(g[k])){f[k]={};d(g[k],f[k])}else{if(b.isArray(g[k])){f[k]=[];d(g[k],f[k])}else{f[k]=g[k]}}}}}else{if(b.isArray(g)){for(k in g){if(b.isObject(g[k])){f[k]={};d(g[k],f[k])}else{if(b.isArray(g[k])){f[k]=[];d(g[k],f[k])}else{f[k]=g[k]}}}}}}(e,c);return c},queryArray:[],query:function(h){if(!h){return false}if(this.queryArray.length){return this.queryArray[h]}else{var g=window.location.href;g=g.replace(/#[^&]*$/,"");var j=/\?(.+)/,d=g.match(j);if(d&&d[1]){var i=d[1].split("&");for(a in i){var c=i[a].split("="),f=c[0],e=c[1];this.queryArray[f]=e}return this.queryArray[h]}else{return""}}}}})();