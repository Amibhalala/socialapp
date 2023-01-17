import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";
var jwt = require('jsonwebtoken');

export const validateToken =  (req: Request, res: Response, next:NextFunction): Promise<void> => {
  try {
    const authHeader = req?.headers?.["authorization"]
    const token = authHeader?.split(" ")[1];
    if (!token) {
      res.status(400).send("No token present in header")
    }
    else {
      jwt.verify(token, String(process.env.ACCESS_TOKEN_SECRET), (error, user) => {
        if (error) { 
          console.log('error',error)
         res.status(403).send("Invalid token")
         }
         else {
           req.user = user
           next();
         }
        }) 
    }
  }
    catch (error) {
      res.status(400).json({
        error: "something went wrong",
      });
      throw error
    }
  
};
export const validateParam = (req: Request, res: Response, next:NextFunction) => {
  if(!req.params?.id){
    return res.status(400).json({ error: 'Param is required' })
  }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ObjectId' })
    }
    next(); 
};
