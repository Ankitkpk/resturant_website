import mongoose, { Document, Schema } from 'mongoose';

// Define the types for delivery details and cart items
type DeliveryDetails = {
  email: string;
  name: string;
  address: string;
};

type CartItems = {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId;  
  resturant: mongoose.Schema.Types.ObjectId;  
  deliveryDetails: DeliveryDetails; 
  cartItems: CartItems[]; 
  totalAmount: number;
  status: "pending" | "confirmed" | "outfordelivery" | "delivered";
  createdAt?: Date; 
  updatedAt?: Date; 
}

const orderSchema: Schema<IOrder> = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resturant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    deliveryDetails: {
      email: { type: String, required: true },
      name: { type: String, required: true },
      address: { type: String, required: true }
    },
    //since many cartItems will be theirfore array//
    cartItems: [
      {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "outfordelivery", "delivered"], default: "pending" }
  },
  {
    timestamps: true, 
  }
);

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
