/**
 * parabola
 * @Author  Travis(LinYongji)
 * @Contact http://travisup.com/
 * @Version 0.0.1
 * @date    2014-01-13
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

    function Parabola(elem, driftX, driftY, options) {
        // 处理扩展函数
        options = typeof options === "object" ? options : {};

        // 处理位置top,left
        if(!elem || elem.nodeType !== 1) {
            return;
        }
        this.elem = elem;
        this.top = getCurrentCss(elem, "top");
        this.left = getCurrentCss(elem, "left");
        this.top = this.top? parseInt(this.top) : 0;
        this.left = this.left? parseInt(this.left) : 0;

        // 处理常量
        this.driftX = driftX == null ? 0 : parseInt(driftX);
        this.driftY = driftY == null ? 0 : parseInt(driftY);
        this.curvature = options.curvature == null ? 0.001 : parseFloat(options.curvature);
        this.abc = solveAbc(this.driftX, this.driftY, this.curvature);
        
        // 回调
        this.callback = typeof options.callback === "function" ? options.callback : returnFalse;

        // 持续时间
        this.duration = options.duration == null ? 500 : parseInt(options.duration);
        this.begin = now();
        this.end = this.begin + this.duration;

        return this;
    }

    Parabola.prototype = {
        start: function() {
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

    window.parabola = function(elem, driftX, driftY, options) {
        var par = new Parabola(elem, driftX, driftY, options);
        par.start();
        return par;
    };
})();