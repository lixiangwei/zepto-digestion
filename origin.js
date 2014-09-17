/* Zepto 1.1.4 - zepto event ajax form ie detect fx fx_methods assets data deferred callbacks selector touch gesture stack ios3 - zeptojs.com/license */
/***
    中文注释由 李祥威 添加，包含了zepto所有17个模块，为个人对细节的理解，官方解释很详细的地方就不说啦
	难免有错漏，联系我： chuangweili@163.com
***/
//把代码用闭包保护起来，这一块定义的是zepto对象和他的属性方法。
//用小括号包住一个匿名函数，返回的就是这个函数，后面跟再跟()就相当于调用这个匿名函数了
var Zepto = (function() {
//定义本对象需要用到的对象，以及缓存快捷方式（优化性能）
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
//elementDisplay对象用来缓存元素节点默认的display属性
    elementDisplay = {},
//classCache对象用来保存class的名字以及它对应的正则表达式
	classCache = {},
//cssNumber对象保存的属性都是不需要添加px后缀的
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
//检测是否为HTML标签正则,举栗子：<div> <h1>
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
//出于优化考虑，匹配只有单一标签的情况<div /> <div></div> <div>情况，里面不含子元素的
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
//检测没有正确闭合的标签，举栗子：<div />
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
//检测是不是<body><html>根标签
    rootNodeRE = /^(?:body|html)$/i,
//检测有没有大写字母
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
//和相邻节点有关的操作方法
    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
//把创建表格的相关操作缓存起来
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
//元素加载好的的状态
    readyRE = /complete|loaded|interactive/,
//检测简单dom选择器，只能是数字字母组合
    simpleSelectorRE = /^[\w-]*$/,
//用来存放每种对象类型，{["object Array"]: array, ["object String"]: string ...},
    class2type = {},
//缓存class2type的字符串
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
//创建临时div容器
    tempParent = document.createElement('div'),
//把下面可能出现的错误属性名称，替换为正确的驼峰形式的属性名称
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
//判断时候是否为数值，如果有原生isArray方法就用原生的
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }
	  
//判断给的元素是不是匹配选择器，类似原生的matches()方法，这是一个比较新的方法，下面可以看到，带前缀
  zepto.matches = function(element, selector) {
//任意一个参数为空或者传进来的元素不是element类型就退出函数
    if (!selector || !element || element.nodeType !== 1) return false
//获取各内核下的matchesSelector方法，存在的话就用啦
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
//temp = !parent 有父元素就为false，没有结构为TRUE
    var match, parent = element.parentNode, temp = !parent
//没有父元素就创建一个临时的父元素，然后把element放里面
    if (temp) (parent = tempParent).appendChild(element)
//在父元素上调用queryselectorall来匹配selector（说就是把parent作为查询上下文），在返回的结构中查找是否存在element，如果不存在是会返回-1的，通过位运算~可以-1转化为0，因为这个方法是要返回布尔值
    match = ~zepto.qsa(parent, selector).indexOf(element)
//把临时的父元素div删除
    temp && tempParent.removeChild(element)
    return match
  }

//判断类型，null返回"null",然后再使用对象的toString方法来判断对象类型，如果class2type没有对应的，就返回“object”，其他返回对应的类型值
  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

//判断对象类型
  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
//是否为简单原始对象，例如Object.create(null);就返回false了
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
//判断是否为类数组对象 nodeList等
  function likeArray(obj) { return typeof obj.length == 'number' }
//压缩数组，把值为null和undefined的删除掉
  function compact(array) { return filter.call(array, function(item){ return item != null }) }
//复制数组，concat()方法参数为空的话，就会返回对当前函数的复制
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
//把get-name转化为驼峰形式getName,(.)表示跟在-后的字符，chr保留着被（）匹配内容的引用，把函数赋予变量可以根据情况选择性地赋予需要执行的函数
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
//字符串格式转化，驼峰转为line-height，::转化为/
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
//去掉数组里重复的内容，通过判断indexOf在数组的位置和循环时的索引是否相等
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }
//返回类名对应的正则表达式
  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }
//判断是否需要为该属性值加"px"后缀
  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }
//获取元素节点默认的display类型
  function defaultDisplay(nodeName) {
    var element, display
//看看有没有缓存，没有就进行判断，判断完了缓存起来
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
//要把元素添加到页面里才能获取他的样式
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
//当display：none的时候，可以对元素设置宽高等，类似看不见的块元素
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }
//获取子元素集，有原生的children就用，把子元素复制到到数组里，没有就用zepto的map方法对当前元素的子元素都进行判断。   children只返回nodeType为element的，childNodes会返回所有类型
  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag  对于单一元素，没有子元素什么的直接创建一个，不用像下面那样处理
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
//如果标签残缺就重新生成，像是<div />，RegExp.$1缓存正则中的（）内容，就是节点名称
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
//判断是不是表单标签，是的话创建对应表单容器，不是就用div作为容器了
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
//这里把container.childNodes复制给了dom，作为一个数组返回（数组里包含dom结构），再把container的子元素一个个删除
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
//如果需要设置的属性是有对应设置方法的话，例如$.width()，那就直接用，没有的话就用通用的attr()方法
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
//让dom数组继承$.fn上的所有方法，因为是Dom结构，所以没有prototype，就只能利用__proto__（是指内部[[prototype]]），ie同学悲剧了(用ie模块兼容)
//dom.__proto__ 就是该对象的内部属性[[prototype]],指向该对象构造函数的prototype
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
//zepto.init里至始至终没有使用new，之所以能够用instanceof来检测是否为继承关系，是因为 dom.__proto__ = $.fn 改变了该对象对构造函数原型的引用（用来记录谁是它构造函数）
//而zepto.Z.prototype = $.fn 改变了zepto.Z的原型
//一个对象的__proto__  等于 一个函数的prototype时，为继承关系
//例如 var a = function(){}; a.prototype = window; b = {}; b.__proto__ = window; b instanceof a; 会返回TRUE
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {  //创建zepto集合，选择对应的节点
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)   //$("a:alilink", $("body"))其实就是zepto.init("a:alilink", $("body"))
  }

//把source上的数据拓展到target上
  function extend(target, source, deep) {
    for (key in source)
//查看是否需要深度拓展，深度拓展完全产生新对象，因此改变source就不会改变target的了
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
//如果source的key是对象，而target对应key不是，那就给他创建新对象
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
//同理，数组也一样
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
//深度拓展的话继续看当前key下是否有东西，有就继续拓展下去
        extend(target[key], source[key], deep)
      }
