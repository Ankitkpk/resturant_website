import { Request, Response } from "express";
import Restaurant from "../models/resturantModel";
import Order from "../models/orderModel";


type CheckoutSessionRequest = {
  cartItems: {
    _id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    address: string;
  };
  restaurantId: string;
};

export const createCheckoutSession = async (req: Request, res: Response): Promise<any> => {
  try {
    // Define request type
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    // Find restaurant and populate menu
    const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId).populate("menu");

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Create a new order
    const order = new Order({
      user: req.id, // Ensure user authentication is handled
      restaurant: restaurant._id,
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      status: "pending",
    });

    await order.save(); 

    // Create line items
    const menuItems = restaurant.menus;
    const lineItems = await createLineItems(checkoutSessionRequest, menuItems);

    res.json({ success: true, lineItems, orderId: order._id });

  } catch (error: any) {
    console.error("Error in createCheckoutSession:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createLineItems = async (req: CheckoutSessionRequest, menuItems: any[]): Promise<any[]> => {
    try {
      const lineItems = req.cartItems.map((cartItem) => {
        const menuItem = menuItems.find((item) => item._id.toString() === cartItem._id.toString());
       console.log(menuItem);
        if (!menuItem) {
          throw new Error(`Menu item with ID ${cartItem._id} not found`);
        }
  
        return {
          price_data: {
            currency: "usd", // Adjust currency as needed
            product_data: {
              name: menuItem.name,
              description: menuItem.description || "",
            },
            unit_amount: Math.round(menuItem.price * 100), // Convert price to cents
          },
          quantity: cartItem.quantity,
        };
      });
  
      return lineItems;
    } catch (error) {
      console.error("Error in createLineItems:", error);
      throw error; // Ensure errors are properly thrown
    }
  };
  
