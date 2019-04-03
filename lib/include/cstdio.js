var EOF, NULL, format_type_map, printf, validate_format;

printf = require("printf");

EOF = 0;

NULL = -1;

format_type_map = function(rt, ctrl) {
  switch (ctrl) {
    case "d":
    case "i":
      return rt.intTypeLiteral;
    case "u":
    case "o":
    case "x":
    case "X":
      return rt.unsignedintTypeLiteral;
    case "f":
    case "F":
      return rt.floatTypeLiteral;
    case "e":
    case "E":
    case "g":
    case "G":
    case "a":
    case "A":
      return rt.doubleTypeLiteral;
    case "c":
      return rt.charTypeLiteral;
    case "s":
      return rt.normalPointerType(rt.charTypeLiteral);
    case "p":
      return rt.normalPointerType(rt.voidTypeLiteral);
    case "n":
      return rt.raiseException("%n is not supported");
  }
};

validate_format = function(rt, format, ...params) {
  var casted, ctrl, i, re, results, target, type, val;
  i = 0;
  re = /%(?:[-+ #0])?(?:[0-9]+|\*)?(?:\.(?:[0-9]+|\*))?([diuoxXfFeEgGaAcspn])/g;
  results = [];
  while ((ctrl = re.exec(format)) != null) {
    type = format_type_map(rt, ctrl[1]);
    if (params.length <= i) {
      rt.raiseException(`insufficient arguments (at least ${i + 1} is required)`);
    }
    target = params[i++];
    casted = rt.cast(type, target);
    if (rt.isStringType(casted.t)) {
      results.push(val = rt.getStringFromCharArray(casted));
    } else {
      results.push(val = casted.v);
    }
  }
  return results;
};

module.exports = {
  load: function(rt) {
    var _ASCII, __printf, __scanf, _consume_next_char, _consume_next_line, _deal_type, _get_ASCII_char, _get_char, _get_float, _get_hex, _get_input, _get_integer, _get_line, _get_octal, _get_special_char, _get_string, _getchar, _gets, _hex2int, _int_at_octal, _octal2int, _printf, _putchar, _puts, _regslashs, _scanf, _set_pointer_value, _sprintf, _sscanf, _strcpy, _strip_slashes, char_pointer, input_stream, stdio;
    char_pointer = rt.normalPointerType(rt.charTypeLiteral);
    stdio = rt.config.stdio;
    input_stream = stdio.drain();
    _consume_next_char = function() {
      var char_return;
      char_return = "";
      if (input_stream.length > 0) {
        char_return = input_stream[0];
        input_stream = input_stream.substr(1);
        return char_return;
      } else {
        throw "EOF";
      }
    };
    _consume_next_line = function() {
      input_stream;
      var next_line_break, retval;
      next_line_break = input_stream.indexOf('\n');
      if (next_line_break > -1) {
        retval = input_stream.substr(0, next_line_break);
        input_stream = input_stream.replace(`${retval}\n`, '');
      } else {
        retval = input_stream;
        input_stream = "";
      }
      return retval;
    };
    _strcpy = require("./shared/cstring_strcpy");
    __printf = function(format, ...params) {
      var parsed_params, retval;
      if (rt.isStringType(format.t)) {
        format = rt.getStringFromCharArray(format);
        parsed_params = validate_format(rt, format, ...params);
        retval = printf(format, ...parsed_params);
        return rt.makeCharArrayFromString(retval);
      } else {
        return rt.raiseException("format must be a string");
      }
    };
    _sprintf = function(rt, _this, target, format, ...params) {
      var retval;
      retval = __printf(format, ...params);
      _strcpy(rt, null, [target, retval]);
      return rt.val(rt.intTypeLiteral, retval.length);
    };
    rt.regFunc(_sprintf, "global", "sprintf", [char_pointer, char_pointer, "?"], rt.intTypeLiteral);
    _printf = function(rt, _this, format, ...params) {
      var retval;
      retval = __printf(format, ...params);
      retval = rt.getStringFromCharArray(retval);
      stdio.write(retval);
      return rt.val(rt.intTypeLiteral, retval.length);
    };
    rt.regFunc(_printf, "global", "printf", [char_pointer, "?"], rt.intTypeLiteral);
    _getchar = function(rt, _this) {
      var char, error;
      try {
        char = _consume_next_char();
        return rt.val(rt.intTypeLiteral, char.charCodeAt(0));
      } catch (error1) {
        error = error1;
        return rt.val(rt.intTypeLiteral, EOF);
      }
    };
    rt.regFunc(_getchar, "global", "getchar", [], rt.intTypeLiteral);
    _gets = function(rt, _this, charPtr) {
      var destArray, i, j, ref, return_value;
      return_value = _consume_next_line();
      destArray = charPtr.v.target;
      for (i = j = 0, ref = return_value.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        try {
          destArray[i] = rt.val(rt.charTypeLiteral, return_value.charCodeAt(i));
        } catch (error1) {
          destArray[i] = rt.val(rt.charTypeLiteral, 0);
        }
      }
      destArray[return_value.length] = rt.val(rt.charTypeLiteral, 0);
      return rt.val(char_pointer, charPtr);
    };
    rt.regFunc(_gets, "global", "gets", [char_pointer], char_pointer);
    //#DEPENDENT ON PRINTF##
    //#these implementations is dependent on printf implementation
    //#but on the original c this behavior is not present
    //#for general purposes the result will be the same
    //#but maybe could be a good idea to make this implementation
    //#indenpendent
    _putchar = function(rt, _this, char) {
      var print_mask;
      print_mask = rt.makeCharArrayFromString("%c");
      _printf(rt, null, print_mask, char);
      return char;
    };
    rt.regFunc(_putchar, "global", "putchar", [rt.charTypeLiteral], rt.intTypeLiteral);
    _puts = function(rt, _this, charPtr) {
      var print_mask;
      print_mask = rt.makeCharArrayFromString("%s");
      _printf(rt, null, print_mask, charPtr);
      return rt.val(rt.intTypeLiteral, 1);
    };
    rt.regFunc(_puts, "global", "puts", [char_pointer], rt.intTypeLiteral);
    //#DEPENDENT ON PRINTF##

    //####################HELPER FUNCTION TO SCANF ###############################
    _ASCII = {
      a: 'a'.charCodeAt(0),
      f: 'f'.charCodeAt(0),
      A: 'A'.charCodeAt(0),
      F: 'F'.charCodeAt(0),
      0: '0'.charCodeAt(0),
      8: '8'.charCodeAt(0),
      9: '9'.charCodeAt(0)
    };
    _hex2int = function(str) {
      var _int_at_hex, digit, i, j, num, ref, ret;
      ret = 0;
      digit = 0;
      str = str.replace(/^[0O][Xx]/, '');
      for (i = j = ref = str.length - 1; j >= 0; i = j += -1) {
        num = _int_at_hex(str[i], digit++);
        if (num !== null) {
          ret += num;
        } else {
          throw new Error('invalid hex ' + str);
        }
      }
      ret;
      return _int_at_hex = function(c, digit) {
        var ascii;
        ret = null;
        ascii = c.charCodeAt(0);
        if (_ASCII.a <= ascii && ascii <= _ASCII.f) {
          ret = ascii - _ASCII.a(+10);
        } else if (_ASCII.A <= ascii && ascii <= _ASCII.F) {
          ret = ascii - _ASCII.a(+10);
        } else if (_ASCII[0] < ascii && ascii <= _ASCII[9]) {
          ret = ascii - _ASCII[0];
        } else {
          throw new Error(`Ivalid ascii [${c}]`);
        }
        num *= Math.pow(16, digit);
        return ret;
      };
    };
    _octal2int = function(str) {
      var digit, i, j, num, ref, ret;
      str = str.replace(/^0/, '');
      ret = 0;
      digit = 0;
      for (i = j = ref = str.length - 1; j >= 0; i = j += -1) {
        num = _int_at_octal(str[i], digit++);
        if (num !== null) {
          ret += num;
        } else {
          throw new Error(`invalid octal ${str}`);
        }
      }
      return ret;
    };
    _int_at_octal = function(c, digit) {
      var ascii, num;
      num = null;
      ascii = c.charCodeAt(0);
      if (ascii >= _ASCII[0] && ascii <= _ASCII[8]) {
        num = ascii - _ASCII[0];
      } else {
        throw new Error(`invalid char at [${c}]`);
      }
      num *= Math.pow(8, digit);
      return num;
    };
    _regslashs = function(pre) {
      return pre.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\|/g, '\\|');
    };
    _strip_slashes = function(str) {
      return str.replace(/\\([\sA-Za-z\\]|[0-7]{1,3})/g, function(str, c) {
        switch (c) {
          case "\\":
            return "\\";
          case "0":
            return "\u0000";
          default:
            if (/^\w$/.test(c)) {
              return _get_special_char(c);
            } else if (/^\s$/.test(c)) {
              return c;
            } else if (/([0-7]{1,3})/.test(c)) {
              return _get_ASCII_char(c);
            }
            return str;
        }
      });
    };
    _get_ASCII_char = function(str) {
      var num;
      num = _octal2int(str);
      return String.fromCharCode(num);
    };
    _get_special_char = function(letter) {
      switch (letter.toLowerCase()) {
        case "b":
          return "\b";
        case "f":
          return "\f";
        case "n":
          return "\n";
        case "r":
          return "\r";
        case "t":
          return "\t";
        case "v":
          return "\v";
        default:
          return letter;
      }
    };
    //####################HELPER FUNCTION TO SCANF ###############################

    //############################SCANF IMPL######################################
    _get_input = function(pre, next, match, type) {
      var after_match, before_match, m, replace, result, tmp;
      result = void 0;
      tmp = input_stream;
      replace = `(${match})`;
      if (type === 'STR' && next.trim().length > 0) {
        before_match = _regslashs(pre);
        after_match = _regslashs(next) + '[\\w\\W]*';
        if (before_match.length) {
          tmp = tmp.replace(new RegExp(before_match), '');
        }
        tmp = tmp.replace(new RegExp(after_match), '');
      } else {
        replace = _regslashs(pre) + replace;
      }
      m = tmp.match(new RegExp(replace));
      if (!m) {
        //TODO strip match
        return null;
      }
      result = m[1];
      input_stream = input_stream.substr(input_stream.indexOf(result)).replace(result, '').replace(next, '');
      //returing result
      return result;
    };
    _get_integer = function(pre, next) {
      var text;
      text = _get_input(pre, next, '[-]?[A-Za-z0-9]+');
      if (!text) {
        return null;
      } else if (text[0] === '0') {
        if (text[1] === 'x' || text[1] === 'X') {
          return _hex2int(text);
        } else {
          return _octal2int(text);
        }
      } else {
        return parseInt(text);
      }
    };
    _get_float = function(pre, next) {
      var text;
      text = _get_input(pre, next, '[-]?[0-9]+[\.]?[0-9]*');
      return parseFloat(text);
    };
    _get_hex = function(pre, next) {
      var text;
      text = _get_input(pre, next, '[A-Za-z0-9]+');
      return _hex2int(text);
    };
    _get_octal = function(pre, next) {
      var text;
      text = _get_input(pre, next, '[A-Za-z0-9]+');
      return _octal2int(text);
    };
    _get_string = function(pre, next) {
      var text;
      text = _get_input(pre, next, '([\\w\\]=-]|\\S[^\\][^\\ ])+(\\\\[\\w\\ ][\\w\\:]*)*', 'STR');
      if (/\\/.test(text)) {
        text = _strip_slashes(text);
      }
      return text;
    };
    _get_char = function(pre, next) {
      var text;
      text = _get_input(pre, next, '.', 'STR');
      if (/\\/.test(text)) {
        text = _strip_slashes(text);
      }
      return text;
    };
    _get_line = function(pre, next) {
      var text;
      text = _get_input(pre, next, '[^\n\r]*');
      if (/\\/.test(text)) {
        text = _strip_slashes(text);
      }
      return text;
    };
    _deal_type = function(format) {
      ret;
      var next, pre, res, res2, ret, type;
      res = format.match(/%[A-Za-z]+/);
      res2 = format.match(/[^%]*/);
      if (!res) {
        return null;
      }
      type = res[0];
      pre;
      if (!!res2) {
        pre = res2[0];
      } else {
        pre = null;
      }
      next = format.substr(format.indexOf(type) + type.length);
      switch (type) {
        case "%d":
        case "%ld":
        case "%llu":
        case "%lu":
        case "%u":
          ret = _get_integer(pre, next);
          break;
        case "%c":
          ret = _get_char(pre, next);
          break;
        case "%s":
          ret = _get_string(pre, next);
          break;
        case "%S":
          ret = _get_line(pre, next);
          break;
        case '%x':
        case '%X':
          ret = _get_hex(pre, next);
          break;
        case '%o':
        case '%O':
          ret = _get_octal(pre, next);
          break;
        case '%f':
          ret = _get_float(pre, next);
          break;
        default:
          throw new Error('Unknown type "' + type + '"');
      }
      return ret;
    };
    _set_pointer_value = function(pointer, value) {
      var i, j, new_value, ref, results, src_array;
      try {
        switch (pointer.t.ptrType) {
          case "normal":
            if (rt.isNumericType(pointer.t.targetType)) {
              new_value = rt.val(pointer.t.targetType, value, true);
              return pointer.v.target.v = new_value.v;
            } else {
              new_value = rt.val(pointer.t.targetType, value.charCodeAt(0), true);
              return pointer.v.target.v = new_value.v;
            }
            break;
          case "array":
            src_array = rt.makeCharArrayFromString(value);
            if (src_array.v.target.length > pointer.v.target.length) {
              return rt.raiseException("Not enough memory on pointer");
            } else {
              results = [];
              for (i = j = 0, ref = src_array.v.target.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
                try {
                  results.push(pointer.v.target[i] = src_array.v.target[i]);
                } catch (error1) {
                  results.push(rt.raiseException("Not enough memory on pointer"));
                }
              }
              return results;
            }
            break;
          default:
            return rt.raiseException("Invalid Pointer Type");
        }
      } catch (error1) {
        return rt.raiseException("Memory overflow");
      }
    };
    __scanf = function(format) {
      var j, len, re, results, selectors, val;
      re = new RegExp('[^%]*%[A-Za-z][^%]*', 'g');
      selectors = format.match(re);
      results = [];
      for (j = 0, len = selectors.length; j < len; j++) {
        val = selectors[j];
        results.push(_deal_type(val));
      }
      return results;
    };
    //############################SCANF IMPL#####################################
    _scanf = function(rt, _this, pchar, ...args) {
      var format, i, j, len, matched_values, val;
      format = rt.getStringFromCharArray(pchar);
      matched_values = __scanf(format);
      for (i = j = 0, len = matched_values.length; j < len; i = ++j) {
        val = matched_values[i];
        _set_pointer_value(args[i], val);
      }
      return rt.val(rt.intTypeLiteral, matched_values.length);
    };
    rt.regFunc(_scanf, "global", "scanf", [char_pointer, "?"], rt.intTypeLiteral);
    //TODO change this function to pass the string to __scanf instead of playing with current stream
    _sscanf = function(rt, _this, original_string_pointer, format_pointer, ...args) {
      var format, i, j, len, matched_values, original_input_stream, original_string, val;
      format = rt.getStringFromCharArray(format_pointer);
      original_string = rt.getStringFromCharArray(original_string_pointer);
      original_input_stream = input_stream;
      input_stream = original_string;
      matched_values = __scanf(format);
      for (i = j = 0, len = matched_values.length; j < len; i = ++j) {
        val = matched_values[i];
        _set_pointer_value(args[i], val);
      }
      input_stream = original_input_stream;
      return rt.val(rt.intTypeLiteral, matched_values.length);
    };
    return rt.regFunc(_sscanf, "global", "sscanf", [char_pointer, char_pointer, "?"], rt.intTypeLiteral);
  }
};
