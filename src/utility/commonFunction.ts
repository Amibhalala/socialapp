import { Response} from "express";

export const validateAccess =  (userId: string, ownerId:string,res:Response) => {
  if(userId !== ownerId){
      res.status(401).json({
        message: 'Unauthorized user!'
    });
    return;
  }
};
