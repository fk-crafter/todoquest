import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  description?: string;
  xp: number;
  completed: boolean;
  createdAt: Date;
}

const TaskSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    xp: {
      type: Number,
      default: 10,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;
