const jwt = require('jsonwebtoken');


 const jwtAuthMiddleware = (req, res, next )=>{

   const authorization = req.headers.authorization
   if(!authorization)
      res.status(401).json({error:' token not found'});

    const token = req.headers.authorization.split(' ')[1];
    if(!token) res.status(401).json({error:'unauthorized'});


    try{
       const decoded= jwt.verify(token, process.env.jwt_SECRET,{expiresIn:30000});
       req.user = decoded;
       next();


    }catch(err){
        console.error(err);
        res.status(401).json({error:'Inavlid token'});

    }
 }


 const generateToken = (userData) =>{
    return jwt.sign(userData,process.env.jwt_SECRET)



 }
 module.exports={jwtAuthMiddleware,generateToken};