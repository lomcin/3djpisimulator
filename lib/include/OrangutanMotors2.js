module.exports = {
  load: function(rt) {
    var _plusX, _setSpeeds, type, typeSig;
    type = rt.newClass("OrangutanMotors2", [
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
    _setSpeeds = function(rt, _this, a, b) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    rt.regFunc(_plusX, type, "plusX", [rt.intTypeLiteral], rt.intTypeLiteral);
    return rt.regFunc(_setSpeeds, type, "setSpeeds", [rt.intTypeLiteral, rt.intTypeLiteral], rt.voidTypeLiteral);
  }
};
