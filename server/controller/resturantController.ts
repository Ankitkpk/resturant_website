import { Request, Response } from "express";
import Restaurant from '../models/resturantModel';

//one user can create only one restuarant//
export const createRestaurant = async (req: Request, res: Response):Promise<any>=> {
    try {
        const { restaurantName, city, country, deliveryTime, cuisines } = req.body;
        const file = req.file;
 
        //find the restuarant based on user: id first //
        const restaurant = await Restaurant.findOne({user:req.id});
        if (restaurant) {
            return res.status(400).json({
                success: false,
                message: "Restaurant already exist for this user"
            })
        }
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            })
        }
        const imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
        await Restaurant.create({
            user: req.id,
            restaurantName,
            city,
            country,
            deliveryTime,
            cuisines: JSON.parse(cuisines),
            imageUrl
        });
        return res.status(201).json({
            success: true,
            message: "Restaurant Added"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

const User = mongoose.model<IUserDocument>("User", userSchema);

export default User;