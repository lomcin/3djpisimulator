module.exports = {
  load: function(rt) {
    var _left, _plusX, _right, type, typeSig;
    type = rt.newClass("OrangutanLEDs2", [
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
    _left = function(rt, _this, a) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    _right = function(rt, _this, a) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    rt.regFunc(_plusX, type, "plusX", [rt.intTypeLiteral], rt.intTypeLiteral);
    rt.regFunc(_left, type, "left", [rt.intTypeLiteral], rt.voidTypeLiteral);
    return rt.regFunc(_right, type, "right", [rt.intTypeLiteral], rt.voidTypeLiteral);
  }
};
