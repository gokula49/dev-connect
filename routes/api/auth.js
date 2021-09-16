const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../modals/User');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

        

router.get('/',auth,async(req,res) =>{
    try{
      
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

router.post('/',[

    check('email','please include a valid email').isEmail(),
    check('password','please enter a password with 6 or more characters').exists()
],
async (req,res) => {
    //console.log(req.body);
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({
            errors:errors.array()
        });
    }

    const { name , email , password } = req.body;

    try{ 
          let user = await User.findOne({ email });

         if(!user) {
            return res.status(400).json({ errors : [{msg : 'invalid credentials'}]});
         }

       const isMatch = await bcrypt.compare(password,user.password);

       if(!isMatch) {
        return res.status(400).json({ errors : [{msg : 'invalid credentials'}]});

       }
         
       const payload = {
           user: {
               id:user.id
           }
       }

       jwt.sign(
           payload,
           config.get('jwtSecret'),
           { expiresIn:360000},
           
           (err,token)=>{
               if(err) throw err;
                res.json({token});
           });

    } 
     catch(err) {
       console.error(err.message);
       res.status(500).send('server error');
      }

});

module.exports = router; 
