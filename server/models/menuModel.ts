import mongoose, { Document, Schema } from 'mongoose';

interface IMenu extends Document {
  name: string; 
  description: string;
  price: number; 
  image: string;
  createdAt?: Date; 
  updatedAt?: Date; 
}

const menuSchema: Schema<IMenu> = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  },
  {
    timestamps: true, 
  }
);

const Menu = mongoose.model<IMenu>('Menu', menuSchema);

export default Menu;
