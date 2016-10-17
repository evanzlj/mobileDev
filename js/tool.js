/**
 * toolKit工具集
 * 包括：extend，弹框，模板，节流，工具包box，String/Date/Array拓展工具，cookie
 * 示例见页面
 */
"use strict";
;(function(name,definition){
    //检测上下文环境是否为AMD或CMD
    var hasDefine = typeof define === 'function',
        // 检测上下文环境是否为Node
        hasExports = null,
        env = this||window;
    try{
        hasExports = typeof module !== 'function' && module.exports;
    }catch(e){
        console.log(e)
    }
    if(hasDefine){
        //AMD环境或CMD环境
        define(definition);
    }else if(hasExports){
        //定义为普通Node模块
        module.exports = definition();
    }else{
        //将模块的执行结果挂在window变量中，在浏览器中this指向window对象
    	env[name] = definition();
    }

})('toolKit',function(){
    var o = {};
    function init(){
        //初始化
        arrayExtend();
        dateExtend();
        stringExtend();
        return o;
    }

    /**
     * 对象深拷贝
     * 参数：需合并对象1, 需合并对象2
     * 返回合并后对象
     */
    o.extend = function() {
        var copyIsArray,
            toString = Object.prototype.toString,
            hasOwn = Object.prototype.hasOwnProperty,
        class2type = {
            '[object Boolean]' : 'boolean',
            '[object Number]' : 'number',
            '[object String]' : 'string',
            '[object Function]' : 'function',
            '[object Array]' : 'array',
            '[object Date]' : 'date',
            '[object RegExp]' : 'regExp',
            '[object Object]' : 'object'
        },
        type = function(obj) {
            return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
        },
        isWindow = function(obj) {
            return obj && typeof obj === "object" && "setInterval" in obj;
        },
        isArray = Array.isArray || function(obj) {
            return type(obj) === "array";
        },
        isPlainObject = function(obj) {
            if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
                return false;
            }
            if (obj.constructor && !hasOwn.call(obj, "constructor")
                    && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
            var key;
            for (key in obj) {
            }
            return key === undefined || hasOwn.call(obj, key);
        },
        extend = function(target, options) {
            var deep = true,
            	src,copy,clone;
            for (var name in options) {
                src = target[name];
                copy = options[name];
                if (target === copy) { continue; }
                if (deep && copy
                        && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && isArray(src) ? src : [];
                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }
                    target[name] = extend(clone, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
            return target;
        };
        return extend;
    }();

    /*  弹框
        参数对象：{id:"xx",title:"xxx"}
        "id":         默认ID为“pop_”加上时间毫秒数
        "title":      默认为"提示信息"
        "message":    默认为"操作成功！",//弹框文案
        "btn":        默认为["确定"],//按钮显示文字自定义，可定义两个按钮
        "callback":   默认为[],//长度为2分别处理两个按钮事件
        "autoClose":  默认为false, //自动关闭，仅在按钮数为1时起效
        "closeIcon":  默认为false,//右上角关闭按钮，默认无
        "closeType":  默认为"close" ，设"hide"为只隐藏不移除
        返回：弹框DOM id
     */
    o.pop = function(s){
        var pop = new Popup(s);
        var id = pop.init();
        pop = null;
        return id;
    };

    /* 边缘弹框
	    参数对象：{id:"xx",title:"xxx"}
	    "id":         默认ID为“pop_”加上时间毫秒数
	    "htmlCode":   默认为"",//弹窗html代码
	    "btn":        默认为[],//按钮显示文字自定义，可定义两个按钮，也可以木有按钮~
	    "callback":   默认为[],//长度为2分别处理两个按钮事件
	    "autoClose":  默认为false, //自动关闭，仅在按钮数为1时起效
	    "closeIcon":  默认为false,//右上角关闭按钮，默认无
	    "closeType":  默认为"close" ，设"hide"为只隐藏不移除
	    "popPosition":默认为"top", //弹框位置 默认在上面
	    "isAnimate" : 默认为false //启用动画效果
	    返回：弹框DOM id
	*/
	o.edge = function(s){
	    var borderPop = new BorderPop(s);
	    var id = borderPop.init();
	    borderPop = null;
	    return id;
	};
    /**
     * 调整图片宽高
     * 参数：img图片元素，w需要设置的宽度，h高度（非必填）
     */
    o.adjustImage = function(img, w, h){
        var img = img;
        var w = w;
        if(!h){ var h = w; }
        else{ var h = h; }
        var par = img.parentNode;
        par.style.width = w + 'px';
        par.style.height = h + 'px';
        par.style.overflow = "hidden";
        var temp = new Image();
        temp.src = img.src;
        temp.onload = function(){
            var ow = (img.width);
            var oh = (img.height);
            var oa = ow*1.0/oh*1.0;
            var a  = w*1.0/h*1.0;
            if(a === oa){
                img.width = w;
                img.height= h;
            }else if(a > oa){
                img.width = w;
                img.height = w/oa;
                img.style.marginTop = -0.5*(w/oa-h)+"px";
            }else if(a < oa){
                img.width=h*oa;
                img.height=h;
                img.style.marginLeft = -0.5*(h*oa-w)+"px";
            }
            temp = null;
        }
    };
    /* 工具集 */
    o.box = {
        /**
         * 判断字符串是否为email地址
         * 参数：字符串
         * 返回布尔值true/false
         */

        isEmail:function (str) {
            return /^[A-Z_a-z0-9-\.]+@([A-Z_a-z0-9-]+\.)+[a-z0-9A-Z]{2,4}$/.test(str);
        },

        /**
         * 判断字符串是否为手机号码
         * 参数：字符串
         * 返回布尔值true/false
         */

        isMobile:function (str) {
            return /^((\(\d{2,3}\))|(\d{3}\-))?((1[3457]\d{9})|(18\d{9}))$/.test(str);
        }
        ,
        /**
         * 判断字符串是否为固话电话号码（带区号，格式包括XXX-XXXXXXXX, XXXXXXXXXXX）
         * 参数：字符串
         * 返回布尔值true/false
         */
    	isTel : function(str) {
    		return /^\d{3,4}(-)?\d{7,8}$/.test(str);
    	},

        /**
         * 判断字符串是否为Url地址
         * 参数：字符串
         * 返回布尔值true/false
         */

        isUrl:function (str) {
            return /^(http:|ftp:)\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"])*$/.test(str);
        },

        /**
         * 判断字符串是否为IPV4地址
         * 参数：字符串
         * 返回布尔值true/false
         */

        isIp:function (str) {
            return /^(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5])$/.test(str);
        },
        
        /**
         * 判断非负整数
         * 参数：字符串
         * 返回布尔值true/false
         */
        isNonNegativeInt: function (str) {
            return /^\d+$/.test(str);
        },
        /**
         * 小数点后最多为2位的浮点数 
         * 参数：字符串
         * 返回布尔值true/false
         */
        isFloatNum: function (str) {
            return /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/.test(str);
        },
        /**
         * 判断正整数
         * 参数：字符串
         * 返回布尔值true/false
         */
        isNaturalNum: function (str) {
            return /^[1-9]\d*$/.test(str);
        },

        /**
         * 判断字符串是否为中文
         * 参数：字符串
         * 返回布尔值true/false
         */

        isChinese:function (str) {
            if (str == "")
                return false;
            var pattern = /^([\u4E00-\u9FA5]|[\uFE30-\uFFA0])*$/;
            if (pattern.test(str)) {
                return true;
            }
            else {
                return false;
            }
        },
        /**
         * 判断只是汉字 字母 数字 下划线
         * 参数：字符串
         * 返回布尔值true/false
         */
        isNickname:function(str){
    		return /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(str);  
    	},
    	 /**
         * 判断只是 字母 数字 下划线
         * 参数：字符串
         * 返回布尔值true/false
         */
    	isAccount : function(str) {
    		return /^[a-zA-Z0-9_\.]+$/g.test(str);
    	},
		 /**
         * 判断只是 字母 数字 ，多用于验证密码
         * 参数：字符串
         * 返回布尔值true/false
         */
		checkPwd: function (str) {
			return /^[a-zA-Z0-9]+$/g.test(str);
		},
        /**
         * 判断字符串是否为json格式
         * 参数：字符串
         * 返回布尔值true/false
         */

        isJSON:function (str) {
            if (!(typeof str === 'string') || str === '') return false;
            str = str.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
            return ( /^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/ ).test(str);
        },
        /**
         * 检查身份证号，0为合法，0为合法，0为合法，重要的事情说三遍
         * 参数：字符串
         * 返回值：0 1 2 3 4 0为合法，0为合法，0为合法，重要的事情说三遍
         */
        checkIDCard : function(idcardx) {// 用于验证身份证信息正确性的方法
    		var area = {
    			11 : "北京",
    			12 : "天津",
    			13 : "河北",
    			14 : "山西",
    			15 : "内蒙古",
    			21 : "辽宁",
    			22 : "吉林",
    			23 : "黑龙江",
    			31 : "上海",
    			32 : "江苏",
    			33 : "浙江",
    			34 : "安徽",
    			35 : "福建",
    			36 : "江西",
    			37 : "山东",
    			41 : "河南",
    			42 : "湖北",
    			43 : "湖南",
    			44 : "广东",
    			45 : "广西",
    			46 : "海南",
    			50 : "重庆",
    			51 : "四川",
    			52 : "贵州",
    			53 : "云南",
    			54 : "西藏",
    			61 : "陕西",
    			62 : "甘肃",
    			63 : "青海",
    			64 : "宁夏",
    			65 : "新疆",
    			71 : "台湾",
    			81 : "香港",
    			82 : "澳门",
    			91 : "国外"
    		};
    		var idcard = idcardx.toUpperCase();
    		var Y, JYM;
    		var S, M;
    		var idcard_array = [];
    		idcard_array = idcard.split("");
    		if (!area[parseInt(idcard.substr(0, 2))]) {// 地区检验
    			return 4;
    		}
    		var ereg="";

    		// 身份号码位数及格式检验
    		switch (idcard.length) {
    		case 15:
    			var year = parseInt(idcard.substr(6, 2)) + 1900;
    			if ((year % 400 == 0) || (year % 100 != 0) && (year % 4 == 0)) {

    				ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/;
    				// 测试出生日期的合法性
    			} else {
    				ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/;
    				// 测试出生日期的合法性
    			}
    			if (ereg.test(idcard)) {
    				return 0;
    			} else {
    				return 2;
    			}
    			break;
    		case 18:
    			// 18位身份号码检测
    			// 出生日期的合法性检查
    			// 闰年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))
    			// 平年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))
    			var year = parseInt(idcard.substr(6, 4));
    			if ((year % 400 == 0) || (year % 100 != 0) && (year % 4 == 0)) {
    				ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/;
    				// 闰年出生日期的合法性正则表达式
    			} else {
    				ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/;
    				// 平年出生日期的合法性正则表达式
    			}
    			if (ereg.test(idcard)) {// 测试出生日期的合法性
    				// 计算校验位
    				S = (parseInt(idcard_array[0]) + parseInt(idcard_array[10]))
    						* 7
    						+ (parseInt(idcard_array[1]) + parseInt(idcard_array[11]))
    						* 9
    						+ (parseInt(idcard_array[2]) + parseInt(idcard_array[12]))
    						* 10
    						+ (parseInt(idcard_array[3]) + parseInt(idcard_array[13]))
    						* 5
    						+ (parseInt(idcard_array[4]) + parseInt(idcard_array[14]))
    						* 8
    						+ (parseInt(idcard_array[5]) + parseInt(idcard_array[15]))
    						* 4
    						+ (parseInt(idcard_array[6]) + parseInt(idcard_array[16]))
    						* 2 + parseInt(idcard_array[7]) * 1
    						+ parseInt(idcard_array[8]) * 6
    						+ parseInt(idcard_array[9]) * 3;
    				Y = S % 11;
    				M = "F";
    				JYM = "10X98765432";
    				M = JYM.substr(Y, 1);
    				// 判断校验位
    				if (M == idcard_array[17]) {// 检测ID的校验位
    					return 0;
    				} else {
    					return 3;
    				}

    			} else {
    				return 2;
    			}
    			break;
    			default:
	    			return 1;
	    			break;
    		}
    	},

        /**
         获取页面Url的参数
         参数1：要获取的参数
         参数2：页面的URL
         返回值 ：字符串或者数组
         */

        getQuery:function (key, url) {
            url = url || window.location.href + '';
            if (url.indexOf('#') !== -1)
                url = url.substring(0, url.indexOf('#'));
            var rts = [], rt;
            var queryReg = new RegExp('(^|\\?|&)' + key + '=([^&]*)(?=&|#|$)', 'g');
            while (( rt = queryReg.exec(url) ) != null) {
                rts.push(decodeURIComponent(rt[ 2 ]));
            }
            if (rts.length == 0) return null;
            if (rts.length == 1) return rts[ 0 ];
            return rts;
        },

        /*json对象转换为字符串*/
        objToStr: (function o2s(o) {
            var r = [];
            if (typeof o == "string") {
                return "\"" + o.replace(/([\'\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
            } else if (typeof o == "undefined") {
                return "";
            } else if (typeof o == "object") {
                if (o === null) {
                    return "null";
                } else if (!o.sort) {
                    for (var i in o)
                        r.push("\"" + i + "\":" + o2s(o[i]));
                    r = "{" + r.join() + "}";
                } else {
                    for (var i = 0; i < o.length; i++)
                        r.push(o2s(o[i]));
                    r = "[" + r.join() + "]";
                }
                return r;
            }
            return o.toString();
        }),
        //去除字符串中的HTML标签
        removeHTMLTag : function (str) {
            str = str + "";
            str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
            str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
            str = str.replace(/&nbsp;/ig, '');//去掉&nbsp;
            return str;
        }
    };


    /**
     cookie工具类（静态类）
     */
    o.cookie = {

        /**
         * 访问cookie
         * 参数COOKIE的名称
         */

        get:function (name) {
            var nameEQ = name + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[ i ];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
            return null;
        },

        /**
         * 设置 Cookie
         name：cookie的名称
         value：cookie的值
         days：cookie过期时间。指定cookie的生命期。
         path：cookie保存的路径，指定与cookie关联的WEB页。值可以是一个目录，或者是一个路径。
         domain：cookie指定关联的WEB服务器或域。值是域名
         Secure：cookie的安全，指定cookie的值通过网络如何在用户和WEB服务器之间传递。这个属性的值或者是“secure”，或者为空。缺省情况下，该属性为空，也就是使用不安全的HTTP连接传递数据。如果一个 cookie 标记为secure，那么，它与WEB服务器之间就通过HTTPS或者其它安全协议传递数据。
         */

        set:function (name, value, days, path, domain, secure) {
            var expires;
            if (isNumber(days)) {
                var date = new Date();
                date.setTime(date.getTime() + ( days * 24 * 60 * 60 * 1000 ));
                expires = date.toGMTString();
            }
            else if (isString(days)) {
                expires = days;
            }
            else {
                expires = false;
            }

            document.cookie = name + '=' + encodeURIComponent(value) +
                    (expires ? ';expires=' + expires : '') +
                    (path ? ';path=' + path : '') +
                    (domain ? ';domain=' + domain : '') +
                    (secure ? ';secure' : '');
        },

        /**
         * 删除 Cookie
         name：cookie的名称
         path：cookie保存的路径，指定与cookie关联的WEB页。值可以是一个目录，或者是一个路径。
         domain：cookie指定关联的WEB服务器或域。值是域名
         Secure：cookie的安全，指定cookie的值通过网络如何在用户和WEB服务器之间传递。这个属性的值或者是“secure”，或者为空。缺省情况下，该属性为空，也就是使用不安全的HTTP连接传递数据。如果一个 cookie 标记为secure，那么，它与WEB服务器之间就通过HTTPS或者其它安全协议传递数据。
         */

        del:function (name, path, domain, secure) {
            XB.cookie.set(name, '', -1, path, domain, secure);
        }
    };

    
    /**
     * 函数节流方法
     * @param Function fn 延时调用函数
     * @param Number delay 延迟多长时间
     * @param Number atleast 至少多长时间触发一次
     * @return Function 延迟执行的方法
     */
    o.throttle = function (fn, delay, atleast) {
        var timer = null;
        var previous = null;
     
        return function () {
            var now = +new Date();
     
            if ( !previous ) previous = now;
     
            if ( now - previous > atleast ) {
                fn();
                // 重置上一次开始时间为本次结束时间
                previous = now;
            } else {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    fn();
                }, delay);
            }
        }
    };
    /**
     * 模板处理工具
     * @param String html 页面HTML模板
     * @param Object json 页面数据
     * @return String 最终Html
     */
    o.template = function(html,json){
        var h = html;
        var data = json;
        for (var key in data){
            var patt = new RegExp("\{\{"+key+"\}\}", "gim");
            h = h.replace(patt,data[key])
        }
        return h;
    }

    /**
     * toast——提示
     * @param String 提示
     * @param Number 显示时间ms
     */
    o.toast = function(s,t){
        var str = s?s:'操作成功';
        var n = document.createElement("div");
        var h = '<div class="mocm_mask_transparent"></div>\
                 <div class="mocm_toast_hint"><p class="mocm_toast_content">\
                 '+str+'</p></div>';
            n.innerHTML = h;
        var body = document.querySelector("body");
            body.appendChild(n);
        setTimeout(function(){
            body.removeChild(n);
        },t?t:2000)
    }

    /**
     * toastOK——成功
     * @param String 提示
     * @param function 回调
     */
    o.toastOK = function(s,cb){
        var str;
        if(typeof s == "function"){
            cb=s;
            str = '操作成功';
        }else if(typeof s == "string"){
            str = s;
        }else{
            str = '操作成功';
        }

        var n = document.createElement("div");
        var h = '<div class="mocm_mask_transparent"></div>\
                 <div class="mocm_toast"><i class="mocm_icon_toast"></i><p class="mocm_toast_content">\
                 '+str+'</p></div>';
            n.innerHTML = h;
        var body = document.querySelector("body");
            body.appendChild(n);
        setTimeout(function(){
            body.removeChild(n);
            if(cb){
                cb();
            }
        },1000)
    }

    /**
     * toasting——加载中
     * @param String 提示
     * @return String 该toast的id
     */
    o.toasting = function(s){
        var str = s?s:'数据加载中';
        var n = document.createElement("div");
        var id = "toast_"+(new Date()).getTime();
        n.setAttribute("id",id);
        n.setAttribute("class","mocm_loading_toast");
        var h = '<div class="mocm_mask_transparent"></div>\
                 <div class="mocm_toast"><div class="mocm_loading">\
            <div class="mocm_loading_leaf mocm_loading_leaf_0"></div>\
            <div class="mocm_loading_leaf mocm_loading_leaf_1"></div>\
            <div class="mocm_loading_leaf mocm_loading_leaf_2"></div>\
            <div class="mocm_loading_leaf mocm_loading_leaf_3"></div>\
            <div class="mocm_loading_leaf mocm_loading_leaf_4"></div>\
            <div class="mocm_loading_leaf mocm_loading_leaf_5"></div>\
            <div class="mocm_loading_leaf mocm_loading_leaf_6"></div>\
            <div class="mocm_loading_leaf mocm_loading_leaf_7"></div>\
            <div class="mocm_loading_leaf mocm_loading_leaf_8"></div>\
            <div class="mocm_loading_leaf mocm_loading_leaf_9"></div>\
            <div class="mocm_loading_leaf mocm_loading_leaf_10"></div>\
            <div class="mocm_loading_leaf mocm_loading_leaf_11"></div>\
        </div><p class="mocm_toast_content">\
                 '+str+'</p></div>';
            n.innerHTML = h;
        var body = document.querySelector("body");
            body.appendChild(n);
        return id;
    }

    /* 弹框对象 */
    function Popup(s){
        this.defaults = {
            "id":"pop_"+(new Date()).getTime(),//默认ID
            "title":"提示信息",//弹框title
            "message":"操作成功！",//弹框文案
            "btn":["确定"],//按钮显示文字自定义
            "callback":[],//长度为2分别处理两个按钮事件
            "autoClose":false, //自动关闭，仅在按钮数为1时起效
            "closeIcon":false,//右上角关闭按钮，默认无
            "closeType":"close" //"hide"：只隐藏不移除
        };
        this.setting = o.extend(this.defaults, s)
    }

    Popup.prototype = {
        init:function(){
            var c = this.generate(this.setting);
            var s = this.setting;
            var body = document.querySelector("body");
            body.appendChild(c);
            if(!(!!s.title || s.closeIcon)){
                document.querySelector(".pop_module").style.paddingTop = '1.5rem';
            }
            this.addEvent();
            return this.setting.id;
        },
        generate:function(){
            var s = this.setting;
            var n = document.createElement("div");
            n.setAttribute("id",s.id);
            n.setAttribute("class","pop_mask");
            var closeBtn = s.closeIcon?'<div class="pop_close js_ox">关闭</div>':'';
            var h = '<div class="pop_frame">\
                     <div class="pop_module">\
                     <div class="pop_title"><span>';
            h += s.title; 
            h += '</span></div>'+closeBtn+'<div class="pop_content">';
            h += s.message;
            h += '</div>'
            if(s.btn.length>=1){
                h += '<div class="pop_foot"><span class="pop_btn_first js_go_fir">';
                (s.btn.length == 1) ? (h += (s.btn[0] + '</span>')) : (s.btn.length == 2) ? (h += (s.btn[0] + '</span><span class="pop_btn_second js_go_sec">' + s.btn[1])) : '';
                h += '</span></div>';
            }
            h += '</div></div>';
            n.innerHTML = h;
            return n;
        },
        addEvent:function(){
            var setting = this.setting;
            var pop = this;
            var obj = document.querySelector("#"+this.setting.id);
            var cb_succ = (typeof (setting.callback[0]) == 'function') ? setting.callback[0] : (function(){ pop.close();});
            var cb_fail = (typeof (setting.callback[1]) == 'function') ? setting.callback[1] : (function(){ pop.close();});
            if(setting.btn.length>=1){
                obj.querySelector(".js_go_fir").addEventListener("click", function(){
                    cb_succ();
                    pop.close();
                });
            }
            if(setting.btn.length == 1){
                if(setting.autoClose){
                    var popElem = document.querySelector("#"+pop.setting.id);
                    setTimeout(function(){
                    	if(popElem&&popElem.style.display!='none'){
                    		cb_succ(); 
                    	}
                        pop.close();
                    }, 2000);
                }
            }else if(setting.btn.length == 2){
                obj.querySelector(".js_go_sec").addEventListener("click", function(){
                    cb_fail();
                    pop.close();
                });
            }

            if(obj.querySelector(".js_ox")){
                obj.querySelector(".js_ox").addEventListener("click", function(){
                    pop.close();
                });
            }
        },
        close:function(){
            if(!document.querySelector("#"+this.setting.id)) return false;
            if(this.setting.closeType === "hide"){
                document.querySelector("#"+this.setting.id).style.display = "none";
            }else{
                var body = document.querySelector("body");
                body.removeChild(document.querySelector("#"+this.setting.id));
            }
        }
    }
    
    /* 边界弹框对象 */
    function BorderPop(s){
        this.defaults = {
            "id":"pop_"+(new Date()).getTime(),//默认ID
            "title":"",//默认为空
            "htmlCode":"",//弹窗html代码
            "btn":[],//按钮显示文字自定义，也可以木有按钮~
            "callback":[],//长度为2分别处理两个按钮事件
            "autoClose":false, //自动关闭，仅在按钮数为1时起效
            "closeIcon":false,//右上角关闭按钮，默认无
            "closeType":"close", //"hide"：只隐藏不移除
            "popPosition":"top", //弹框位置 默认在上面
            "isAnimate":false //是否动画
        };
        this.setting = o.extend(this.defaults, s);
    }
    BorderPop.prototype={
        init:function(){
            var s = this.setting,
                c = this.generate(s),
                body = document.querySelector("body");
            body.appendChild(c);
            this.addEvent();
            if(!(!!s.title || s.closeIcon)){
                document.querySelector(".pop_module").style.paddingTop = '1.5rem';
            }
            /* 支持Web-kit的动画开始时间 */
            /* 由于微信浏览器容错性不强 */
            if(s.isAnimate){
                window.onwebkitanimationstart=function(event){
                    if (event.animationName == "nodeInserted") {
                        document.querySelector("#"+s.id+">div").className += " pop_animate_reset ";
                    }
                }
                window.onanimationstart=function(event){
                    if (event.animationName == "nodeInserted") {
                        document.querySelector("#"+s.id+">div").className += " pop_animate_reset ";
                    }
                }
            }

            return this.setting.id;
        },
        generate:function(s){
            var n = document.createElement("div"),
                className;
            n.setAttribute("id",s.id);
            n.setAttribute("class","pop_mask pop_border_mask");
            if(s.isAnimate){
                className = s.popPosition=="top"?"pop_top_frame_animate":"pop_bottom_frame_animate";
            }else{
                className = s.popPosition=="top"?"pop_top_frame":"pop_bottom_frame";
            }
            var closeBtn = s.closeIcon?'<div class="pop_close js_ox">关闭</div>':'',
                h = '<div class="'+className+'"><div class="pop_module">';
            h += s.title?('<div class="pop_title"><span>'+s.title+'</span></div>'):'';
            h += closeBtn;
            h += '<div class="pop_content">';
            h += s.htmlCode;
            h += '</div>';
            if(s.btn.length>=1){
                h += '<div class="pop_foot"><span class="pop_btn_first js_go_fir">';
                (s.btn.length == 1) ? (h += (s.btn[0] + '</span>')) : (s.btn.length == 2) ? (h += (s.btn[0] + '</span><span class="pop_btn_second js_go_sec">' + s.btn[1])) : '';
                h += '</span></div>';
            }
            h += '</div></div>';
            n.innerHTML = h;
            return n;
        },
        close:function(){
            var s = this.setting,
                hideTime = 0;
            if(!document.querySelector("#"+s.id)) return false;
            if(s.isAnimate){
                document.querySelector("#"+s.id+">div").className += s.popPosition=="top"?" pop_animate_hide_top":" pop_animate_hide_bottom";
                hideTime=250;
            }
            if(s.closeType === "hide"){
                setTimeout(function(){
                    document.querySelector("#"+s.id).style.display = "none";
                },hideTime)
            }else{
                var body = document.querySelector("body");
                setTimeout(function(){
                    body.removeChild(document.querySelector("#"+s.id));
                },hideTime)
            }
        }
    };
    BorderPop.prototype.__proto__=Popup.prototype;

    /* String 拓展工具 */
    var stringExtend = function(){
        //计算字符串长度，汉字是长度算1，英文算0.5个字符
        String.prototype.strLen = function () {
            var len = 0;
            for (var i = 0; i < this.length; i++) {
                if (this.charCodeAt(i) > 255 || this.charCodeAt(i) < 0) len += 1; else len += 0.5;
            }
            return len;
        };


        //将字符串拆成字符，并存到数组中
        String.prototype.strToChars = function () {
            var chars = new Array();
            for (var i = 0; i < this.length; i++) {
                chars[i] = [this.substr(i, 1), this.isCHS(i)];
            }
            String.prototype.charsArray = chars;
            return chars;
        };
        //判断某个字符是否是汉字
        String.prototype.isCHS = function (i) {
            if (this.charCodeAt(i) > 255 || this.charCodeAt(i) < 0)
                return true;
            else
                return false;
        };
        //截取字符串（从start字节到end字节）
        String.prototype.subCHString = function (start, end) {
            var len = 0;
            var str = "";
            this.strToChars();
            for (var i = 0; i < this.length; i++) {
                if (this.charsArray[i][1])
                    len += 1;
                else
                    len += 0.5;
                if (end < len)
                    return str;
                else if (start < len)
                    str += this.charsArray[i][0];
            }
            return str;
        };
        //截取字符串（从start字节截取length个字节）
        String.prototype.subCHStr = function (start, length) {
            return this.subCHString(start, start + length);
        };

        //截取字符串（结果为length个字符，汉字算1，英文算0.5个字符，如果超出用...补齐）
        String.prototype.overFlowText = function (length) {
            if (length >= 0 && length <= 3) {
                return this.subCHString(0, length);
            }
            else if (length <= this.strLen()) {
                return this.subCHString(0, length - 1) + "…";
            }
            else
                return this;
        };
    }
    /* Date 拓展工具 */
    var dateExtend = function(){
        if (typeof Date.prototype.format != "function") {
           // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
            Date.prototype.format = function(fmt)   
            {
              var o = {   
                "M+" : this.getMonth()+1,                 //月份   
                "d+" : this.getDate(),                    //日   
                "h+" : this.getHours(),                   //小时   
                "m+" : this.getMinutes(),                 //分   
                "s+" : this.getSeconds(),                 //秒   
                "q+" : Math.floor((this.getMonth()+3)/3), //季度   
                "S"  : this.getMilliseconds()             //毫秒   
              };   
              if(/(y+)/.test(fmt))   
                fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
              for(var k in o)   
                if(new RegExp("("+ k +")").test(fmt))   
              fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
              return fmt;   
            } 
        }
    }
    /* Array 拓展工具 */
    var arrayExtend = function(){
        if (typeof Array.prototype.map != "function") {
          Array.prototype.map = function (fn, context) {
            var arr = [];
            if (typeof fn === "function") {
              for (var k = 0, length = this.length; k < length; k++) {      
                 arr.push(fn.call(context, this[k], k, this));
              }
            }
            return arr;
          };
        }
    }

    //如果是在非微信的移动端浏览器，隐藏底部导航键
    if (/(iPhone|iPad|iPod|iOS|android)/gim.test(navigator.userAgent)) {
        if (!(/MicroMessenger/gim.test(navigator.userAgent))) {
            console.log('Not in wechat');
            //编辑不同效果 针对app
        }
    }
    //fastclick引入
    try{
    	var fastclick=FastClick;
    }catch(e){
    	console.log(e);
    	if(/(iPhone|iPad|iPod|iOS)/gim.test(navigator.userAgent)){
    		//JSONP
    		var s = document.createElement('script');
    		s.src = '//cdn.bootcss.com/fastclick/1.0.6/fastclick.js';
    		document.body.appendChild(s);
        }
    }
    return init();
})