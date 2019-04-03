module.exports = {
  load: function(rt) {
    var _calibrateLineSensors, _init, _plusX, _readLine, puint, type, typeSig;
    puint = rt.normalPointerType(rt.unsignedintTypeLiteral);
    type = rt.newClass("Pololu3pi", [
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
    _init = function(rt, _this, a) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    _calibrateLineSensors = function(rt, _this, a) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    _readLine = function(rt, _this, a, b) {
      return rt.val(rt.unsignedintTypeLiteral, 0, false);
    };
    rt.regFunc(_plusX, type, "plusX", [rt.intTypeLiteral], rt.intTypeLiteral);
    rt.regFunc(_init, type, "init", [rt.intTypeLiteral], rt.voidTypeLiteral);
    rt.regFunc(_calibrateLineSensors, type, "calibrateLineSensors", [rt.intTypeLiteral], rt.voidTypeLiteral);
    return rt.regFunc(_readLine, type, "readLine", [puint, rt.intTypeLiteral], rt.unsignedintTypeLiteral);
  }
};
