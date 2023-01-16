import { IPost } from "../types/post";
import { model, Schema } from "mongoose";
import mongoose from "mongoose";

const postSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }],
  },
  { timestamps: true }
)

export default model<IPost>("Post", postSchema)