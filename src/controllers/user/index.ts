import { Response, Request, NextFunction } from "express";
import { IUser, UserField } from "../../types/user";
import User from "../../models/user";
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
let refreshTokenList:Array<any>=[];
export const getAllUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req?.query;
    const pageOptions = {
      page : query?.page ? parseInt(query?.page) : 0,
      limit : query?.limit ? parseInt(query?.limit) : 0
    }
    const users: UserField[] = await User.find({},{name:1,email:1}).limit(pageOptions.limit).skip(pageOptions.page * pageOptions.limit).sort({name:"asc"});
    res.status(200).json({ users })
  } catch (error) {
    throw error
  }
};
const generateAccessToken = (email:string):any=>{
  if(email){
    return jwt.sign({ email },String(process.env.ACCESS_TOKEN_SECRET), {
      expiresIn: "60m"
    });
  }
  throw new Error('Error creating token');
};
const generateRefreshToken = (email:string):any=>{
  if(email){
    const refreshToken= jwt.sign({ email },String(process.env.REFRESH_TOKEN_SECRET), {
      expiresIn: "60m"
    });
    refreshTokenList.push(refreshToken)
    console.log('rr',refreshTokenList)

    return refreshToken;
  }
  throw new Error('Error creating token');
};
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<IUser, "name" | "email" | "password">
    const existUser=await User.findOne({ email:body.email });
    if(existUser){
      res.status(409).json({
        error: "User already exist",
      });
    }
    var encryptedPassword = bcrypt.hashSync(body.password, 10);
    const user: IUser = new User({
      name : body.name,
      email : body.email,
      password : encryptedPassword
    })
    const newUser: IUser = await user.save()
    console.log('lol newUser',newUser)
   
    res.status(200).send({ auth: true, id: newUser._id,email:body.email });
  } catch (error) {
    res.status(400).json({
      error: "Error in registering user",
    });
    throw error
  }
};
    
export const validateToken =  async (req: Request, res: Response, next:NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader?.split(" ")[1];
    if (token == null) {
      res.sendStatus(400).send("No Token present in header")
    }
    else {
      jwt.verify(token, String(process.env.ACCESS_TOKEN_SECRET), (error, user) => {
        if (error) { 
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

}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<IUser, "email" | "password">
    const user=await User.findOne({ email:body.email });
    console.log('88',user)
    const isValidPassword= user ? await bcrypt.compare(body.password, user.password): false
    if(user && isValidPassword){
      var accessToken = generateAccessToken(body.email);
      var refreshToken = generateRefreshToken(body.email);
      res.json ({accessToken: accessToken, refreshToken: refreshToken})
    }
    else {
      res.status(401).json({
        error: "Password is incorrect",
      });
    }
  } catch (error) {
    res.status(400).json({
      error: "something went wrong",
    });
    throw error
  }
};


 
  export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      if(!refreshTokenList?.includes(req.body.token)){
        res.status(400).json({
          error: "Refresh token is invalid",
        });
      }
      refreshTokenList=refreshTokenList.filter((token)=> token !=req.body.token);
        var accessToken = generateAccessToken(req.body.email);
        var refreshToken = generateRefreshToken(req.body.email);
        res.json ({accessToken: accessToken, refreshToken: refreshToken})
      
    } catch (error) {
      res.status(400).json({
        error: "something went wrong",
      });
      throw error
    }
  };
  
  
