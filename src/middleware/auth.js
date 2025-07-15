import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'virak123';

const authenticate = (req, res, next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({message: "No token provided"});

    const token = authHeader.split(' ')[1];
    if(!token) return res.status(401).json({message: "Token missing"});

    try{
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    }catch(err){
        return res.status(401).json({message: "Invalid token"});
    }
};

export default authenticate;