/**
 * tParabola
 * @Author  Travis(LinYongji)
 * @Contact http://travisup.com/
 * @Version 0.6.0
 * @date    2014-01-25
 */
(function() {
    // 获取当前时间
    function now() {
        return +new Date();
    }
    
    // 空函数
    function returnFalse() {
        return false;
    }

    // 获取当前样式
    var getCurrentCss = window.getComputedStyle ?
    function(elem, name) {
        var computed = window.getComputedStyle(elem, null),
            ret = computed ? computed.getPropertyValue(name) || computed[name] : undefined;
        return ret;
    } :
    (document.documentElement.currentStyle ? 
    function(elem, name) {
        var ret,
            computed = elem.currentStyle,
            style = elem.style;

        ret = computed ? computed[name] : undefined;

        if(ret == null && style && style[name]) {
            ret = style[name];
        }
        return ret == null ? 0 : ret;
    } :
    returnFalse);
    
    // 转化为整数
    function toInteger(text) {
        text = parseInt(text);
        return isFinite(text) ? text : 0;
    }

    // 求解a b c
    function solveAbc(x, y, a) {
        // a是常量，曲率
        // a无限接近于0，就是平行抛物线
        // a = 0.001,
        // y = a*x*x + b*x + c
        // 假设经过坐标点(0, 0)
        var c = 0,
        // 代入终点坐标(x, y)
        // b = (y - a*x*x) / x
        b = (y - a*x*x - c) / x;

        return {
            a: a,
            b: b,
            c: c
        };
    }

    // 获取X轴位移
    function getPosX(driftX, p) {
        return driftX * p;
    }

    // 获取Y轴位移
    function getPosY(x, abc) {
        // 抛物线方程
        return abc.a*x*x + abc.b*x + abc.c;
    }

    function Parabola(elem, x, y, options) {
        // 处理扩展函数
        // 不传入x,y类型处理
        if(typeof x === "object" && x.type && x.type.nodeType === 1) {
            options = x;
            x = 0;
            y = 0;
        } else if(typeof options !== "object") {
            options = {};
        }

        // 处理起始位置top,left
        if(!elem || elem.nodeType !== 1) {
            return;
        }
        this.elem = elem;

        // 默认值
        options.x = x;
        options.y = y;
        this.type = 'drift';
        this.curvature = 0.001;
        this.callback = returnFalse;
        this.duration = 500;
        
        this.options(options);

        // 默认自动抛
        this.autostart = options.autostart === false ? false : true;

        return this;
    }

    Parabola.prototype = {
        start: function(options) {
            // 重置属性
            this.options(options);
            // 设置起止时间
            this.begin = now();
            this.end = this.begin + this.duration;
            if(this.driftX === 0 && this.driftY === 0) {
                // 原地踏步就别浪费性能了
                return;
            }
            timers.push(this);
            Timer.start();
            return this;
        },
        step: function(now) {
            var x, y;
            if(now > this.end) {
                // 运行结束
                x = this.driftX;
                y = this.driftY;
                this.update(x, y);
                this.stop();
                this.callback.call(this);
            } else {
                x = getPosX(this.driftX, (now - this.begin) / this.duration);
                y = getPosY(x, this.abc);
                this.update(x, y);
            }
            return this;
        },
        update: function(x, y) {
            this.elem.style.position = "absolute";
            this.elem.style.left = (this.left + x) + "px";
            this.elem.style.top = (this.top + y) + "px";
            return this;
        },
        reset: function() {
            this.update(0, 0);
            return this;
        },
        options: function(options) {

            this.left = toInteger(getCurrentCss(this.elem, "left"));
            this.top = toInteger(getCurrentCss(this.elem, "top"));

            if(typeof options !== "object") {
                options = {};
            }
            
            var x = options.x == null && typeof this.driftX === "number" ? this.driftX : options.x,
                y = options.y == null && typeof this.driftY === "number" ? this.driftY : options.y;

            if(options.type != null) {
                this.type = options.type;
            }

            // 处理位移
            if(this.type === "position") {
                // x,y指的是终点位置
                x = toInteger(x) - this.left;
                y = toInteger(y) - this.top;
            } else if(this.type.nodeType === 1) {
                // 终点元素，获取终点元素位置，忽略x,y
                x = toInteger(getCurrentCss(this.type, "left")) - this.left;
                y = toInteger(getCurrentCss(this.type, "top")) - this.top;
            } else {
                x = toInteger(x);
                y = toInteger(y);
            }

            // 默认drift x,y指的是位移距离
            this.driftX = x;
            this.driftY = y;

            // 处理公式常量
            this.curvature = options.curvature == null ? this.curvature : parseFloat(options.curvature);
            this.abc = solveAbc(this.driftX, this.driftY, this.curvature);

            // 回调
            this.callback = typeof options.callback === "function" ? options.callback : this.callback;

            // 持续时间
            this.duration = options.duration == null ? this.duration : parseInt(options.duration);
            return this;
        },
        stop: function() {
            var i = timers.length - 1;

            for(; i >= 0; i--) {
                if(timers[ i ] === this) {
                    timers.splice(i, 1);
                    break;
                }
            }
            return this;
        }
    };

    // 定时器
    var timerId = null,
        timers = [];

    var Timer = {
        // 定时执行
        tick: function() {
            var i = 0,
                t = now();

            for(; i < timers.length; i++) {
                timers[i].step(t);
            }
            if(timers.length === 0) {
                Timer.stop();
            }
        },
        // 启动定时器
        start: function() {
            if(!timerId) {
                timerId = setInterval(Timer.tick, 13);
            }
        },
        // 关闭定时器
        stop: function() {
            clearInterval(timerId);
            timerId = null;
        }
    };

    window.tParabola = function(elem, x, y, options) {
        var par = new Parabola(elem, x, y, options);
        par.autostart && par.start();
        return par;
    };
})();