import { IUser } from "../types/user";
import { model, Schema } from "mongoose";

export const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post'}]
  },
  { timestamps: true }
)
export const userBodyObject = {
  email: 'string',
  password: 'string',
  required: ['email','password']
}


export default model<IUser>("User", userSchema)