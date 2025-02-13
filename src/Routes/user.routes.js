import {Router} from 'express'
import { loginUser, registerUser , logoutUser} from '../Controllers/user.controller.js';
import { editTask, setTask ,deleteTask, myTasks, generatePdf} from '../Controllers/task.controller.js';
import {authenticatUser} from '../middlewares/auth.middleware.js'
const userRouter = Router();

userRouter.route('/register').post(registerUser)
userRouter.route('/login').post(loginUser);
userRouter.route('/logout').post(authenticatUser,logoutUser)


// task Routes

userRouter.route('/setTask').post(authenticatUser,setTask);
userRouter.route('/editTask').put(authenticatUser,editTask)
userRouter.route('/deleteTask').delete(authenticatUser,deleteTask)
userRouter.route('/myTasks').get(authenticatUser,myTasks)

// generate pdf

userRouter.route('/generatePdf').get(authenticatUser,generatePdf)


export default userRouter