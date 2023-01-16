import { Document } from "mongoose"
import {IComment} from "./comment";
import {IUser} from "./user";
export interface IPost extends Document {
  title: string,
  text: string,
  comments: IComment[],
  createdBy:IUser
}