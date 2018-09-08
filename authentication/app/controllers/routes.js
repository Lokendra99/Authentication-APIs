var express=require('express');
var mongoose=require('mongoose');
var nodemailer=require('nodemailer');

var route=express.Router();

var objGenerator=require('../../library/generator');
var auth=require('../../middlewares/auth');

var user=require('../models/Users');
var userModel=mongoose.model('userModel');



 module.exports.controller=function(app){

   ////Home Page ////
   route.get('/',function(req,res){
     res.render('home',{})
   });

  //// SIGNUP STARTS ///////
  route.get('/signUpPage',function(req,res){
    res.render('signUp',{})
  });

  route.post('/signUpInfo',function(req,res){

    req.checkBody('firstName','firstName is required').notEmpty();
    req.checkBody('lastName','lastName is required').notEmpty();
    req.checkBody('email','email is required').notEmpty();
    req.checkBody('password','password is required').notEmpty();


    var validationErrors=req.validationErrors();
    if(validationErrors){
      res.render('signUp',{validationErrors:validationErrors})
    }
    else{
      // to make unique full name...I joined thier email id and their first name and last fullName
      // As every must be having his own unique emailid and thus it will help in creating unique Fullname
      var temp=req.body.email;
      var savingIndex=null;
      for(var i=0;i<temp.length;i++){
        if(temp[i]=='.'){
          savingIndex=i;
        }
      }
      var resultantString=temp.slice(0,savingIndex);

        if(req.body.firstName!=undefined && req.body.lastName!=undefined
         &&req.body.email!=undefined && req.body.password!=undefined){

          var newUser= new userModel({
            'firstName':req.body.firstName,
            'lastName':req.body.lastName,
            'fullName':req.body.firstName+req.body.lastName+resultantString,
            'email':req.body.email
          })
          newUser.password = newUser.generateHash(req.body.password);
        }

        newUser.save(function(err,result){
          if(err){
            res.send(objGenerator.generatorFn(true,"User with this email id already exists",404,null));
          }
          else{
            req.session.user=newUser;
            delete req.session.user.password;
            res.send(objGenerator.generatorFn(false,"SignUp Successful",200,null));
          }
        });
    }
  });

  ////Sign Up Ends/////


  ////login start/////
  route.get('/loginPage',function(req,res){
    res.render('login',{})
  })

  route.post('/loginCheck',function(req,res){
    req.checkBody('email','email is required').notEmpty();
    req.checkBody('password','password is required').notEmpty();

    var validationErrors=req.validationErrors();
    if(validationErrors){
      res.render('login',{validationErrors:validationErrors})
    } else{
      userModel.findOne({"email":req.body.email},function(err,result){
        if(err){
          res.send(objGenerator.generatorFn(true,"no user with given id",404,null));
        }
        else if(result==null || result==undefined){
          res.send(objGenerator.generatorFn(true,"user not available ",404,null));
        }
        else if(!result.compareHash(req.body.password)){
          var response = objGenerator.generatorFn(true , "Wrong password" , 401, null );
    			res.send(response);
        }
        else{
          req.flash('success','login successfull');
          req.session.user=result;
          delete req.session.user.password;
          res.send(objGenerator.generatorFn(false,"Login Successful",200,null));
        }
      })
    }


  })
  ////LOGIN Ends////




  //resetting user password
  route.get('/passwordReset',function(req,res){
    res.render('resettingPassword',{})
  })

  // Send Email
  route.post('/send', function(req, res, next){
      var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'chatapp390@gmail.com',
          pass: 'lokendra99'
        }
      });

      var mailOptions = {
        from: '"Authentication Team" <chatapp390@gmail.com>', // I had this fake id as I created it earlier
        to: req.body.email,
        subject: 'Hello from Authentication Team',
        text: 'As you have requested for password reset.Kindly click this link '+'http://localhost:3000/password-reset/'+req.body.email

      }

      transporter.sendMail(mailOptions, function(error, info){
        if(error){
          console.log(error);
        res.send(objGenerator.generatorFn(true,"there is Error whlile sending the message to your id",404,null));
        }
        else{
          console.log('Message Sent: '+ info.response);
          res.send(objGenerator.generatorFn(false,'Successfully Sent mail to your id',200,'Details could not be disclosed'));
        }

      });

  });

  route.get('/password-reset/:email',function(req,res){
    res.render('passwordRestTemplate',{email:req.params.email})
  })

  route.post('/updatePasswordInDatabase/:email',function(req,res){

    req.checkBody('password','password is required').notEmpty();

    var validationErrors=req.validationErrors();
    if(validationErrors){
      res.render('passwordRestTemplate',{email:req.params.email,validationErrors:validationErrors})
    }
    else{
      var update=req.body;
      update.password = new userModel().generateHash(req.body.password);
      userModel.findOneAndUpdate({'email':req.params.email},update,function(err,response){
        if(err){res.send(objGenerator.generatorFn(true,"there is no user with th given id",404,null));}
        else{
          req.flash('success','password updated');
          res.redirect('/loginPage');
        }
      })
    }
  })

  //logout request
  route.get('/logOut',function(req,res){
    req.session.destroy(function(err){
      if(err){res.send(objGenerator.generatorFn(true,"Session could not be destroyed",404,null));}
      else res.redirect('/loginPage');
    })
  })

  app.use('/',route);


}