//把每个key的值复制过去，非深度拓展只复制对象的基本类型,对象仍属于原来的引用。 这里没有判断因此source上的属性会覆盖掉target上的。
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)     //arguments包含了所有实参，从第二个开始复制
    if (typeof target == 'boolean') {   //传进来的第一个参数决定是不是要深度拓展
      deep = target
      target = args.shift()   //把target对象从参数数组拿出来，给到target，剩下的就作为source对象了
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
//从第一个字符判断是否选择id 类 
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
//如果element是document，是简单选择器，可能为id的情况，直接查id，没有找到返回空数组
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
//判断element是不是节点元素或者document，都不是返回空数组
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

//从nodes集合中过滤，只包含匹配selector的集合
  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

//查看浏览器有没有原生的contain方法
  $.contains = document.documentElement.contains ?
    function(parent, node) {
//有原生contains方法的话，如果两者不相等，并且包含就返回TRUE
      return parent !== node && parent.contains(node)
    } :
//没有原生方法的话，循环判断node的父元素是否等于parent，一直到最顶部 null 才停
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

//判断arg是否为函数，是的话作为函数调用（payload可以携带相关的信息数据），不是则作为值
  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

//设置value为null，或者undefined的话，就执行删除属性操作，有值的话就设置属性值
  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
//反序列话，变回原来的类型
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
//判断是不是JSON对象，\[是判断是否以[开头是对于[{a: 1,b: 2}]数组里放对象情况
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

//把方法拓展到zepto对象上去
  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
//判断有没有属性在里面，哪怕一个就返回false了,为空对象
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
//判断elem是否在数组里，i指的是默认开始找的地方
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
//那些拓展模块中用到
  $.uuid = 0
  $.support = { }
  $.expr = { }

//遍历elements，把每个element放到callback处理
  $.map = function(elements, callback){
    var value, values = [], i, key
//如果是数组或者nodeList，遍历它们，执行结果为null和undefined会被过滤掉
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
//如果是对象的话
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
//复制返回一个新的数组，不会影响原来的
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
//和上面map的区别是，这里将每个元素作为上下文来运行callback，并且把索引和对应值传进去，返回false会退出循环
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

//暴露过滤方法，返回在callback执行结果为TRUE的元素组成的新数组
  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
//给zepto对象拓展各种方法
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
//在zepto的Dom方法里也搞一份map
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
//复制集合，返回一个zepto对象
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
//DOMContentLoaded事件当Dom加载完成就触发，不需要等待图片，脚本等加载完成，在load之前触发,load需要等待页面完全加载完
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
//没有传入参数就返回包含所有元素集合转化为数组，当参数为负数的时候，通过加总长度变为获取倒数元素
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
//获取当前集合的长度
    size: function(){
      return this.length
    },
    remove: function(){
//将当前集合每个元素从Dom删除，判断是否存在父节点，再调用原生removeChild（）方法，如果是document的话直接把document对象放数组返回
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
//every方法测试当前集合是否都通过callback测试，都通过返回TRUE。
      emptyArray.every.call(this, function(el, idx){
//如果执行过程中有callback显式返回false（不包括0 null undefined），会退出循环
        return callback.call(el, idx, el) !== false
      })
      return this
    },
//过滤当前集合，返回结果为TRUE的
    filter: function(selector){
//如果selector是函数的话，第一次执行this.not(selector)返回函数运行结果为falsy（0，false，null，undefined）的集合，第二次调用this.not(this.not(selector))相当于不要第一次返回的集合，要剩下的那些。
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
//把selector选择到的元素追加到当前集合，会去掉重复的
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
//判断当前集合中的第一个元素this[0]是否匹配selector
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
//从当前集合筛选出不在选中范围内的集合
    not: function(selector){
      var nodes=[]
//如果selector为函数并且可以通过call存在的话，把执行结果为false的添加到nodes里
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
//excludes 表示的是被selector选中的集合，如果是字符串的话，直接filter过滤出来
        var excludes = typeof selector == 'string' ? this.filter(selector) :
//如果是nodeList的话，直接复制当前nodeList，item方法只有函数上才有，数组没有，用来排除selector为数组情况。以上情况都不是那就作为选择器使用
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
//遍历集合，如果没有出现在excludes里，就表示该元素没有没选中，添加到nodes数组中，最后返回nodes集合
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
//过滤当前集合，筛选出包含selector的集合
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
//如果selector是对象（node）的话，就使用contain查找当前集合是否包含selector
          $.contains(this, selector) :
//如果不是对象，就是用find查找selector
          $(this).find(selector).size()
      })
    },
//这里把-1单独判断是因为slice(-1)可以取最后一个，不需要第二个参数end。而 + idx + 1 是因为倒数取值情况slice(-3,-2), + -3 + 1 = -2，这里的第一个加号是用来转化为数字类型，避免用户eq("1")
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
//获取第一个集合，判断el是否为zepto对象（isObject如果是zepto对象会返回false），是的话直接返回，不是弄成zepto对象再返回
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
//从当前集合中获取最后一个集合
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
//查找匹配selector的元素
    find: function(selector){
      var result, $this = this
//如果selector不存在，返回空数组
      if (!selector) result = []
//如果selector为对象（Dom或者zepto对象），遍历selector，在当前集合($this)上查看是否包含任意selector，有的话就会返回TRUE，并记录该selector到result里面
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
//some回调第一个参数指向当前对象，因此为parent，如果里面$.contains(parent, node)返回TRUE，那么some也会返回TRUE
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
//如果当前集合只有一个子集，那么直接就在这个子集上查找selector
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
//如果当前集合有多个子集，则使用map遍历
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
//查找第一个匹配到的父级元素
    closest: function(selector, context){
      var node = this[0], collection = false
//如果是元素节点或者zepto集合，那么转化为zepto对象并且放到collection
      if (typeof selector == 'object') collection = $(selector)
//node存在，判断collection是否为false，如果node不在collection集合里，或者node里没有匹配的selector，进行下一步判断，如果前面判断失败，表示查找完成，返回$(node)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
//node不等于给定的上下文环境，并且node不为document，并且node.parentNode存在的话，把node.parentNode 赋给node，一层一层把父元素拿去判断。如果context和node相等的话返回这个node
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
//返回所有父元素，如果提供了selector，返回匹配的所有父元素
    parents: function(selector){
      var ancestors = [], nodes = this
//一直循环到最顶层，它的长度为0，停止
      while (nodes.length > 0)
//遍历所有父级，如果父级还有父元素，并且不是document，没有和ancestors里重复，就把nodes指向上一级，继续遍历
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
//如果提供了selector的，过滤出符合条件的
      return filtered(ancestors, selector)
    },
//获取直接父元素，通过plunk遍历集合获取父元素节点
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
//获取当前集合的直接子元素们
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
//获取当前集合的子节点，childNodes是会返回text节点和注释节点的，children属性则不返回
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },

    siblings: function(selector){
//这一层过滤是如果提供了selector，只返回符合条件的sibling
      return filtered(this.map(function(i, el){
//这一层过滤是通过children(el.parentNode)获取所有子元素，然后剔除掉当前那个
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
//通过把innerHTML设置为空清除掉当前节点下的Dom
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
//遍历当前集合获取属性值
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
//把当前集合的每个元素作为上下文，去判断display属性，被内联样式设置为none的话恢复显示
        this.style.display == "none" && (this.style.display = '')
//如果被CSS样式设置为none的，通过内联样式设置回默认值
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
//通过before方法把新内容添加到当前集合元素前，然后把当前的移除掉
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
//把当前集合中的每个元素用structure包裹起来
    wrap: function(structure){
      var func = isFunction(structure)
//如果当前集合有子元素且没有传函数进来的话，缓存structure，注意get(0)返回的是原生的Dom
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1
//以当前集合中的每个子集为上下文调用wrapAll()，如果传进来的structure是函数，那么就调用这个函数，使用它返回的结构作为structure。如果不是判断clone
//clone存在表示传进来的structure可能为当前页面的dom，或者需要wrap的元素超过一个，因此需要深度克隆dom作为wrapAll的structure，否则就是用dom
      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
//把当前集合全部放到一个结构里
    wrapAll: function(structure){
      if (this[0]) {
//把structure转为zepto后插入到第一个匹配到的子集前面，然后把structure覆盖为最里面的元素，再把this把当前集合全部移进到最里面
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
//把当前集合的内容（不包含Dom结构）放到structure里
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
//使用contents()只获取每个元素里的内容，如果内容存在就把内容依次放到dom里，没内容的话就把dom移进去。
//因为每一次dom都会被移动，也就是先把structure移到第一个匹配到的子集里，然后移动第二个，第三个，因此最后的位置就在最后一个匹配到的子集元素里
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
//把直接父元素灭了，原理就是用当前集合的children作为新内容替换掉自己
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
//克隆节点都是深度克隆，所有子节点都被复制
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
//判断传进来的setting，如果是undefined则判断当前是否隐藏，用来下一步控制显隐
//如果不是undefined，则判断setting的真假值，进而判断显隐性。
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
//调用原生的属性方法previousElementSibling，nextElementSibling，再过滤出匹配的
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
//0 in argument判断是否传入了参数，如果传入了的话，把原本的HTML结构清空，如果传进来的HTML结构，那么就用它替代旧的，如果是对原来结构的调整函数，那就调用这个函数
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
//没有传进参数的话，就看当前集合有没有东西，有的化返回第一个子元素的结构，没有的话返回null
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
//这里和html方法不同之处在于保存funcArg的结果作为新的内容，''+newText用来转化为字符串
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
//读取或设置Dom 的attitude
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
//如果name为字符串并且只传了一个参数的话，表示读取attribute的值，那么判断当前集合是不是是否存在子集，如果不存在或者第一个子集不是元素类型的话，返回undefined
        (!this.length || this[0].nodeType !== 1 ? undefined :
//如果getAttribute获取返回null，但是name的确在这个元素上，那么表示这个attribute是直接定义上去的，例如element.num = 1 ,需要通过this[0][name]来取值
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
//这里是进行attribute设置操作
        this.each(function(idx){
          if (this.nodeType !== 1) return
//如果传进来的是对象，那么就遍历该对象，把属性设置到当前集合每个元素上
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
//最后一种情况是处理第二个传入的参数，在当前元素上调用该方法把返回结果作为name的值
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
//原理就是使用上面提到的setAttribute，当没有传入值的时候为移除属性
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
//修正有可能写错的属性名
      name = propMap[name] || name
//判断有没有传入value
      return (1 in arguments) ?
        this.each(function(idx){
//传了value表示设置操作，调用funcArg，把结果作为该属性值
          this[name] = funcArg(this, value, idx, this[name])
        }) :
//没有传入第二个参数表示进行读取操作
        (this[0] && this[0][name])
    },
//读取或者设置带有data-前缀的attribute
    data: function(name, value){
//把那么转化为-xx-xx的小写模式，但是这里的'data-'后面多了一行，变成data--mime了
//如果你使用的是包含了data模块的zepto，那么这个方法就被覆盖了，那就不是简单滴存储到元素上了
//data模块支持存储任意对象
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)
//如果是获取值的话，返回原本的数据类型
      return data !== null ? deserializeValue(data) : undefined
    },
//设置或者获取表单控件的值
    val: function(value){
//如果传入了参数表示设置控件的值
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
//没有给值的话也是返回第一个元素的值，需要判断是不是多选的，如果是就把选择的值放在数组里返回
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
//获取元素相对于document的位置
    offset: function(coordinates){
//如果提供了上，左位置，就会设置该位置
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
//parentOffset为当前元素第一个position为“relative”, “absolute”或“fixed”的元素，因为常用这些来限制子元素为absolute的活动范围
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }
//如果是static，设置为relative来移动，不影响其他元素
        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
//getBoundingClientRect返回一个对象，其中包含了left、right、top、bottom四个属性，分别对应了该元素的左上角和右下角相对于浏览器窗口（viewport）左上角的距离
      var obj = this[0].getBoundingClientRect()
      return {
//left和top加上滚动了的距离
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
//如果只传入property的情况
      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if(!element) return
//如果property为字符串，那么先看内联样式有没有，这里要使用驼峰形式。没有则获取最终应用到元素上的样式，这里不用驼峰
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
//传入property数组的话，返回一个props对象，把每个属性查询结果存放在里面
        else if (isArray(property)) {
          var props = {}
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
//如果value为falsy值，那么就从style里删除掉这个样式，removeProperty不能用驼峰形式
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
//不是删除的话，就转化为样式写法，background-color: red; 要添加px后缀的就添加上
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
//如果property是对象的话，遍历它，如果值为falsy切不为0的话，就去掉，否者也转化成样式
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }
//一次性把CSS样式添加到各元素style里，注意是+=不是=，不然会覆盖掉原有的
      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
//获取元素位置，如果有element的话，返回第一个element在当前集合位置，没有的话返回当前集合第一个元素相对于兄弟姐妹的位置
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
//这里的this是classRE(name)生成的对应类名正则，因为some方法第二个参数可以指定callback的this。 
//集合中只要有一个含有该类就返回TRUE
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
//把要添加的类逐个进行判断，看原来有没有，没有才添加到classList数组
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
//添加新类的时候判断原来有没有类，有的话用空格分开，classList数组转化为用空格分开的字符串
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
//通过replace把匹配到的类名替换为空，后面再把多余的空格去掉
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
//如果提供了when的话，当它的值为真才添加类，否则移除。如果when为undefined，那么就看目前有没有这个类，有就移除，没有就添加
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
//判断向下滚动了多少
    scrollTop: function(value){
      if (!this.length) return
//判断有没有原生的scrollTop属性
      var hasScrollTop = 'scrollTop' in this[0]
//没有传入value的话表示读取，返回scrollTop（body的情况），没有的话返回pageYOffset（window）
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
//同样如果是设置位置的话，支持scrollTop的用它，不支持的话使用window的scrollTo方法
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
//判断向右滚了多少
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
//获取相对于非static祖先元素的位置
    position: function() {
      if (!this.length) return
//获取当前集合第一个元素
      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
//因为现在的top和left是相对左上角，因此要减掉边距
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
//获取每个元素的offsetParent，没有的话表示为document.body，因为body的offsetParent为null
        var parent = this.offsetParent || document.body
//如果不为根节点，并且它的布局方式是默认的static，那么就用它的offsetParent覆盖当前parent，继续向上判断，直到非static的祖先
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
//把首字母进行大写
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })
//把width，height方法拓展到$.fn里
    $.fn[dimension] = function(value){
      var offset, el = this[0]
// 没有传入值表示查询，如果是window对象，返回innerWidth(Height)的值，浏览器窗口显示高宽
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
//如果是document，返回scrollWidth(Height),当前文档的高宽
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
//其他元素调用offset方法取值
        (offset = this.offset()) && offset[dimension]
//传入值的话把当前集合每个元素都用css方法设置宽高
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
//先对node本身操作一遍，判断是不是script标签，有的话需要执行里面的脚本
    fun(node)
//再遍历后代节点，看里面有没script标签，整个node检查一遍
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
//adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ], prepend, append求余结果为0
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
//对参数进行判断，如果是HTML字符串，标签名就先转化为Dom结构
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
//copyByClone判断当前集合在页面上是否为多个，多个的话nodes不能直接移动，要克隆，才能给集合中每个元素都进行操作
          parent, copyByClone = this.length > 1
//如果没有传参数，返回当前对象
      if (nodes.length < 1) return this
//_是各元素在当前集合索引，target是各元素对象
      return this.each(function(_, target){
//prepend, append为1，after，before为0，append和append用自己作为父元素，通过覆盖target为子元素来实现insertBefore
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling : //0是after操作，insertBefore方法的话就是插入到目标元素的相邻下一个元素的前面
                 operatorIndex == 1 ? target.firstChild :  //1是prepend操作，insertBefore方法的话就是插入到目标元素所在集合的第一个元素前面
                 operatorIndex == 2 ? target :
                 null                                   //append操作，insertBefore方法第二个参数为null的话，默认插到当前集合最后一个

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
//如果是要对多个元素进行操作append等操作
          if (copyByClone) node = node.cloneNode(true)
//如果当前元素没有parent的话，就退出并且删除该元素，执行不了insertBefore方法
          else if (!parent) return $(node).remove()

//到这里就进行插入操作
          parent.insertBefore(node, target)
//如果是在script里面插入内容，那么要以window为上下文执行里面的内容
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
//在里面反向调用上面的方法，把传入的HTML作为当前集合，把当前集合作为传入的HTML
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

//把Zepto和$拓展到全局对象上，如果$被占用了，就用Zepto吧
window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)



//接下来这部分是事件处理模块
;(function($){
//定义该模块内部使用的变量函数等
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
//handles的大概结构：
//handles = {
//    元素的zid：[handler对象1,handler对象2 ...]
//}
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
//不支持冒泡的事件
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

//获取/赋予元素一个标示符
  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  
//查找元素的事件处理函数
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
//如果event.e不为falsy值，判断当前处理函数的事件类型是否等于传入的事件类型,其实就是想执行后面的判断
        && (!event.e  || handler.e == event.e)    
//判断时间的命名空间时候相同		
        && (!event.ns || matcher.test(handler.ns))   
//判断fn是否指向同一个，因为函数是引用类型，你在上面加点东西，其他对该函数的引用也能看到
        && (!fn       || zid(handler.fn) === zid(fn))   
//判断选择器是否相同
        && (!selector || handler.sel == selector)         
    })
  }
  
//解析事件为数组
  function parse(event) {
//先转化为字符串再切割为数组
    var parts = ('' + event).split('.')
//返回一个对象，包含事件类型，命名空间
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  
//生成命名空间的正则
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }
  
//设置捕获阶段，如果是focus和blur事件，则设为捕获阶段，来达到冒泡的目的
  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }
  
//不支持mouseenter和mouseleave的话，就用mouseover和mouseout来替代
//如果支持focusin事件的话，就用focusin和focusout替代focus和blur
  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }
  
//处理事件监听
  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
//同时添加多个事件支持，空格切割为数组
    events.split(/\s/).forEach(function(event){
//如果是ready事件，就添加到document上
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
//把数据保存到该handler上去
      handler.fn    = fn
//selector 可以选择是不是只执行一次事件处理函数
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
//relatedTarget 是指相对于触发事件元素的另一个元素，因为鼠标无非从一个元素移动到另一个元素上，mouseover和mouseout才有这个事件属性，因此mouseenter, mouseleave需要模仿
        var related = e.relatedTarget
//第一种情况!related表示为mouseenter, mouseleave事件,执行事件处理函数
//第二种情况如果related有值，并且不是元素自己，也不是触发元素的子节点，那也执行事件处理
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
//判断有没有调用过stopImmediatePropagation方法，如果一个元素对一个事件添加多个事件监听，那么stopImmediatePropagation可以禁止剩下那些事件处理函数调用
//并且也不会冒泡了，代理不了，所以返回
        if (e.isImmediatePropagationStopped()) return
//把当前的事件对象信息保存到e上去，因为这些事件对象也是引用的，例如 MouseEvent
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
//如果事件处理函数返回false的时候，阻止默认行为和冒泡
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
//设置这个handler是第几个，因为length是之前set的长度，刚好就等于这个handler加入set之后的索引  B)
      handler.i = set.length
//把当前handler记录到handlers上去
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  
//删除掉绑定了的事件监听函数
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
//遍历该元素的handlers，找到符合条件的handler
      findHandlers(element, event, fn, selector).forEach(function(handler){
//从事件监听数组中删除掉匹配的handler，注意的是这样删除不会影响数组的长度，例如 [1,2,3],删除第一个变为[undefined,2,3]  这样才能保证handler.i正确性
        delete handlers[id][handler.i]
//最后删除掉事件监听
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

//把上面的两函数拓展到zepto的event对象上
  $.event = { add: add, remove: remove }

//让context对象代理fn里面的this，没有代理的话this是指向触发事件的元素的
  $.proxy = function(fn, context) {
//把除了前两个参数fn和context的保存为参数
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
//如果传入的第一个参数是函数的话，就返回一个新的函数，把context作为上下文来调用fn
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
//proxyFn是返回执行fn的，所以id应该保持一致
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
//如果传入的第二个参数是字符串并且还有第三个以上参数的话，把fn[context], fn按顺序插到args数组开头
        args.unshift(fn[context], fn)
//调用$.proxy，参数为(fn[context], fn, 第三个参数, ...)
//也就是说穿进来的fn为对象，context为该对象上的属性，属性值才是函数
        return $.proxy.apply(null, args)
      } else {
//没有附加参数的话，直接传入正确的函数和上下文对象
        return $.proxy(fn[context], fn)
      }
    } else {
//没有传入参数报错
      throw new TypeError("expected function")
    }
  }

//bind和unbind都是弃用的接口，这里是为了兼容以前基于老版本zepto写的的程序不出错
  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  
//只执行一次的回调函数
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
//有些浏览器没有原生的isImmediatePropagationStopped方法，例如低版本Android
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

//事件对象兼容处理
  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
//调用preventDefault，stopImmediatePropagation，stopPropagation，然后把对应的isDefaultPrevented，isImmediatePropagationStopped，isPropagationStopped返回值为TRUE
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })
//查看有没有defaultPrevented，没有的话判断returnValue的值，returnValue也没有就只能用尝试用废弃的方法getPreventDefault(),任意一个返回TRUE，就把事件的isDefaultPrevented设为TRUE
//因为有些浏览器没有defaultPrevented属性
      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
//因为isDefaultPrevented是方法，因此也应该指向一个方法
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

//创建代理事件
  function createProxy(event) {
//把源事件保存起来
    var key, proxy = { originalEvent: event }
    for (key in event)
//过滤掉忽略的和值为undefined的属性，把需要的属性添加到代理上去
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

//delegate，undelegate，live，die方法都是废弃的，保留下来兼容以前程序
  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
//如果传进来的event是一个事件对象{click:"click",mouseover:"mouseover"}，或者函数的话调用each遍历
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }
//selector传的是undefined，null之类的无效值情况，重新赋值
    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
//data为函数，或者传了false值的话，callback和data重新赋值
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
//如果是希望只调用一次事件处理函数的话，生成autoRemove函数，先删除掉事件监听，然后在当前元素上执行事件处理
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
//把以当前对象为执行上下文的事件处理结果返回给autoRemove
        return callback.apply(this, arguments)
      }
//如果selector存在的话，创建事件委托
      if (selector) delegator = function(e){
//match是指，在触发事件元素上找到的第一个匹配selector的祖先元素，然后在这个对象上调用事件处理函数
        var evt, match = $(e.target).closest(selector, element).get(0)
//如果找到的元素不等于添加事件监听的元素本身，进行事件委托
        if (match && match !== element) {
//把找到元素和当前事件监听的元素都记录到委托事件对象上，返回委托事件对象
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
//把以match为执行上下文的事件处理函数处理结果返回给delegator
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }
//添加事件监听，on对参数进行预处理，add除了监听事件，还需要把事件信息记录到handlers对象
      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }

//分离掉用on添加的事件处理，callback必须是和添加时的一致，匿名函数取消不了，压根就是不同对象
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

//通常事件时交互触发的，但也可以主动触发事件，这个方法是会冒泡的，下面的triggerHandler不会
  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
//只触发当前元素对象事件
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
//原理是到handlers对象上找该元素对象事件下的事件处理函数，然后执行他们，没有真正意义上的产生事件
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
//如果传了函数表示添加事件监听
        this.bind(event, callback) :
//没有添加表示触发事件
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
//如果没有穿callback的话,默认表单元素的话会有focus和blur方法，其他元素focus不了
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

//创建并初始化指定事件
  $.Event = function(type, props) {
//如果是传一个对象进来
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
 //初始化事件对象，type为事件类型，如click，bubbles为是否冒泡，第三个参数表示是否可以用preventDefault方法来取消默认操作
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }
//把zepto对象传进去
})(Zepto)


//接下来为Ajax部分
;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
//用来定制并且触发Ajax相关的事件，这样用户就可以在不同阶段添加对应的操作
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
//setting是用户调用$.ajax(setting)传进来的对象，上面包含了用户需定义的Ajax属性和不同阶段需要执行的操作（事件回调）
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

//下面这个几个函数看名字就是会在Ajax请求的不同阶段被调用，然后这些函数会产生和触发对应事件，执行用户定义的操作
  function ajaxStart(settings) {
//如果global为true,并且active为0，active++是判断再加一，所以可以判断是不是最开始
//然后生成并执行ajaxStart事件上的回调函数
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  
//--$.active 先减一，再判断是否为0，为0才会触发ajaxStop
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
//如果用户的beforeSend事件处理函数返回false，或者triggerGlobal返回false，可以取消这个Ajax请求
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false
//能执行到这里说明ajaxBeforeSend执行没问题，所以触发ajaxSend
    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  
  function ajaxSuccess(data, xhr, settings, deferred) {
//context用户定义的执行回调函数的上下文对象
    var context = settings.context, status = 'success'
//调用成功后需要执行的函数
    settings.success.call(context, data, status, xhr)
//如果加载了callbacks和deferred模块的话，触发deferred对象的resolveWith，执行成功后回调list上的函数
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
//成功执行完之后完成这次Ajax
    ajaxComplete(status, xhr, settings)
  }

  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
//如果是失败了的话，调用rejectWith，执行失败后回调list上的函数
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
//最后也要完成这次Ajax
    ajaxComplete(type, xhr, settings)
  }

  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
//请求关闭
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}


  $.ajaxJSONP = function(options, deferred){
//如果传入对象没有type属性，返回调用ajax方法
    if (!('type' in options)) return $.ajax(options)

//jsonpCallback指的是用户定义的数据返回时调用的函数
    var _callbackName = options.jsonpCallback,
//如果jsonpCallback是函数就返回函数调用结果，否则返回本身，如果_callbackName为falsy，那么返回当前jsonpid作为函数名
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
//缓存起来callback，因为window[callbackName]会被覆盖
      originalCallback = window[callbackName],
      responseData,
//中断请求函数
      abort = function(errorType) {
//触发脚本元素上的error事件
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

//给脚本绑定load和error事件
    $(script).on('load error', function(e, errorType){
//清除掉超时操作
      clearTimeout(abortTimeout)
//用完了的脚本删除掉
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
//如果服务器返回了数据，并且originalCallback为函数的话，就把数据放进去处理
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

//如果ajaxBeforeSend操作返回false的话，就中断该请求
    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }
	
//覆盖原来的callbackName引用，用来获取返回的数据，因为服务器是把数据塞进callback返回的 callback({ “key”: “vlaue” });
    window[callbackName] = function(){
      responseData = arguments
    }

//使用请求外链脚本的方式向服务器发送请求，把callback添加到参数上
    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

//设定超时中断请求，生成的脚本加载完成就会清除掉
    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

//Ajax方法的默认参数对象
  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

//判断传入MIME的类型，转化为对应的字符串
  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

//添加请求参数
  function appendQuery(url, query) {
    if (query == '') return url
//查询第一个出现的&,?等组合，替换为?，以防原URL结尾带有符号
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
//处理转换data和URL
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
//自动把非字符串data序列化
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
//如果是get请求的话把序列化后的字符串数据追加到URL
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

//主方法
  $.ajax = function(options){
//创建新对象复制用户传进来的非undefined值
    var settings = $.extend({}, options || {}),
//如果加载了deferred，callbacks模块，那么就实例化一个$.Deferred对象
        deferred = $.Deferred && $.Deferred()
//遍历默认的Ajax参数，如果用户没有覆盖，那么就是用默认参数值
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

//触发Ajax开始事件及执行对应事件处理函数
    ajaxStart(settings)

//如果crossDomain为falsy值，那么需要设置，先检测url是否为绝对地址（http:// 第二部分不能是/开头，排除文件地址）,用绝对地址表示跨域
//并且再检测请求url的host时候是否等于当前的host
    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

//如果url为falsy值，那么就拿当前地址
    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

//判断url能否匹配 ?任意字符=? ，匹配表示为jsonp请求
    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
//script和JSONP默认缓存
         ('script' == dataType || 'jsonp' == dataType)
        ))
//判断结果为不缓存的话，给链接带上时间戳
      settings.url = appendQuery(settings.url, '_=' + Date.now())

//如果datatype为JSONP，但是格式不对的话，需要纠正，然后发起JSONP请求
    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

//根据数据类型来判断接收类型
    var mime = settings.accepts[dataType],
//用来记录header信息
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
//url如果没有定义请求的协议，那么就和当前页面相同
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
//新建xhr对象
        xhr = settings.xhr(),
//缓存原生的定制header方法
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

//把deferred把promise对象上的方法复制给xhr（包含state，always，then，promise，done，fail，progress方法）  如：xhr.done(function(data, status, xhr){ ... })
    if (deferred) deferred.promise(xhr)

//如果不是跨域的话，则保存异步请求报头x-requested-with: XMLHttpRequest
    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
//设置接收的数据类型
    setHeader('Accept', mime || '*/*')
	
//调用overrideMimeType覆盖服务器返回的MIME类型，用自定义的
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }

//设置发送给服务器的内容类型
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

//设置用户定义的headers
    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

//添加readystatechange监听事件
//readystatechange事件不会有event 对象，使用this因为scope作用域问题可能导致函数运行失败或者报错，因此事件内部引用还是用xhr
    xhr.onreadystatechange = function(){
//当readyState为4， 请求已完成，且响应已就绪
      if (xhr.readyState == 4) {
//取消掉监听
        xhr.onreadystatechange = empty
//取消超时操作
        clearTimeout(abortTimeout)
        var result, error = false
//判断响应状态，通常20几代表成功了部分数据已经返回，另外304表示那个资源没有被修改过，直接从浏览器缓存拿过来就可以
//xhr.status == 0 && protocol == 'file:'应该是浏览器兼容性问题，例如：Opera 状态为204的时候，status收到的为0
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
//获取返回的数据类型，用户有规定的话就不用查服务器返回的了
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
//保存返回的数据
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
//如果接收script的话，在全局范围内运行返回的脚本
//因为默认eval是在当前作用域执行脚本的，因此需要用indirect模式来调用，才能在全局作用域执行脚本
            if (dataType == 'script')    (1,eval)(result)
//如果要接收的是XML的话，需要访问xhr的responseXML 属性才能拿到，responseText是没有的
            else if (dataType == 'xml')  result = xhr.responseXML
//如果期待接收的是JSON，那么先检测是否为空，不为空才把JSON转化为javascript对象
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

//如果error存在，就触发parsererror事件
          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
//到这里表示异步请求成功了
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
//服务器返回状态异常的话，根据状态码决定触发的异常事件
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

//如果ajaxBeforeSend操作返回false的话，就中断该请求
    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

//如果用户定义了xhrFields对象，把值复制到xhr里
    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

//决定是同步的Ajax还是异步的
    var async = 'async' in settings ? settings.async : true
//准备好一个Ajax请求，但还没发送
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

//定制发送给服务器报头信息
    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

//如果有设置了最长等待时间，就设置一个定制器，超时清空回调中断请求
    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  //为下面常用快捷Ajax转化正确的参数
  function parseArguments(url, data, success, dataType) {
//第二个参数为成功回调函数的情况
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
//没有回调函数的情况，只向服务器发送用户数据吧
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

//把当前集合的HTML内容替换成get 异步请求回来的页面内容
  $.fn.load = function(url, data, success){
    if (!this.length) return this
//url 中可以携带一个选择器，返回的内容结构只有匹配该选择器的才会用
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
//修改请求成功后的处理函数，增加对selector的支持
    options.success = function(response){
      self.html(selector ?
//如果提供了selector，创建一个div，把内容过滤后放在里面，然后找到匹配selector的元素，替换self里的结构
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
//执行用户定义的回调
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
//遍历data对象
    $.each(obj, function(key, value) {
      type = $.type(value)
//如若scope存在（第一次执行为没有值跳过），那么是否用传统方式，是的话返回key为空
//不是的话如果用户传的data为简单对象，或者当前值的类型为object，array的话，返回a[key]给key
//否则返回[]给key
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
		
      // handle data in serializeArray() format
//如果scope不存在，且用户传的data是数组，表示用户传的data为[{name:"xx",value:"xx"},{name:"xx2",value:"yy2"}]形式
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
//否则如果用户传的data为对象，值是数组（ 如：{[],[]} ），或者非传统方式下，值是对象的形式（ 如：{{},{}} ），继续遍历里面的数据
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
//例如数据为：{num:[1,2,3]}, 传统方式转化结果为：[a=1,a=2,a=3]  
//非传统转化结果为：[a[]=1,a[]=2,a[]=3]
      else params.add(key, value)
    })
  }

//将用户传的data数据转换为查询字符串的格式
  $.param = function(obj, traditional){
    var params = []
//给params数组添加一个方法，添加的数据格式为：encodeURIComponent(name)=encodeURIComponent(value)
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
//%20（空格）替换为+号
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)


//接下来是表单序列化和提交操作
;(function($){

//过滤出有效的表单字段名和值
  $.fn.serializeArray = function() {
    var el, type, result = []
//获取遍历当前集合下第一个表单所有字段
    $([].slice.call(this.get(0).elements)).each(function(){
      el = $(this)
      type = el.attr('type')
	  //判断字段的类型，排除fieldset，不可用，submit，Reset，button，不是radio且同时不是checkbox，如果是radio或者是checkbox，那么筛选出被选中的，就把该字段添加到result数组里去
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

//将上面过滤出来的数组转化为name=1&name2=2的字符串形式
  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
//如果传入了事件处理函数，那么就添加事件监听
    if (callback) this.bind('submit', callback)
//否则，就主动触发submit事件，并且用submit方法来表单如果没有preventDefault()的话
//直接javascript调用submit() 提交的话， 不会触发submit事件
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)


//接下来是ie模块，用来支持桌面ie10和手机win8浏览器
;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
//不支持__proto__的话，就重新定义Z和isZ方法
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
//用对象拓展的方式来获得$,fn上的方法
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
//如果getComputedStyle传入的不是一个有效元素会导致错误的话，需要修正一下，放到try中执行
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)


//接下来是检测模块，提供系统和浏览器信息
;(function($){
  function detect(ua){
//在zepto上拓展两个对象os和browser，用来存储相关信息，match方法返回一个数组，里面存放被匹配的结果
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
      android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
      osx = !!ua.match(/\(Macintosh\; Intel /),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      wp = ua.match(/Windows Phone ([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
      playbook = ua.match(/PlayBook/),
      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
      firefox = ua.match(/Firefox\/([\d.]+)/),
      ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
      webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
      safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/)

    // Todo: clean this up with a better OS/browser seperation:
    // - discern (more) between multiple browsers on android
    // - decide if kindle fire in silk mode is android or not
    // - Firefox on Android doesn't specify the Android version
    // - possibly devide in os, device and browser hashes

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null
    if (wp) os.wp = true, os.version = wp[1]
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (bb10) os.bb10 = true, os.version = bb10[2]
    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
    if (playbook) browser.playbook = true
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
    if (chrome) browser.chrome = true, browser.version = chrome[1]
    if (firefox) browser.firefox = true, browser.version = firefox[1]
    if (ie) browser.ie = true, browser.version = ie[1]
    if (safari && (osx || os.ios)) {browser.safari = true; if (osx) browser.version = safari[1]}
    if (webview) browser.webview = true

    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
      (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
    os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
      (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
      (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)


//接下来是CSS3动画模块
;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty, transitionDuration, transitionTiming, transitionDelay,
    animationName, animationDuration, animationTiming, animationDelay,
    cssReset = {}

//将驼峰形式的属性名转为CSS形式：lineHeight =>  line-height
  function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
//给TransitionEnd  AnimationEnd事件提添加前缀
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

  $.each(vendors, function(vendor, event){
//用来检测当前浏览器适用哪种前缀
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-'
      eventPrefix = event
      return false
    }
  })

//给变量赋值，各属性修改为带前缀的值，cssReset用来重置动画属性，就是把添加上去的样式在动画结束后删掉
  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
  cssReset[transitionDuration = prefix + 'transition-duration'] =
  cssReset[transitionDelay    = prefix + 'transition-delay'] =
  cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
  cssReset[animationName      = prefix + 'animation-name'] =
  cssReset[animationDuration  = prefix + 'animation-duration'] =
  cssReset[animationDelay     = prefix + 'animation-delay'] =
  cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

//动画的全局设置参数
  $.fx = {
//在支持CSS transition的浏览器上是返回false的，设为TRUE禁用动画过渡
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
//transition动画执行结束时，触发webkitTransitionEnd事件   如：-webkit-transition: width 0.25s ease-in;
    transitionEnd: normalizeEvent('TransitionEnd'),
//animation（keyframe）动画执行结束时，触发webkitAnimationEnd事件 如：-webkit-animation: animateFn 0.5s ease-in;
    animationEnd: normalizeEvent('AnimationEnd')
  }

//动画animate的接口，对传进来的参数进行分析判断，重新赋值
  $.fn.animate = function(properties, duration, ease, callback, delay){
    if ($.isFunction(duration))
      callback = duration, ease = undefined, duration = undefined
    if ($.isFunction(ease))
      callback = ease, ease = undefined
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    if (delay) delay = parseFloat(delay) / 1000
    return this.anim(properties, duration, ease, callback, delay)
  }

  $.fn.anim = function(properties, duration, ease, callback, delay){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
        fired = false

    if (duration === undefined) duration = $.fx.speeds._default / 1000
    if (delay === undefined) delay = 0
//如果off被人设为TRUE，或者不支持的话，没有动画，直接跳到最终样式
    if ($.fx.off) duration = 0

//如果传入的properties是一个动画名
    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationDelay] = delay + 's'
//默认采用linear速度
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
//如果是translate rotate等transform变形情况，就需要用它们的语法
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
//否则就保存属性值，和转化好的属性名
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
//需要多个属性变化的话用,来分割  transition-property: width,height;
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionDelay] = delay + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      } else
//因为transitionEnd事件不能保证被触发，因此这里的情况就是针对没有触发的，通过下面定时来主动执行事件，把添加的事件监听移除
        $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

      fired = true
//把添加上去的CSS动画属性清除，这样keyframe下次才能继续生效
      $(this).css(cssReset)
//到这里才是执行用户定义的回调
      callback && callback.call(this)
    }
    if (duration > 0){
//绑定动画完成事件监听
      this.bind(endEvent, wrappedCallback)
      // transitionEnd is not always firing on older Android phones
      // so make sure it gets fired
      setTimeout(function(){
        if (fired) return
        wrappedCallback.call(that)
      }, (duration * 1000) + 25)
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

//设置CSS执行动画
    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

//释放内存
  testEl = null
})(Zepto)



//接下来这个模块是预定义的动画方法，在上面animate方法上封装
;(function($, undefined){
  var document = window.document, docElem = document.documentElement,
    origShow = $.fn.show, origHide = $.fn.hide, origToggle = $.fn.toggle

//下面各种动画是调用这个函数在调用animate之前对参数进行预处理
  function anim(el, speed, opacity, scale, callback) {
    if (typeof speed == 'function' && !callback) callback = speed, speed = undefined
    var props = { opacity: opacity }
//通过scale变形来实现放大缩小的显隐效果
    if (scale) {
      props.scale = scale
//定义旋转的中心点
      el.css($.fx.cssPrefix + 'transform-origin', '0 0')
    }
    return el.animate(props, speed, null, callback)
  }

  function hide(el, speed, scale, callback) {
    return anim(el, speed, 0, scale, function(){
//动画结束后调用旧方法让当前元素集合消失
      origHide.call($(this))
//然后再触发用户定义的回调
      callback && callback.call(this)
    })
  }

//把show指向新的函数，添加对动画周期，回调函数的支持
  $.fn.show = function(speed, callback) {
//origShow是原来的show方法，例如原来的元素是display:none，那么调用这个可以display:block，后面马上css('opacity', 0)变成透明
    origShow.call(this)
    if (speed === undefined) speed = 0
    else this.css('opacity', 0)
//这里的缩放scale(1,1)是对应下面hide方法，如果没有执行过带speed参数的hide方法，是不会有缩放效果
    return anim(this, speed, 1, '1,1', callback)
  }

//把hide指向新的函数
  $.fn.hide = function(speed, callback) {
//如果没有传参数，调用旧的hide方法就可以
    if (speed === undefined) return origHide.call(this)
//如果传入了speed参数，通过这里的缩放scale(0,0)，就会有缩小效果，下次调用show也会有放大效果（因为被缩成小了）
    else return hide(this, speed, '0,0', callback)
  }

//把toggle指向新的函数
  $.fn.toggle = function(speed, callback) {
//没有传入speed或者speed返回布尔值的话，就使用原来的toggle方法
    if (speed === undefined || typeof speed == 'boolean')
      return origToggle.call(this, speed)
//否则遍历当前集合，判断目前的display状态，然后调用show，或者hide方法
    else return this.each(function(){
      var el = $(this)
      el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback)
    })
  }

//把透明度渐变到指定数值
  $.fn.fadeTo = function(speed, opacity, callback) {
    return anim(this, speed, opacity, null, callback)
  }

//元素渐变出来
  $.fn.fadeIn = function(speed, callback) {
    var target = this.css('opacity')
//如果当前是不透明的，那么就把透明度该为0，然后再进行渐变
    if (target > 0) this.css('opacity', 0)
//如果当前是透明或者display：none的，那么就先显示出来，然后再把透明度渐变到1
    else target = 1
    return origShow.call(this).fadeTo(speed, target, callback)
  }

  $.fn.fadeOut = function(speed, callback) {
    return hide(this, speed, null, callback)
  }

  $.fn.fadeToggle = function(speed, callback) {
    return this.each(function(){
      var el = $(this)
//通过判断当前透明度或display来决定使用fadein还是fadeout
      el[
        (el.css('opacity') == 0 || el.css('display') == 'none') ? 'fadeIn' : 'fadeOut'
      ](speed, callback)
    })
  }

})(Zepto)


//实验性质的模块，在IOS上移除图片元素之后回收内存
;(function($){
  var cache = [], timeout

  $.fn.remove = function(){
    return this.each(function(){
      if(this.parentNode){
        if(this.tagName === 'IMG'){
//缓存对img对象的引用
          cache.push(this)
//这是一个1*1无内容的图，把图片的内容指向它，因为src是指向图片资源地址（内存地址），先去掉对内存地址的引用(回收内存)，然后移除img元素，最后清除对img节点的引用？
          this.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
          if (timeout) clearTimeout(timeout)
//一段时间后清除掉缓存的对img的引用
          timeout = setTimeout(function(){ cache = [] }, 60000)
        }
        this.parentNode.removeChild(this)
      }
    })
  }
})(Zepto)


//以下模块添加对任意对象数据存储的支持
;(function($){
//data对象就是用来存放每个元素对应数据集的地方
  var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
    exp = $.expando = 'Zepto' + (+new Date()), emptyArray = []

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
//获取元素的id，通过id获取在data对象中的数据集
    var id = node[exp], store = id && data[id]
//如果没有穿传name，就返回整个数据集，没有数据集的话转化为设置操作
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
//name属性在数据集有的话，返回对应数据
        if (name in store) return store[name]
//不行尝试将name转为驼峰形式查找
        var camelName = camelize(name)
        if (camelName in store) return store[camelName]
      }
//上面都查找不到的话就用原来的data方法去该元素上查找对应的data-*属性
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
//获取id，没有的话赋一个，并且在元素上也保存
    var id = node[exp] || (node[exp] = ++$.uuid),
//获取id对象的数据集，没有的话读取元素节点上的所有data-*属性
      store = data[id] || (data[id] = attributeData(node))
//如果name不为undefined的话，就把驼峰化之后的name作为key，和对应value一起保存到store对象上
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {}
//通过attributes来获取元素上的属性集合
    $.each(node.attributes || emptyArray, function(i, attr){
//检测每个属性名是不是以data-开头，attr获取： id="a"，那么attr.name为"id"
      if (attr.name.indexOf('data-') == 0)
//属性名去掉data-之后驼峰化作为属性名，value则以原本的数据类型来保存
        store[camelize(attr.name.replace('data-', ''))] =
          $.zepto.deserializeValue(attr.value)
    })
//返回数据集
    return store
  }

//设置或者查询数据操作
  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
//没传value，表示以对象的形式把数据传了进来
      $.isPlainObject(name) ?
//如果name是对象的话，就遍历当前集合，再遍历传进来的对象给每个元素设置数据
        this.each(function(i, node){
          $.each(name, function(key, value){ setData(node, key, value) })
        }) :
        // get value from first element
//如果传的那么是字符串的话，就返回第一个元素中对应的数据，没有元素的返回undefined给value
        (0 in this ? getData(this[0], name) : undefined) :
      // set value on all elements
//如果value不为undefined的话，直接调用setData来设值
      this.each(function(){ setData(this, name, value) })
  }

//删除数据操作
  $.fn.removeData = function(names) {
//切割字符串为数组
    if (typeof names == 'string') names = names.split(/\s+/)
    return this.each(function(){
      var id = this[exp], store = id && data[id]
      if (store) $.each(names || store, function(key){
//逐个删除，如果存在names对象，那么就删除对应的，否则该元素的数据全部删除
        delete store[names ? camelize(this) : key]
      })
    })
  }

  // Generate extended `remove` and `empty` functions
  ;['remove', 'empty'].forEach(function(methodName){
    var origFn = $.fn[methodName]
    $.fn[methodName] = function() {
//获取该集合下所有子集
      var elements = this.find('*')
//remove操作相对empty多了一步，把当前元素添加到他的子元素尾部，因为要配合empty方法（看下面注释），remove是需要把当前元素及其子节点的清掉，所以当前元素添加进elements
      if (methodName === 'remove') elements = elements.add(this)
//empty方法是只清除掉里面的元素及其数据，所以这里不能用this.removeData()，不然连当前元素的数据也会清掉
      elements.removeData()
      return origFn.call(this)
    }
  })
})(Zepto)



//接下来这个是Deferred模块，需要配合后面callbacks模块一起用，可以把多个回调添加到回调队列，触发回调对象等，例如xhr.done(function(data, status, xhr){ ... })，这里xhr就是一个promises
;(function($){
  var slice = Array.prototype.slice

  function Deferred(func) {
    var tuples = [
          // action, add listener, listener list, final state
          [ "resolve", "done", $.Callbacks({once:1, memory:1}), "resolved" ],
          [ "reject", "fail", $.Callbacks({once:1, memory:1}), "rejected" ],
          [ "notify", "progress", $.Callbacks({memory:1}) ]
        ],
        state = "pending",
        promise = {
//获取当前Deferred实例的状态
          state: function() {
            return state
          },
//这个方式就是把回调函数同时添加到成功和失败的执行列表，无论成败都执行需要执行这个函数意思
          always: function() {
            deferred.done(arguments).fail(arguments)
            return this
          },
//调用该方法先进行一些操作，原理内部创建一个deferred对象,返回promise对象（deferred对象的子集）
//var defer = $.Deferred(),
//    filtered = defer.then(function( value ) {
//      return value * 2;
//    });
//  defer.resolve( 5 );
//  filtered.done(function( value ) {
//    $( "body" ).html( "Value is ( 2*5 = : " + value );
//  });
//  $( "body" ).on( "click", filterResolve );
          then: function(/* fnDone [, fnFailed [, fnProgress]] */) {
            var fns = arguments
//因为Deferred传了函数进去的话，会把deferred作为参数传进来
            return Deferred(function(defer){
              $.each(tuples, function(i, tuple){
//传进来的参数是函数就保存函数，否则为false
                var fn = $.isFunction(fns[i]) && fns[i]
//调用deferred对象上的done，fail，progress方法，添加到各自事件处理函数列表中
                deferred[tuple[1]](function(){
//这里执行用户传的事件处理函数，this为用户调用Ajax是传的context，并保存返回值
                  var returned = fn && fn.apply(this, arguments)
//接下来需要触发新创建的deferred对象上对应的事件，如上面例子的done，并把返回值传进去
//如果执行后返回deferred对象( 如返回一个xhr: return $.ajax(...); )，那么把对应事件触发函数添加上去(重新绑定执行上下文)，例如当xhr完成后触发done队列，首先是触发resolveWith，判断context
                  if (returned && $.isFunction(returned.promise)) {
                    returned.promise()
                      .done(defer.resolve)
                      .fail(defer.reject)
                      .progress(defer.notify)
                  } else {
//如果没有返回deferred对象，那么直接调用resolveWith，rejectWith，notifyWith，触发新生成的deferred对象上对应的事件（因为是绑定在这上面的，如上面例子）
                    var context = this === promise ? defer.promise() : this,
                        values = fn ? [returned] : arguments
                    defer[tuple[0] + "With"](context, values)
                  }
                })
              })
              fns = null
            }).promise()
          },

          promise: function(obj) {
            return obj != null ? $.extend( obj, promise ) : promise
          }
        },
//这个是返回的接口对象 var myDeferred = $.Deferred()
        deferred = {}

    $.each(tuples, function(i, tuple){
//获取callback对象实例
      var list = tuple[2],
//获取最终状态码
          stateString = tuple[3]
//生成不同状态(done，fail，progress)事件添加方法，拓展到输出接口上
      promise[tuple[1]] = list.add

//如果存在最终状态，那么给回调列表添加三个方法
      if (stateString) {
        list.add(function(){
//把改变当前Deferred实例状态的方法添加到回调列表中
          state = stateString
//注意这里添加的第二个方法使用了位运算0^1=>1，1^1=>0
//0意味着已解决状态，所以禁用掉失败后调用的list对象，锁住进行中（progress）的list列表，不能再执行，因为都出结果了，要么成功要么失败
//1意味着失败状态，因此禁用掉成功以后才执行的list，同样锁住progress
//也就是说当触发成功或失败事件的回调list时，第一个执行的回调是改变状态，然后是废弃掉与之相对的事件list，然后锁住progress，然后才是执行用户定义的函数
        }, tuples[i^1][2].disable, tuples[2][2].lock)
      }

//触发不同状态list上函数的方法（resolve，reject，notify），拓展到输出接口上
      deferred[tuple[0]] = function(){
        deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments)
        return this
      }
//生成不同状态下配置触发回调参数的方法（resolveWith，rejectWith，notifyWith），拓展到输出接口上
      deferred[tuple[0] + "With"] = list.fireWith
    })

//拓展输出的接口对象，把promise对象里的方法也复制进去
    promise.promise(deferred)
//如果实例化的时候传入了函数，把deferred作为上下文并作为参数传进去（上面then方法）
    if (func) func.call(deferred, deferred)
//返回接口
    return deferred
  }

//该方法提供基于一个或多个对象运行回调的功能
  $.when = function(sub) {
//复制传进来的参数
    var resolveValues = slice.call(arguments),
        len = resolveValues.length,
        i = 0,
//如果传进来的参数存在且length等于1，就判断是不是Promise，是返回1，不是返回0
        remain = len !== 1 || (sub && $.isFunction(sub.promise)) ? len : 0,
//根据情况生成deferred对象，有传进来就用传进来的，没有生成一个
        deferred = remain === 1 ? sub : Deferred(),
        progressValues, progressContexts, resolveContexts,

        updateFn = function(i, ctx, val){
          return function(value){
//this指向fireWith的context（运行时为this），同样value为fireWith的arguments
            ctx[i] = this
            val[i] = arguments.length > 1 ? slice.call(arguments) : value
//如果传进来的progressValues添加当前参数后等于progressValues，那么表示正在处理
            if (val === progressValues) {
              deferred.notifyWith(ctx, val)
//remain减到0触发resolveWith（done）
            } else if (!(--remain)) {
              deferred.resolveWith(ctx, val)
            }
          }
        }

//如果传进多个对象
    if (len > 1) {
//因为知道了数组的长度，用new Array(len)方式创建
      progressValues = new Array(len)
      progressContexts = new Array(len)
      resolveContexts = new Array(len)
//遍历传进来的参数
      for ( ; i < len; ++i ) {
//如果是Deferred或Promise
        if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
//给每个promise添加事件处理,updateFn用来更新触发各自事件的参数
          resolveValues[i].promise()
            .done(updateFn(i, resolveContexts, resolveValues))
            .fail(deferred.reject)
            .progress(updateFn(i, progressContexts, progressValues))
        } else {
          --remain
        }
      }
    }
	
//传进来的参数既不是Deferred 又不是Promise，触发resolveWith方法（done）
    if (!remain) deferred.resolveWith(resolveContexts, resolveValues)
//返回promise对象（deferred对象的子集）
    return deferred.promise()
  }

  $.Deferred = Deferred
})(Zepto)



//接下这个模块定义了回调函数的队列，可以添加或触发这里面的函数，使用：
//var myCallback = $.Callbacks({once:true});
//myCallback.add(fun1);
//myCallback.add(fun2);
//myCallback.fire();
;(function($){
  // Create a collection of callbacks to be fired in a sequence, with configurable behaviour
  // Option flags:
  //   - once: Callbacks fired at most one time.
  //   - memory: Remember the most recent context and arguments
  //   - stopOnFalse: Cease iterating over callback list
  //   - unique: Permit adding at most one instance of the same callback
  $.Callbacks = function(options) {
//复制用户传的配置参数到一个新对象里
    options = $.extend({}, options)

//创建这个模块私有的成员属性
    var memory, // Last fire value (for non-forgettable lists)
        fired,  // Flag to know if list was already fired
        firing, // Flag to know if list is currently firing
        firingStart, // First callback to fire (used internally by add and fireWith)
        firingLength, // End of the loop when firing
        firingIndex, // Index of currently firing callback (modified by remove if needed)
        list = [], // Actual callback list
        stack = !options.once && [], // Stack of fire calls for repeatable lists
//触发list上函数的方法，data是个数组，包含实例对象和参数们
        fire = function(data) {
//如果设置了需要记住上次最后的对象和参数，把么就把fire的参数存在memory里
          memory = options.memory && data
//设为已经触发过状态
          fired = true
//设置目前触发到哪里位置
          firingIndex = firingStart || 0
//设置开始触发的位置
          firingStart = 0
//设置循环的长度
          firingLength = list.length
//设置为触发中状态
          firing = true
          for ( ; list && firingIndex < firingLength ; ++firingIndex ) {
//从数组第一个开始循环，如果在循环的时候，有一个回调执行完返回false结果，并且设置了stopOnFalse的话，退出循环，memory也就为false
            if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
              memory = false
              break
            }
          }
//到这里list已经执行完了（不论成败），所以把正在执行状态关了
          firing = false
          if (list) {
//如果是可重复执行模式（默认模式），那么就从头开始执行，调用$.Callbacks().fired()多少次重复多少次
            if (stack) stack.length && fire(stack.shift())
//否则在不可重复模式下如果没有异常的话，就把list数组清空
            else if (memory) list.length = 0
//如果上面情况都不成立，就禁用掉整个模块
            else Callbacks.disable()
          }
        },

//这个是返回的接口对象
        Callbacks = {
//添加回调函数到回调队列里
          add: function() {
            if (list) {
              var start = list.length,
                  add = function(args) {
//遍历传进来的参数
                    $.each(args, function(_, arg){
//如果当前参数为函数
                      if (typeof arg === "function") {
//如果用户没有设置同一个函数只允许添加一次，或者限制了但是目前的列表里没有该函数，就把该函数添加到队列里
                        if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                      }
//如果是当前参数为数组，那么继续调用add方法，遍历当前参数里面的内容
                      else if (arg && arg.length && typeof arg !== 'string') add(arg)
                    })
                  }
              add(arguments)
			  
//如果正在触发回调列表里的函数，因为list尾部增加了数据，所以要更新firingLength总长度，因为它是缓存了list的长度不会自动更新
              if (firing) firingLength = list.length
//如果当前没有在触发的话，就查看是否存在上一次最后的data（实例对象和参数）
              else if (memory) {
//有的话，定位开始触发地点，也就是没有添加新的回调函数之前列表的结尾
                firingStart = start
//开始从上次结束位置触发回调，因为start是长度值，比list数组索引+1，所以直接执行新添加的回调
                fire(memory)
              }
            }
            return this
          },
//从回调列表里移除回调函数
          remove: function() {
            if (list) {
              $.each(arguments, function(_, arg){
                var index
//查看给的函数是否在回调列表里，inArray会返回在匹配到的目标在数组中的索引
                while ((index = $.inArray(arg, list, index)) > -1) {
//找到的话就删除它，注意这样数组长度是会-1的
                  list.splice(index, 1)
                  // Handle firing indexes
//如果list正在触发的话
                  if (firing) {
//因为list被删掉一个，所以循环次数也应该-1
                    if (index <= firingLength) --firingLength
//如果被删除的回调是已经执行过的，相当于整个数组里面内容向前移动一格，因此当前的索引也需要-1，不然会错过一个回调
                    if (index <= firingIndex) --firingIndex
                  }
                }
              })
            }
            return this
          },
//判断传进来的函数list有没有，如果没有传参数或传的不是函数，返回TRUE
          has: function(fn) {
            return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
          },
//清空目前list里的函数，但以后可以再进行操作
          empty: function() {
            firingLength = list.length = 0
            return this
          },
//设为不可用，也就是当前实例对象作废了，无法添加删除触发等等
          disable: function() {
            list = stack = memory = undefined
            return this
          },
//检测当前Callback实例对象是否被禁用了
          disabled: function() {
            return !list
          },
//锁住，调用以后就不能再触发fire()
          lock: function() {
            stack = undefined;
            if (!memory) Callbacks.disable()
            return this
          },
//看当前实例对象是否锁住
          locked: function() {
            return !stack
          },
//绑定实例对象和附加参数
          fireWith: function(context, args) {
//如果list存在并且没有触发过，或者触发过了但为可重复执行模式
            if (list && (!fired || stack)) {
              args = args || []
//把当前实例对象和额外参数作为data，可以使用slice的话就复制一份不共用
              args = [context, args.slice ? args.slice() : args]
//如果正在触发，那么就保存到stack数组里，等到list触发完了再触发
              if (firing) stack.push(args)
//否则直接触发
              else fire(args)
            }
            return this
          },
//传入附加参数，正式开始，this指向实例对象
          fire: function() {
            return Callbacks.fireWith(this, arguments)
          },
//看list是否被触发过了
          fired: function() {
            return !!fired
          }
        }

    return Callbacks
  }
})(Zepto)



//接下来这个模块提供了实验性质的选择器拓展  例如：$('div:first') 或者 el.is(':visible')
;(function($){
//首先，保存旧的方法
  var zepto = $.zepto, oldQsa = zepto.qsa, oldMatches = zepto.matches

//判断元素是否可见
  function visible(elem){
    elem = $(elem)
//如果元素有高度或者宽度（不能为0）就返回数值，否则返回false，并且不能设置了none
    return !!(elem.width() || elem.height()) && elem.css("display") !== "none"
  }

  // Implements a subset from:
  // http://api.jquery.com/category/selectors/jquery-selector-extensions/
  //
  // Each filter function receives the current index, all nodes in the
  // considered set, and a value if there were parentheses. The value
  // of `this` is the node currently being considered. The function returns the
  // resulting node(s), null, or undefined.
  //
  // Complex selectors are not supported:
  //   li:has(label:contains("foo")) + li:has(label:contains("bar"))
  //   ul.inner:first > li

//obj[':'] = {} 是在原有对象上拓展，如果直接 obj = {}的话，是会创建一个新对象然后把obj指向新对象，而不是在原来对象上拓展
  var filters = $.expr[':'] = {
    visible:  function(){ if (visible(this)) return this },
    hidden:   function(){ if (!visible(this)) return this },
    selected: function(){ if (this.selected) return this },
    checked:  function(){ if (this.checked) return this },
    parent:   function(){ return this.parentNode },
    first:    function(idx){ if (idx === 0) return this },
    last:     function(idx, nodes){ if (idx === nodes.length - 1) return this },
    eq:       function(idx, _, value){ if (idx === value) return this },
    contains: function(idx, _, text){ if ($(this).text().indexOf(text) > -1) return this },
    has:      function(idx, _, sel){ if (zepto.qsa(this, sel).length) return this }
  }

//匹配div:first等带伪类的选择器
  var filterRe = new RegExp('(.*):(\\w+)(?:\\(([^)]+)\\))?$\\s*'),
//匹配 >开头的选择器
      childRe  = /^\s*>/,
//(+new Date()) 相当于 (new Date()).getTime()
      classTag = 'Zepto' + (+new Date())

//这个函数主要是处理切割判断selector
  function process(sel, fn) {
    // quote the hash in `a[href^=#]` expression
    sel = sel.replace(/=#\]/g, '="#"]')
//使用正则对象的exec方法可以返回结果数组，没有的话返回null
    var filter, arg, match = filterRe.exec(sel)
//match[2]返回的是第二个表达式匹配的内容（也就是 : 后面第一对括号匹配到的），例如:first :visible等，再查找filters里有没有对应方法
    if (match && match[2] in filters) {
//保存找到的方法，额外参数和选择器。 额外的参数例如：$("#k:contains('k')")
      filter = filters[match[2]], arg = match[3]
      sel = match[1]
      if (arg) {
//额外的参数如果可以转化为数字就转化
        var num = Number(arg)
        if (isNaN(num)) arg = arg.replace(/^["']|["']$/g, '')
        else arg = num
      }
    }
    return fn(sel, filter, arg)
  }

//把zepto.qsa指向新函数
  zepto.qsa = function(node, selector) {
    return process(selector, function(sel, filter, arg){
      try {
        var taggedParent
//如果选择器不存在，但是伪元素存在 如：el.is(':visible')情况
        if (!sel && filter) sel = '*'
//如果选择的是下一级子选择器情况
        else if (childRe.test(sel))
          // support "> *" child queries by tagging the parent node with a
          // unique class and prepending that classname onto the selector
//给当前选中元素(通常是document)添加一个唯一的类，然后把选择器改为该类后代下的选择器
          taggedParent = $(node).addClass(classTag), sel = '.'+classTag+' '+sel

//调用旧的querySelectorAll方法获取匹配元素
        var nodes = oldQsa(node, sel)
      } catch(e) {
        console.error('error performing selector: %o', selector)
        throw e
      } finally {
        if (taggedParent) taggedParent.removeClass(classTag)
      }
      return !filter ? nodes :
//有伪类选择器的情况，在选出的集合里逐个调用filter方法，符合条件的话会返回对象，否者返回undefined的会被map过滤掉
        zepto.uniq($.map(nodes, function(n, i){ return filter.call(n, i, nodes, arg) }))
    })
  }

  zepto.matches = function(node, selector){
    return process(selector, function(sel, filter, arg){
      return (!sel || oldMatches(node, sel)) &&
        (!filter || filter.call(node, null, arg) === node)
    })
  }
})(Zepto)


//接下来这个模块提供触屏事件支持
;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
//触发长按的时间
    longTapDelay = 750,
    gesture

//确定滑动方向
  function swipeDirection(x1, x2, y1, y2) {
//首先判断垂直方向改变差值和水平方向差值哪个大，然后如果是水平方向大的话再确定向左还是向右滑动
    return Math.abs(x1 - x2) >=
      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

//触发长按事件
  function longTap() {
//把定时器回收
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

//取消掉会触发长按事件的定时器
  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
//回收
    longTapTimeout = null
  }

//取消所有事件的触发
  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }


  function isPrimaryTouch(event){
//pointer事件里面的pointerType属性可以获得源事件是哪一种： touch pen mouse
    return (event.pointerType == 'touch' ||
      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
//isPrimary属性用来判断 primary pointer是不是在当前页面上的
      && event.isPrimary
  }

//判断是不是pointer事件类型，因为在window手机里是触发pointer事件
  function isPointerEventType(e, type){
    return (e.type == 'pointer'+type ||
      e.type.toLowerCase() == 'mspointer'+type)
  }

  $(document).ready(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

//如果微软的手势对象存在，这个对象已经封装好了各种手势，不需要自己去处理识别
    if ('MSGesture' in window) {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(document)
//MSGestureEnd事件当触碰物都离开屏幕，屏幕上没有活动时触发
      .bind('MSGestureEnd', function(e){
//velocityX属性获得x轴运动速度，velocityY获得y轴运动速度，可以用来判断方向
        var swipeDirectionFromVelocity =
          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
//如果获取到方向值的话，就触发滑动和滑动+方向事件（例如 swipeleft）
        if (swipeDirectionFromVelocity) {
          touch.el.trigger('swipe')
          touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
        }
      })
//touch事件是处理触控事件，pointer事件则是把mouse，pen，touch事件都统一管理的事件
//蛋疼的是，目前基本上就IE（10+）支持pointer（但和标准有点不同   http://msdn.microsoft.com/en-us/library/windows/apps/xaml/hh441233.aspx#events）
//其他的浏览器，都仅支持 touch ，但 IE 不支持touch，搞了一套MSGesture，所以兼容吧
//MSPointerDown是微软早期实现时带有前缀，ie（11+）开始去掉
      .on('touchstart MSPointerDown pointerdown', function(e){
//如果是pointerdown事件（button属性不为0时触发，button指的是pointer设备哪个按钮被按下了，例如鼠标上按钮，触控笔上的按钮）
//并且primary pointer不是当前页面的话，就退出
        if((_isPointerType = isPointerEventType(e, 'down')) &&
          !isPrimaryTouch(e)) return
//如果是pointer的话，用e来获取第一个触碰点信息。touch事件把所有触碰点信息保存在touches属性数组里，0获取第一个触碰点
        firstTouch = _isPointerType ? e : e.touches[0]
//以防万一，清除以前可能残留的触控坐标数据
        if (e.touches && e.touches.length === 1 && touch.x2) {
          // Clear out touch movement data if we have it sticking around
          // This can occur if touchcancel doesn't fire due to preventDefault, etc.
          touch.x2 = undefined
          touch.y2 = undefined
        }
        now = Date.now()
//本次触控和上次触控的时差，用来判断是不是双击
        delta = now - (touch.last || now)
//获取被触摸目标元素名称，当前节点没有的话获取父节点(例如文字节点)
        touch.el = $('tagName' in firstTouch.target ?
          firstTouch.target : firstTouch.target.parentNode)
//取消掉触发单击事件的定时器，因为可能是双击
        touchTimeout && clearTimeout(touchTimeout)
//获取触摸点在页面内坐标
        touch.x1 = firstTouch.pageX
        touch.y1 = firstTouch.pageY
//如果时差属于双击情况，那么就设置双击事件为真
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
//保存这次的触控开始的事件，作为下一次触控的last时间
        touch.last = now
//设置长按定时器，在longTapDelay定义的时间内没有被取消就触发长按事件
        longTapTimeout = setTimeout(longTap, longTapDelay)
        // adds the current touch contact for IE gesture recognition
//如果MSGesture事件存在，那么把当前接触点添加到MSGesture实例
        if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
      })
//添加在触屏上移动事件的监听
      .on('touchmove MSPointerMove pointermove', function(e){
        if((_isPointerType = isPointerEventType(e, 'move')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
//取消长按定时，因为已经在屏幕上移动了
        cancelLongTap()
//把移动时的坐标保存起来
        touch.x2 = firstTouch.pageX
        touch.y2 = firstTouch.pageY
//注意这里是保存每次移动时新坐标和源触碰点的差值
        deltaX += Math.abs(touch.x1 - touch.x2)
        deltaY += Math.abs(touch.y1 - touch.y2)
      })
//添加离开触屏事件监听
      .on('touchend MSPointerUp pointerup', function(e){
        if((_isPointerType = isPointerEventType(e, 'up')) &&
          !isPrimaryTouch(e)) return
//离开屏幕如果长按事件触发了，就把定时器标示符设为null。没有触发就取消定时器。
        cancelLongTap()

        // swipe
//如果有移动并且移动距离大于30，触发移动事件
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

//通过定时来定位，例如用户其实是希望滚动页面，那么就可以定位各个触控事件并取消掉他们
          swipeTimeout = setTimeout(function() {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
//清空触屏产生的数据
            touch = {}
          }, 0)

        // normal tap
        else if ('last' in touch)
          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (deltaX < 30 && deltaY < 30) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap')
//用户如果调用cancelTouch方法的话，就把所有事件处理和touch数据都清掉了，因此就不用等250毫秒才触发单击，可以实现更加快速单击触屏响应
              event.cancelTouch = cancelAll
              touch.el.trigger(event)

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null
                  if (touch.el) touch.el.trigger('singleTap')
                  touch = {}
                }, 250)
              }
            }, 0)
          } else {
            touch = {}
          }
          deltaX = deltaY = 0

      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel', cancelAll)

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll)
  })

//生成各种手势事件监听方法
  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  })
})(Zepto)



//接下来这个模块封装了IOS的放大缩小手势
//在IOS 2.0的浏览器之后引入  （https://developer.apple.com/library/safari/documentation/UserExperience/Reference/GestureEventClassReference/GestureEvent/GestureEvent.html）
;(function($){
  if ($.os.ios) {
    var gesture = {}, gestureTimeout

    function parentIfText(node){
      return 'tagName' in node ? node : node.parentNode
    }

//当两个手指放在屏幕上时触发
    $(document).bind('gesturestart', function(e){
//获取当前时间，以及求时间差
      var now = Date.now(), delta = now - (gesture.last || now)
      gesture.target = parentIfText(e.target)
      gestureTimeout && clearTimeout(gestureTimeout)
//获取两根手指间的距离
      gesture.e1 = e.scale
      gesture.last = now
//当两个手指都在触屏上移动时触发
    }).bind('gesturechange', function(e){
//获取移动时两个手指间的距离
      gesture.e2 = e.scale
//当第二根手指离开屏幕时触发
    }).bind('gestureend', function(e){
//如果两个手指都有移动过
      if (gesture.e2 > 0) {
//根据开始距离和最后结束移动时的距离来计算有没有缩放，再判断是放大还是缩小
        Math.abs(gesture.e1 - gesture.e2) != 0 && $(gesture.target).trigger('pinch') &&
          $(gesture.target).trigger('pinch' + (gesture.e1 - gesture.e2 > 0 ? 'In' : 'Out'))
        gesture.e1 = gesture.e2 = gesture.last = 0
//手指没有移动过就清除数据
      } else if ('last' in gesture) {
        gesture = {}
      }
    })

//生成缩放事件监听方法
    ;['pinch', 'pinchIn', 'pinchOut'].forEach(function(m){
      $.fn[m] = function(callback){ return this.bind(m, callback) }
    })
  }
})(Zepto)


//接下来这个模块添加对链式方法支持 $(window).method1().method2().methodN()
;(function($){
//取回最初匹配到的集合  例如：$("body").children().css("border","2px solid red").end().css("border","2px solid yellow") 子元素红边框，body黄边框
  $.fn.end = function(){
    return this.prevObject || $()
  }

//把最初集合也添加到当前集合中  例如：$("body").children().andSelf().css("border","2px solid red")这样body也会被添加边框
  $.fn.andSelf = function(){
    return this.add(this.prevObject || $())
  }

  'filter,add,not,eq,first,last,find,closest,parents,parent,children,siblings'.split(',').forEach(function(property){
//保存上面方法原来的函数
    var fn = $.fn[property]
//指向新的函数
    $.fn[property] = function(){
      var ret = fn.apply(this, arguments)
//保存当前对象
      ret.prevObject = this
      return ret
    }
  })
})(Zepto)



//这模块用来修复低版本IOS的问题，String.prototype可能会缺失trim方法 ，Array.prototype可能会缺失 reduce() 
;(function(undefined){
  if (String.prototype.trim === undefined) // fix for iOS 3.2
    String.prototype.trim = function(){ return this.replace(/^\s+|\s+$/g, '') }

  // For iOS 3.x
  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
  if (Array.prototype.reduce === undefined)
//reduce方法对遍历数组进行累计处理，把前一个数组项返回值作为参数传到下一个数值项的操作中
    Array.prototype.reduce = function(fun){
//这里的void 0 是一直会返回undefined，void是不能被覆盖的，如果直接使用undefined的话，担心出现undefined被覆盖的情况（因为它曾经是可以被覆盖的，非保留关键词）
      if(this === void 0 || this === null) throw new TypeError()
//t.length >>> 0 位运算，如果左边有正的数值，那么会返回这个数值，undefined，null，空等会返回0
//accumulator为上次累计返回值
      var t = Object(this), len = t.length >>> 0, k = 0, accumulator
      if(typeof fun != 'function') throw new TypeError()
//如果数组长度为0，且没有传递初始值（即为数组中第一项调用时的previousValue）
      if(len == 0 && arguments.length == 1) throw new TypeError()

      if(arguments.length >= 2)
//有传入初始值，赋予accumulator初始值
       accumulator = arguments[1]
      else
        do{
          if(k in t){
//没有传递初始值，拿数组第一项作为初始值
            accumulator = t[k++]
            break
          }
//数组长度为1，且没有给初始值的情况
          if(++k >= len) throw new TypeError()
        } while (true)
//累计运算
      while (k < len){
        if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
        k++
      }
      return accumulator
    }

})()
