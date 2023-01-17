import { Response, Request } from "express";
import { ITodo } from "../../types/todo";
import Todo from "../../models/todo";
import {validateAccess} from "../../utility/commonFunction";
import redis from "../../utility/redis";
export const getCustomFilter= (query:any) =>{
  let match:any={};
  const {name,status}=query;
  if(name){
  match['name'] = { '$regex' : name, '$options' : 'i' }
  }
  if(status){
    match['status'] = status === 'true';
  }
  return match;
};

export const getAllTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req?.query;
    const match=getCustomFilter(query);
    const pageOptions = {
      page : query?.page ? parseInt(query?.page) : 0,
      limit : query?.limit ? parseInt(query?.limit) : 0
    }
    const todos: ITodo[] = await Todo.find({...match}).limit(pageOptions.limit).skip(pageOptions.page * pageOptions.limit).sort({name:'asc'});
    res.status(200).json({ todos,page:query?.page,limit:query?.limit })
  } catch (error) {
    throw error
  }
};

export const getTodoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const todo: ITodo | null = await Todo.findById({_id:id})
      redis.set(id, JSON.stringify(todo), "ex", 15);
      res.status(200).json({ todo })
    } catch (error) {
      res.status(404).json({
            error: "404 todo not found",
      });
      throw error;
      
    }
  };
  export const getTodoByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const todo: ITodo[] | null = await Todo.find({userId})
            res.status(200).json({ todo })
    } catch (error) {
      res.status(404).json({
            error: "404 todo not found",
      });
      throw error;
      
    }
  };
  
  
export const createTodo = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as Pick<ITodo, "name" | "description" | "status" | "userId">
  
      const todo: ITodo = new Todo({
        name: body.name,
        description: body.description,
        status: body.status,
        userId: body.userId
      })
  
      const newTodo: ITodo = await todo.save()
      const allTodos: ITodo[] = await Todo.find()
  
      res
        .status(201)
        .json({ message: "Todo created", todo: newTodo, todos: allTodos })
    } catch (error) {
      res.status(400).json({
        error: "something went wrong",
      });
      throw error
    }
};

export const updateTodo = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        params: { id },
        body,
      } = req
      const updateTodo: ITodo | null = await Todo.findByIdAndUpdate(
        { _id: id },
        body,
        {new: true}
      )
      const allTodos: ITodo[] = await Todo.find()
      const userId=req?.user?.id;
      validateAccess(userId,updateTodo?.userId?.toString(),res)
      res.status(200).json({
        message: "Todo updated",
        todo: updateTodo,
        todos: allTodos,
      })
    } catch (error) {
      res.status(400).json({
        error: "something went wrong",
      });
      throw error
    }
  };  

export const deleteTodo = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedTodo: ITodo | null = await Todo.findByIdAndRemove(
        req.params.id
      )
      if(deletedTodo){

      const userId=req?.user?.id;
      if(userId !== deletedTodo?.userId.toString()){
          res.status(401).json({
            message: 'Unauthorized user!'
        });
      }
      const allTodos: ITodo[] = await Todo.find()
      res.status(200).json({
        message: "Todo deleted",
        todo: deletedTodo,
        todos: allTodos,
      })
    }
    else {
      res.status(400).json({
            error: "Todo is not found",
      });
    }
    } catch (error) {
      res.status(400).json({
        error: "something went wrong",
      });
      throw error
    }
};
  