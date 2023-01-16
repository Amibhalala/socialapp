import { IUser } from "../types/user";
import { model, Schema } from "mongoose";

const userSchema: Schema = new Schema(
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

export default model<IUser>("User", userSchema)