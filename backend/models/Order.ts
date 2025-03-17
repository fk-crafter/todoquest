import mongoose, { Schema, Document } from "mongoose";

interface IProduct {
  product: mongoose.Schema.Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId;
  products: IProduct[];
  totalPrice: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema: Schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
