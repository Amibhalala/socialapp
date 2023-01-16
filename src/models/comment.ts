import { IComment } from "../types/comment";
import { model, Schema } from "mongoose";
import mongoose from "mongoose";

const commentSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
   },
   createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
  },
  { timestamps: true }
)

export default model<IComment>("Comment", commentSchema)