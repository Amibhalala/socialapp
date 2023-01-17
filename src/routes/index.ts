import { Router } from "express";
import {registerUser,login,refreshToken, getAllUser,logout} from "../controllers/user";
import { getAllTodos,getTodoByUserId,getTodoById, createTodo, updateTodo, deleteTodo } from "../controllers/todos";
import { getAllPost,getPostByUserId,getPostById, createPost, updatePost, deletePost,createComment } from "../controllers/post";
import {validateParam, validateToken} from "../validator";
import {cacheRequest} from "../middleware";

const router: Router = Router()
router.post("/register",registerUser);
router.post("/login",login);
router.post("/refreshToken",refreshToken);
router.post("/logout",logout);
router.get("/users",validateToken, getAllUser);
router.get("/user/:userId/post",[validateToken,validateParam], getPostByUserId);
router.get("/user/:userId/todo",[validateToken,validateParam], getTodoByUserId);
router.get("/todos",validateToken, getAllTodos);
router.get("/todo/:id/",[validateToken,validateParam,cacheRequest], getTodoById);

router.post("/todo/create",validateToken, createTodo);

router.put("/todo/:id/update",[validateToken,validateParam], updateTodo);

router.delete("/todo/:id/delete",[validateToken,validateParam], deleteTodo);

router.get("/posts",validateToken, getAllPost);
router.get("/post/:id/",[validateToken,validateParam,cacheRequest], getPostById);

router.post("/post/create",validateToken, createPost);

router.put("/post/:id/update",[validateToken,validateParam], updatePost);

router.delete("/post/:id/delete",[validateToken,validateParam], deletePost);
router.post("/post/:id/comment",[validateToken,validateParam], createComment);

export default router;