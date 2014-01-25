# tParabola

Javascript抛物线插件

这是一个不常用的插件，但是它可以在实际项目提升体验，比如说购物车，抛小球。

效果详见 [Demo](http://travisup.com/demo/plugins/tparabola/demo.html)

### Usage

注：抛物线，x轴匀速，y轴变速。

该插件位移是通过绝对定位控制`left`，`top`来实现的，所以写样式的时候运动的元素必须设置为`position: absolute`。
	
##### tParabola(elem, x, y, options)

调用方法，`elem`传入要移动的元素。

`x`、`y`指的是x轴和y轴的位移距离。如果`options.type`的值设置为`position`，`x`、`y`指的是传入的是终点的位置。还有一种类型`options.type`设置为一个元素的话，指的就是终点元素啦，这时就会自动获取该元素的`left`、`top`，无视`x`、`y`，你可以随便写，或者干脆不传，不过我不喜欢这种写法。

`options`就是配置项，不传就默认，详见后面。
    
    var ball = document.getElementById('ball');
    var ball2 = document.getElementById('ball2');
    var p1 = tParabola(ball, 200, -100, {autostart: false});
	var p2 = tParabola(ball, {type: ball2});

##### .start()

如果`options.autostart`设置为`false`，就必须手动调用`start()`来执行抛物线操作。当然也可以重复调用。

	p.start();

##### .stop()

顾名思义，在运动过程中停止。

	p.stop();

### Options

插件提供可配置的选项：

* `type`：设置位移的类型，最开始有说到
* `duration`: 运动的时间，默认`500`毫秒
* `curvature`: 抛物线曲率，就是弯曲的程度，越接近于`0`越像直线，默认`0.001`
* `callback`: 运动后执行的回调函数
* `autostart`: 是否自动开始，默认为`true`

### Author

[Travis](http://travisup.com/)

