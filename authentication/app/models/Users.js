var mongoose=require('mongoose');

var Schema=mongoose.Schema;

//bcrypt-nodejs for hashing password
var bcrypt = require('bcrypt-nodejs');

var userSchema=new Schema({
  'firstName'           : {type:'String',default:''},
  'lastName'            : {type:'String',default:''},
  'fullName'            : {type:'String',default:'',unique:true},
  'email'               : {type:'String',default:'',unique:true},
  'password'            : {type:'String',default:''}
})




//method to generate hashed password
userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password , bcrypt.genSaltSync(8) ,null);
};
//method to compare hashed password and password entered by user
userSchema.methods.compareHash = function(password){
    return bcrypt.compareSync(password , this.password);
};

mongoose.model('userModel',userSchema);
