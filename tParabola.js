/**
 * tParabola
 * @Author  Travis(LinYongji)
 * @Contact http://travisup.com/
 * @Version 0.5.0
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
        options = typeof options === "object" ? options : {};

        // 处理起始位置top,left
        if(!elem || elem.nodeType !== 1) {
            return;
        }
        this.elem = elem;
        this.left = toInteger(getCurrentCss(elem, "left"));
        this.top = toInteger(getCurrentCss(elem, "top"));

        // 处理位移
        if(options.type) {
            if(options.type == "position") {
                // x,y指的是终点位置
                x = toInteger(x) - this.left;
                y = toInteger(y) - this.top;
            } else if(options.type.nodeType === 1) {
                // 终点元素，获取终点元素位置，忽略x,y
                x = toInteger(getCurrentCss(options.type, "left")) - this.left;
                y = toInteger(getCurrentCss(options.type, "top")) - this.top;
            }
        }
        // 默认drift x,y指的是位移距离
        this.driftX = toInteger(x);
        this.driftY = toInteger(y);

        // 处理公式常量
        this.curvature = options.curvature == null ? 0.001 : parseFloat(options.curvature);
        this.abc = solveAbc(this.driftX, this.driftY, this.curvature);
        
        // 回调
        this.callback = typeof options.callback === "function" ? options.callback : returnFalse;

        // 持续时间
        this.duration = options.duration == null ? 500 : parseInt(options.duration);
        this.begin = now();
        this.end = this.begin + this.duration;
        
        // 默认自动抛
        this.autostart = options.autoStart === false ? false : true;

        return this;
    }

    Parabola.prototype = {
        start: function() {
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
            this.elem.style.left = (this.left + x) + "px";
            this.elem.style.top = (this.top + y) + "px";
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