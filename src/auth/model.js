'use strict';

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';  // TODO added

const userSchema = new mongoose.Schema({
  username: {type: String, require: true, unique: true}, // TODO changed required to require
  password: {type: String, require: true}, // TODO changed required to require 
  email: {type: String}
});

// Before we save, use bcrypt to hash the plain text password and then call next()
// which will do the actual save with that instead of what the user typed in.
userSchema.pre('save', function(next) {
  bcrypt.hash(this.password,10)
    .then(hashedPassword => {
      // Update the password for this instance to the hashed version
      this.password = hashedPassword;
      // Continue on (actually do the save)
      next();
    })
    // In the event of an error, do not save, but throw it instead
    .catch( error => {throw error;});
});

// If we got a user/password, compare them to the hashed password
// return the user instance or an error
userSchema.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(error => error);
};

  userSchema.statics.authenticateToken = function(token) {
  let parsedToken = jwt.verify(token, process.env.SECRET || 'changeme') // TODO added
  let query = {_id:parsedToken.id};
  return this.findOne(query)
    .then(user => user) // TODO changed 
    .catch(error => error);
};

// Compare a plain text password against the hashed one we have saved
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
  .then( valid => valid ? valid: null); // TODO see Basic Auth video ~ 1:08:00
};

// Generate a JWT from the user id and a secret
userSchema.methods.generateToken = function() {
  let tokenData = {
    id:this._id,
  };
  return jwt.sign(tokenData, process.env.SECRET || 'changeme' );
};

export default mongoose.model('users', userSchema);
