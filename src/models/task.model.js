import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
     userId:{
       type:mongoose.Schema.ObjectId,
       ref:'User',
       required:true
     },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    dueDate: {
        type: Date,
        required: true
      },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    },
  },
   { timestamps: true }
);
  
  export const Task = mongoose.model('Task', taskSchema);
  
