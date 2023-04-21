exports = module.exports = {};
let renderObject = function(input, spaces) {
  let retval = '';
  let newSpaces = spaces + '  ';
  if(input.type == "object") {
    retval = "{\n";
    if(input.fields && input.fields.length > 0) {
      for(let i = 0; i < input.fields.length; i++) {
        if(input.fields[i].type == 'object') {
          retval += newSpaces + input.fields[i].key + ": " + (input.fields[i].array ? '[' : "") + renderObject(input.fields[i], newSpaces) + (input.fields[i].array ? ']' : "") + (i < input.fields.length - 1 ? ',' : "") + `${(input.fields[i].required ? ' // required' : "")}` + "\n";
        } else if(input.fields[i].type == 'entity') {
          retval += newSpaces + `${input.fields[i].key}: ${(input.fields[i].array ? '[' : "")}&lt;<a href="#entity-${input.entity}">${input.entity}&gt;</a>${(input.fields[i].array ? ']' : "")}`+ (i < input.fields.length - 1 ? ',' : "") + `${(input.fields[i].required ? ' // required' : "")}` + "\n"    
        } else {
          retval += newSpaces + `${input.fields[i].key}: ${(input.fields[i].array ? '[' : "")}&lt;${input.fields[i].type}${(input.fields[i].enum ? `, enum: <a href="#enum-${input.fields[i].enum}">${input.fields[i].enum}</a>` : "")}${(input.fields[i].type == "reference" ? `, entity: <a href="#entity-${input.fields[i].entity}">${input.fields[i].entity}</a>` : "")}&gt;${(input.fields[i].array ? ']' : "")}`+ (i < input.fields.length - 1 ? ',' : "")  + `${(input.fields[i].required ? ' // required' : "")}` + "\n"    
        }
      }
    } else if(input.entity) {
      retval += newSpaces + `&lt;<a href="#entity-${input.entity}">${input.entity}</a>&gt;\n`
    }
    retval += spaces + "}";
  }
  return retval;
};
exports.renderObject = renderObject;
let renderEnum = function(input, key, spaces) {
  let retval = '';
  let newSpaces = spaces + '  ';
  retval = "[\n";
  if(input.options && input.options.length > 0) {
    for(let i = 0; i < input.options.length; i++) {
      let option = input.options[i];
      if(typeof option == 'string') {
        retval += newSpaces + option + (i < input.options.length - 1 ? ',' : '' ) + "\n";
      } else {
        retval += newSpaces + option.value + ": " + option.text + (i < input.options.length - 1 ? ',' : '' ) + "\n";
      }
    }
  }
  retval += spaces + "]\n";
  
  return retval;
};
exports.renderEnum = renderEnum;