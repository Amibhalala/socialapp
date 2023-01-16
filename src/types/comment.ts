import { Document } from "mongoose"
import {IPost} from "./post";
export interface IComment extends Document {

  text: string,
  createdBy:string
  post: IPost,
}