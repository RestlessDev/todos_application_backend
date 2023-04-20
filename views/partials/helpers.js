exports = module.exports = {};
let renderObject = function(input, spaces) {
  let retval = '';
  let newSpaces = spaces + '  ';
  if(input.type == "object") {
    retval = "{\n";
    if(input.fields && input.fields.length > 0) {
      for(let i = 0; i < input.fields.length; i++) {
        if(input.fields[i].type == 'object') {
          retval += newSpaces + input.fields[i].key + ": " + (input.fields[i].array ? '[' : "") + renderObject(input.fields[i], newSpaces) + (input.fields[i].array ? ']' : "");
        } else if(input.fields[i].type == 'entity') {
          retval += newSpaces + `${input.fields[i].key}: ${(input.fields[i].array ? '[' : "")}&lt;<a href="#entity-${input.entity}">${input.entity}&gt;</a>${(input.fields[i].array ? ']' : "")}\n`    
        } else {
          retval += newSpaces + `${input.fields[i].key}: ${(input.fields[i].array ? '[' : "")}&lt;${input.fields[i].type}&gt;${(input.fields[i].array ? ']' : "")}\n`    
        }
      }
    } else if(input.entity) {
      retval += newSpaces + `&lt;<a href="#entity-${input.entity}">${input.entity}&gt;</a>\n`
    }
    retval += spaces + "}\n";
  }
  return retval;
};
exports.renderObject = renderObject;