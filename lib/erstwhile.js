const express = require('express'); //import express
const validator = require('validator');

/**
 * This method compares the path from the description file to that in the request
 * to see if they match, skipping path parts that are variable.
 * 
 * @param {*} descPath 
 * @param {*} reqPath 
 * @returns boolean
 */
const matchPaths = (descPath, reqPath) => {
  let descPathParts = descPath.split('/'), reqPathParts = reqPath.split('/');
  let retval = true;
  for(let i in descPathParts) {
    if(descPathParts.substring(0, 1) != ':') {
      if(descPathParts[i] != reqPathParts[i]) {
        retval = false;
      }
    }
  }
  // handle potential trailing slashes
  if(descPathParts.length < reqPathParts.length) {
    if(reqPathParts[descPathParts.length].trim() != '') {
      retval = false;
    } 
  }
  return retval;
}

/**
 * This function checks a field against the field definition.
 * 
 * @param {*} fieldDefinition 
 * @param {*} field 
 * @returns json
 */
const validateField = (fieldDefinition, field) => {
  let retval = { success: true };
  if((!field || !field.trim()) && fieldDefinition.required === true) {
    retval.success = false;
    retval.error = `Required field not specified.`;
  } else if(field) {

    let validateSpecificField = (localField) => { 
      switch(fieldDefinition.type.toLowerCase()) {
        case 'integer':
          if(!validator.isInt(localField + '')) {
            retval.success = false;
            retval.error = `Field should be integer.`;
          }
          break;
        case 'float':
          if(!validator.isFloat(localField + '')) {
            retval.success = false;
            retval.error = `Field should be decimal.`;
          }
          break;
        case 'email':
          if(!validator.isEmail(localField + '')) {
            retval.success = false;
            retval.error = `Field should be an email.`;
          }
          break;
        case 'slug':
          if(!validator.isSlug(localField + '')) {
            retval.success = false;
            retval.error = `Field should be a slug.`;
          }
          break;
        case 'password':
          if(!validator.isStrongPassword(localField + '')) {
            retval.success = false;
            retval.error = `Field should be a strong password with at least 8 characters and at least one number, lowercase letter, uppercase letter, and symbol.`;
          }
          break;
        case 'uuid':
        case 'reference':
          if(!validator.isUUID(localField + '')) {
            retval.success = false;
            retval.error = `Field should be a UUID.`;
          }
          break;
        case 'date':
          if(!validator.isDate(localField + '')) {
            retval.success = false;
            retval.error = `Field should be a date.`;
          }
          break;
        case 'time':
          if(!validator.isTime(localField + '')) {
            retval.success = false;
            retval.error = `Field should be a time.`;
          }
          break;
        case 'datetime':
          if(!validator.isISO8601(localField + '')) {
            retval.success = false;
            retval.error = `Field should be a properly formated date/time value.`;
          }
          break;
      }
    }
    if(fieldDefinition.array === true) {
      if(typeof field !== 'array') {
        retval.success = false;
        retval.error = `Field should be an array.`;
      } else {
        for(let j = 0; j < field.length; j++) {
          validateSpecificField(field[j]);
        }
      }
    } else {
      validateSpecificField(field)
    }
  }
  return retval;
}

const validateRequest = (req) => {
  let retval = {success: false};
  if (!process.env.ERSTWHILE_DESCRIPTION_PATH) {
    throw new Error("Environment variable ERSTWHILE_DESCRIPTION_PATH not specified.");
  } else {
    try {
      const apiDescription = require('./config/description.json');
      let method = req.method.toLowerCase();
      let path = req.path;
      let fields = null;

      // start the search with the authentication block
      if (fields === null && apiDescription.authentication) {
        const sections = ['login', 'forgotPassword', 'currentUser', 'signup'];
        for(let j in sections) {
          const section = sections[j];
          if(fields === null && apiDescription.authentication[section] && typeof apiDescription.authentication[section] == 'array') {
            for(let i in apiDescription.authentication[section]) {
              if(fields === null && matchPaths(apiDescription.authentication[section][i].endpoint, path) && apiDescription.authentication[section][i].method?.toLowerCase() == method) {
                if(apiDescription.authentication[section][i].fields) {
                  fields = apiDescription.authentication[section][i].fields;
                } else {
                  fields = true;
                }
              }
            }
          }
        }
      }
      // now dig in to the entities
      if(fields === null && apiDescription.entities) {
        for(let entityKey in apiDescription.entities) {
          const entity = apiDescription.entities[entityKey];
          if(entity.methods) {
            for(let i in entity.methods) {
              if(fields === null && matchPaths(entity.methods[i].endpoint, path) && entity.methods[i].method?.toLowerCase() == method) {
                if(entity.methods[i].fields) {
                  fields = entity.methods[i].fields;
                } else {
                  fields = true;
                }
              }
            }
          }
        }
      }

      // ok, we found it or didn't
      if(fields === null) {
        retval.errors = ["Path not found in the configuration."];
      } else if(fields === true) {
        retval.success = true;
      } else {
        if(fields.type) {
          if(!fields.fields) {
            let location = null;
            if(fields.type == 'query') {
              location = "query";
            } else if(fields.type == "json") {
              location = "body";
            } else {
              retval.errors = [`Unrecognized type for fields [${fields.type}].`];   
            }
            if(location) {
              let goodSoFar = true;
              for(let i = 0; i < fields.fields.length; i++) {
                let testResult = validateField(fields.fields[i], req[location][fields.fields[i].key]);
                if(testResult.success == false) {
                  goodSoFar = false;
                  if(!retval.errorsObj) {
                    retval.errorsObj = {}
                  }
                  retval.errorsObj[fields.fields[i].key] = testResult.error;
                }
              }
              if(goodSoFar) {
                retval.success = true;
              }
            } 
          } else {
            retval.errors = ["No fields specified."];    
          }
        } else {
          retval.errors = ["No type for the fields is specified."];
        }
      }
    } catch (e) {
      throw new Error("Error opening file specified in ERSTWHILE_DESCRIPTION_PATH.");
    }
  }
  return retval;
}

module.exports = {
  validateRequest
};