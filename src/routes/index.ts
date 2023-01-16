import { Router } from "express";
import {validateToken, registerUser,login,refreshToken, getAllUser} from "../controllers/user";
import { getAllTodos,getTodoByUserId,getTodoById, createTodo, updateTodo, deleteTodo } from "../controllers/todos";
import { getAllPost,getPostByUserId,getPostById, createPost, updatePost, deletePost,createComment } from "../controllers/post";

const router: Router = Router()
router.post("/register",registerUser);
router.post("/login",login);
router.post("/refreshToken",refreshToken);
router.get("/users",validateToken, getAllUser);
router.get("/user/:userId/post",validateToken, getPostByUserId);
router.get("/user/:userId/todo",validateToken, getTodoByUserId);
router.get("/todos",validateToken, getAllTodos);
router.get("/todo/:id/",validateToken, getTodoById);

router.post("/todo/create",validateToken, createTodo);

router.put("/todo/:id/update",validateToken, updateTodo);

router.delete("/todo/:id/delete",validateToken, deleteTodo);

router.get("/posts",validateToken, getAllPost);
router.get("/post/:id/",validateToken, getPostById);

router.post("/post/create",validateToken, createPost);

router.put("/post/:id/update",validateToken, updatePost);

router.delete("/post/:id/delete",validateToken, deletePost);
router.post("/post/:id/comment",validateToken, createComment);

export default router;