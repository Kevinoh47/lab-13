'use strict';

import requireDirectory from 'require-directory';

// TODO not sure what all this is all about. Trying the line from 12 below
const whitelist = /.*?model.js$/; // Only index *model.js files
const renamer = (name) => name.replace(/(.*?\-)model/g, 'model'); // make them all named "model"
const models = requireDirectory(module, '../models', {rename:renamer, include: whitelist});
// TODO replace above with this?
//const models = requireDirectory(module, '../models', {recurse: false});

/*
models object:
{
  notes: { model: {default: [Function: Notes] } },
  tasks: { model: {default: [Function: Tasks] } },
}

 */

export default (req,res,next) => {
  
  let model = req.params.model;
  try {
    req.model = models[model].model.default;
    next();
  }
  catch(e) { next('Invalid Model'); }
  
};
