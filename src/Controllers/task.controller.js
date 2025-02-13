
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.model.js";
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const setTask = asyncHandler(async (req,res)=>{
  console.log("------------------setTask------------------------")
    const { title, description, dueDate, status } = req.body;
    console.log(req.body)
    const userId = req.user._id;
    console.log("--------------userId------------");
    console.log(userId);
    if(!userId){
        res.status(401)
        .json(
            new ApiResponse(401,{},"unathorized",false)
        )
    }

    if (
        [title,description,dueDate,status].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const validStatuses = ["Pending", "In Progress", "Completed"];
    if (status && !validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status value. Allowed: Pending, In Progress, Completed", false);
    }
    const task = new Task(
        {
            title,
            dueDate,
            description,
            status,
            userId:userId
        }
    );

    await task.save();

    res.status(201)
    .json(
        new ApiResponse(201,task,"task Added successfully",true)
    )

})

const editTask = asyncHandler(async(req,res)=>{
     const {taskId,title,description,dueDate,status} = req.body;

     if (!taskId) {
        throw new ApiError(400, "Task ID is required", false);
      }

     const task = await Task.findById(taskId);
       
     if(!task){
        throw new ApiError(404,"task does not exists",false)
     }

     const validStatuses = ["Pending", "In Progress", "Completed"];
  if (status && !validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value. Allowed: Pending, In Progress, Completed", false);
  }

  task.title = title || task.title;
  task.description = description || task.description;
  task.dueDate = dueDate || task.dueDate;
  task.status = status || task.status;

  await task.save();

  res.status(201)
  .json(
    new ApiResponse(201,task,"task updated successfully",true)
  )

     
})

const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.body; 
  
    if (!taskId) {
      throw new ApiError(400, "Task ID is required", false);
    }
  
    const task = await Task.findById(taskId);
  
    if (!task) {
      throw new ApiError(404, "Task not found", false);
    }
  
    await task.deleteOne(); // Delete the task from the database
  
 res.status(201)
 .json(
    new ApiResponse(201,{},"task delted successfully")
 )
  });

const myTasks = asyncHandler(async (req,res)=>{
    const userId = req.user._id;
    if(!userId){
        throw new ApiError(401,"unauthorized User",false)
    }

    const tasks = await Task.find({userId:userId});
   
    if (!tasks || tasks.length === 0) {
        console.log("No tasks found for this user.");
      } else {
        
      }

      res.status(201)
      .json(
        new ApiResponse(201,tasks,"my all tasks",true)
      )
})

const generatePdf = asyncHandler(async(req,res)=>{

    console.log(generatePdf)
   
    const userId = req.user._id;

    if(!userId){
        throw new ApiError(401,"user is not authorized")
    }

    const tasks = await Task.find({userId:userId});

    if(!tasks || tasks.length===0){
        res.status(404)
        .json(404,{},"no task found for the user");
    }       
    const pdfDir = path.join(__dirname, '../../pdfs');
    const pdfFilePath = path.join(__dirname,`../../pdfs/tasks_${userId}.pdf`);
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });  // Creates folder if it doesn't exist
    }
    const doc = new PDFDocument();
   
    
    const writeStream = fs.createWriteStream(pdfFilePath);
    doc.pipe(writeStream)

    doc.fontSize(18).text("User Tasks Report", { align: "center" }).moveDown(1);
    
    tasks.forEach((task, index) => {
        doc
          .fontSize(14)
          .text(`Task ${index + 1}: ${task.title}`, { underline: true })
          .moveDown(0.2);
        doc.text(`Description: ${task.description}`).moveDown(0.2);
        doc.text(`Due Date: ${task.dueDate.toDateString()}`).moveDown(0.2);
        doc.text(`Status: ${task.status}`).moveDown(1);
      });
      doc.end()


      writeStream.on("finish", () => {
        res.download(pdfFilePath, `tasks_${userId}.pdf`, (err) => {
          if (err) {
            console.error("Download error:", err);
            res.status(500).json({ success: false, message: "Error generating PDF" });
          }
          fs.unlinkSync(pdfFilePath);
        });
    });
    

})
  
export {setTask,editTask,deleteTask,myTasks,generatePdf};