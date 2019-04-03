module.exports = {
  load: function(rt) {
    var _time;
    _time = function(rt, _this, i) {
      var val;
      val = Math.floor(Date.now() / 1000);
      return rt.val(rt.intTypeLiteral, val);
    };
    // TODO: implement correct return for non-0 argument
    return rt.regFunc(_time, "global", "time", [rt.longTypeLiteral], rt.longTypeLiteral);
  }
};
