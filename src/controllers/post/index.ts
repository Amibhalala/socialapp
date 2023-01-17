import { Response, Request } from "express";
import { IPost } from "../../types/post";
import Post from "../../models/post";
import { IComment } from "../../types/comment";
import Comment from "../../models/comment";
import { validateAccess } from "../../utility/commonFunction";
export const getCustomFilter= (query:any) =>{
  let match:any={};
  const {title,text}=query;
  if(title){
  match['title'] = { '$regex' : title, '$options' : 'i' }
  }
  if(text){
    match['text'] = { '$regex' : text, '$options' : 'i' }
  }
  return match;
};
export const getAllPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req?.query;
    const match=getCustomFilter(query);
    const pageOptions = {
      page : query?.page ? parseInt(query?.page) : 0,
      limit : query?.limit ? parseInt(query?.limit) : 0
    }
    const posts: IPost[] = await Post.find({...match}).limit(pageOptions.limit).skip(pageOptions.page * pageOptions.limit).sort({createdAt:-1});
    res.status(200).json({ posts,page:query?.page,limit:query?.limit })
  } catch (error) {
    res.status(400).json({
      error: "404 posts are not found",
});
    throw error
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const post: IPost | null = await Post.findById({_id:id})
            res.status(200).json({ post })
    } catch (error) {
      res.status(404).json({
            error: "404 post not found",
      });
      throw error;
      
    }
  };

export const getPostByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const post: IPost[] | null = await Post.find({createdBy:userId})
            res.status(200).json({ post })
    } catch (error) {
      res.status(404).json({
            error: "404 post not found",
      });
      throw error;
      
    }
  };
  
  
export const createPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as Pick<IPost, "title" | "text" | "createdBy" | "comments">
      const post: IPost = new Post({
        title: body.title,
        text: body.text,
        createdBy: body.createdBy
      })
  
      const newPost: IPost = await post.save()
      const allPost: IPost[] = await Post.find()
  
      res
        .status(201)
        .json({ message: "Post created", post: newPost, posts: allPost })
    } catch (error) {
      res.status(400).json({
        error: "something went wrong",
      });
      throw error
    }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        params: { id },
        body,
      } = req
      const userId=req?.user?.id;
      const updatePost: IPost | null = await Post.findByIdAndUpdate(
        { _id: id },
        body,
        {new: true}
        )
      validateAccess(userId,updatePost?.createdBy.toString(),res)
      const allPost: IPost[] = await Post.find()
      res.status(200).json({
        message: "Post updated",
        post: updatePost,
        posts: allPost,
      })
    } catch (error) {
      res.status(400).json({
        error: "something went wrong",
      });
      throw error
    }
  };  

export const deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedPost: IPost | null = await Post.findByIdAndRemove(
        req.params.id
      )
      if(deletedPost){
      const userId=req?.user?.id;
        validateAccess(userId,deletedPost?.createdBy?.toString(),res)
        const allPost: IPost[] = await Post.find()
        res.status(200).json({
          message: "Post deleted",
          post: deletedPost,
          posts: allPost,
        })
      }
      else {
        res.status(400).json({
              error: "post is not found",
        });
      }
    } catch (error) {
      res.status(400).json({
        error: "something went wrong",
      });
      throw error
    }
};

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params?.id;
    const body = req.body as Pick<IComment, "text" | "createdBy">
    const comment:IComment = new Comment({
      text: body.text,
      createdBy: body.createdBy,
      post: id
   })
   const newComment: IComment = await comment.save();
   let post: IPost | null = await Post.findById({_id:id})
   post?.comments.push(comment);
   const updatedPost: IPost= await post.save()
    res
      .status(201)
      .json({ message: "Comment created", comment: newComment, post: updatedPost })
  } catch (error) {
    res.status(400).json({
      error: "something went wrong",
    });
    throw error
  }
};