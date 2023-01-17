import { Response, Request, NextFunction } from "express";
import redis from "./utility/redis";
const MAX_LIMIT=10;
const TIMEOUT=60
export const requestRateLimiter =  async(req: Request, res: Response, next:NextFunction)=> {
    try {
const ip = req?.socket?.remoteAddress;
      const requests = await redis.incr(ip);
      if (requests > MAX_LIMIT) {
        return res.status(429).send('Too many requests - try again later');
      }  
      await redis.expire(ip, TIMEOUT);
      return next();
    }
      catch(error) {
        throw error
      }
    }

export const cacheRequest = (req: Request, res: Response, next:NextFunction) => {
        const { id } = req.params;
        console.log('888',req.params)
        redis.get(id, (error, result) => {
          if (error) throw error;
          if (result !== null) {
            console.log('here89',result)
            return res.json(JSON.parse(result));
          } else {
            return next();
          }
        });
      };