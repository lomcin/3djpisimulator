module.exports = {
  load: function(rt) {
    var _isPressed, _plusX, _waitForRelease, type, typeSig;
    type = rt.newClass("OrangutanPushbuttons2", [
      {
        name: "x",
        t: rt.intTypeLiteral,
        initialize: function(rt,
      _this) {
          return rt.val(rt.intTypeLiteral,
      2,
      true);
        }
      },
      {
        name: "y",
        t: rt.intTypeLiteral,
        initialize: function(rt,
      _this) {
          return rt.val(rt.intTypeLiteral,
      -2,
      true);
        }
      }
    ]);
    typeSig = rt.getTypeSignature(type);
    rt.types[typeSig]["#father"] = "object";
    _plusX = function(rt, _this, a) {
      var newValue;
      newValue = _this.v.members["x"].v + a.v;
      return rt.val(rt.intTypeLiteral, newValue, false);
    };
    _isPressed = function(rt, _this, a) {
      return rt.val(rt.boolTypeLiteral, 1, false);
    };
    _waitForRelease = function(rt, _this, a) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    rt.regFunc(_plusX, type, "plusX", [rt.intTypeLiteral], rt.intTypeLiteral);
    rt.regFunc(_isPressed, type, "isPressed", [rt.intTypeLiteral], rt.boolTypeLiteral);
    return rt.regFunc(_waitForRelease, type, "waitForRelease", [rt.intTypeLiteral], rt.voidTypeLiteral);
  }
};
