import mongoose, { Document } from 'mongoose';

interface IRestaurant extends Document {
  user: mongoose.Schema.Types.ObjectId[];
  restaurant: string; 
  city: string;
  country: string;
  deliverTime: number; 
  cuisines: string[]; 
  menus: mongoose.Schema.Types.ObjectId[]; 
  image: string;
  createdAt?: Date; 
  updatedAt?: Date; 
}

// Define the Mongoose schema
const restaurantSchema = new mongoose.Schema<IRestaurant>({
  user: { type: [mongoose.Schema.Types.ObjectId],ref: 'User', required: true },
  restaurant: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  deliverTime: { type: Number, required: true },
  cuisines: { type: [String], required: true },
  //multiple id will be stored in array//
  menus: { type: [mongoose.Schema.Types.ObjectId], ref: 'Menu', required: true }, 
  image: { type: String, required: true },
}, { timestamps: true });

const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);

export default Restaurant;
