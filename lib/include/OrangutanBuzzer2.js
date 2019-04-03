module.exports = {
  load: function(rt) {
    var _isPlaying, _playFromProgramSpace, _plusX, pchar, type, typeSig;
    pchar = rt.normalPointerType(rt.charTypeLiteral);
    type = rt.newClass("OrangutanBuzzer2", [
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
    _playFromProgramSpace = function(rt, _this, a) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    _isPlaying = function(rt, _this) {
      return rt.val(rt.boolTypeLiteral, 1, false);
    };
    rt.regFunc(_plusX, type, "plusX", [rt.intTypeLiteral], rt.intTypeLiteral);
    rt.regFunc(_playFromProgramSpace, type, "playFromProgramSpace", [pchar], rt.voidTypeLiteral);
    return rt.regFunc(_isPlaying, type, "isPlaying", [], rt.boolTypeLiteral);
  }
};
