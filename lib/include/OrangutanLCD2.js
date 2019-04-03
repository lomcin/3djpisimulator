module.exports = {
  load: function(rt) {
    var _clear, _gotoXY, _loadCustomCharacter, _print1, _print2, _print3, _printFromProgramSpace, pchar, type, typeSig;
    pchar = rt.normalPointerType(rt.charTypeLiteral);
    type = rt.newClass("OrangutanLCD2", [
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
    _print1 = function(rt, _this, a) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    _print2 = function(rt, _this, a) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    _print3 = function(rt, _this, a) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    _loadCustomCharacter = function(rt, _this, a, b) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    _clear = function(rt, _this) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    _printFromProgramSpace = function(rt, _this, a) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    _gotoXY = function(rt, _this, x, y) {
      return rt.val(rt.voidTypeLiteral, 0, false);
    };
    rt.regFunc(_print1, type, "print", [rt.charTypeLiteral], rt.voidTypeLiteral);
    rt.regFunc(_print2, type, "print", [pchar], rt.voidTypeLiteral);
    rt.regFunc(_print3, type, "print", [rt.intTypeLiteral], rt.voidTypeLiteral);
    rt.regFunc(_loadCustomCharacter, type, "loadCustomCharacter", [pchar, rt.intTypeLiteral], rt.voidTypeLiteral);
    rt.regFunc(_clear, type, "clear", [], rt.voidTypeLiteral);
    rt.regFunc(_printFromProgramSpace, type, "printFromProgramSpace", [pchar], rt.voidTypeLiteral);
    return rt.regFunc(_gotoXY, type, "gotoXY", [rt.intTypeLiteral, rt.intTypeLiteral], rt.voidTypeLiteral);
  }
};
