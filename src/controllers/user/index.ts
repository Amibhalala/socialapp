import { Response, Request } from "express";
import { IUser, UserField } from "../../types/user";
import User from "../../models/user";
import redis from "../../utility/redis";
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
export const getCustomFilter= (query:any) =>{
  let match:any={};
  const {name,email}=query;
  if(name){
  match['name'] = { '$regex' : name, '$options' : 'i' }
  }
  if(email){
    match['email'] = { '$regex' : email, '$options' : 'i' }
  }
  return match;
};
export const getAllUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req?.query;
    const match=getCustomFilter(query);
    const pageOptions = {
      page : query?.page ? parseInt(query?.page) : 0,
      limit : query?.limit ? parseInt(query?.limit) : 0
    }
    const users: UserField[] = await User.find({...match},{name:1,email:1}).limit(pageOptions.limit).skip(pageOptions.page * pageOptions.limit).sort({name:"asc"});
    res.status(200).json({ users,page:query?.page,limit:query?.limit })
  } catch (error) {
    throw error
  }
};
const generateAccessToken = (id:string, email:string):any=>{
  if(email){
    return jwt.sign({ id,email },String(process.env.ACCESS_TOKEN_SECRET), {
      expiresIn: String(process.env.ACCESS_TOKEN_EXPIRES_IN)
    });
  }
  throw new Error('Error creating token');
};
const generateRefreshToken = async (id:string,email:string):Promise<any>=>{
  try{
  if(email){
    const refreshToken= jwt.sign({ id,email },String(process.env.REFRESH_TOKEN_SECRET), {
      expiresIn: String(process.env.REFRESH_TOKEN_EXPIRES_IN)
    });
    await redis.set(id.toString(),refreshToken)
    return refreshToken;
  }
}
catch(error){
  throw new Error('Error creating token');
}
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
   
    res.status(200).send({ auth: true, id: newUser._id,email:body.email });
  } catch (error) {
    res.status(400).json({
      error: "Error in registering user",
    });
    throw error
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<IUser, "email" | "password">
    const user=await User.findOne({ email:body.email });

    const isValidPassword= user ? await bcrypt.compare(body.password, user.password): false
    if(user && isValidPassword){
      var accessToken = generateAccessToken(user._id, body.email);
      var refreshToken = await generateRefreshToken(user._id,body.email);
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
      const {token,email,id}=req?.body;
      if(!token || !email || !id){
        res.status(400).json({
          error: "Body paremeters are required",
        });
      }
      const refreshToken=await redis.get(id)
      if(!refreshToken){
        res.status(400).json({
          error: "Refresh token is invalid",
        });
        return;
      }
      const accessToken = generateAccessToken(id,email);
      const newRefreshToken = await generateRefreshToken(id,email);
      await redis.set(id.toString(), JSON.stringify(newRefreshToken))
        res.json ({accessToken, refreshToken:newRefreshToken})
      
    } catch (error) {
      res.status(400).json({
        error: "something went wrong",
      });
      throw error
    }
  };
  
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req?.headers?.["authorization"]
      const authToken = authHeader?.split(" ")[1];
      const {id}=req?.body;
      if(!id){
        res.status(400).json({
          error: "Body paremeters are required",
        });
      }
      const refreshToken=await redis.get(id.toString());
      if(authToken && refreshToken){
        await redis.set(id.toString(),null);
        res.status(200).json({
          message: "Logout successfully",
        });
      }
      else {
        res.status(400).json({
          message: "Error in logging out",
        });
      }
    } catch (error) {
      res.status(400).json({
        error: "something went wrong",
      });
      throw error
    }
  };
  