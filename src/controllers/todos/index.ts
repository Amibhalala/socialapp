import { Response, Request } from "express";
import { ITodo } from "../../types/todo";
import Todo from "../../models/todo";
export const getAllTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req?.query;
    const pageOptions = {
      page : query?.page ? parseInt(query?.page) : 0,
      limit : query?.limit ? parseInt(query?.limit) : 0
    }
    const todos: ITodo[] = await Todo.find({}).limit(pageOptions.limit).skip(pageOptions.page * pageOptions.limit).sort({name:'asc'});
    res.status(200).json({ todos })
  } catch (error) {
    throw error
  }
};

export const getTodoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const todo: ITodo | null = await Todo.findById({_id:id})
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
      const allTodos: ITodo[] = await Todo.find()
      res.status(200).json({
        message: "Todo deleted",
        todo: deletedTodo,
        todos: allTodos,
      })
    } catch (error) {
      res.status(400).json({
        error: "something went wrong",
      });
      throw error
    }
};
  