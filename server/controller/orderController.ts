import { Request, Response } from "express";
import Restaurant from "../models/resturantModel";
import Order from "../models/orderModel";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
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

//get allOders by user//
import { Request, Response } from "express";
import Order from "../models/orderModel";

export const getOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    // Ensure authentication middleware sets req.user
    const userId = req.id; 

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find orders for the given user ID and populate the "user" field
    const orders = await Order.find({ user: userId }).populate("user");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error("Error in getOrders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



export const createCheckoutSession = async (req: Request, res: Response): Promise<any> => {
  try {
    // Define request type
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;
    const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId).populate("menu");

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant not found",
      });
    }
   //createCheckoutSession order is created//
    // Create a new order
    const order = new Order({
      user: req.id, // Ensure user authentication is handled
      restaurant: restaurant._id,
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      status: "pending",
    });
    // Create line items
    const menuItems = restaurant.menus;
    const lineItems = await createLineItems(checkoutSessionRequest, menuItems);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        shipping_address_collection: {
            allowed_countries: ['GB', 'US', 'CA']
        },
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/order/status`,
        cancel_url: `${process.env.FRONTEND_URL}/cart`,
        metadata: {
            orderId: order._id.toString(),
            images: JSON.stringify(menuItems.map((item: any) => item.image))
        }
    });
    if (!session.url) {
        return res.status(400).json({ success: false, message: "Error while creating session" });
    }
    await order.save();
        return res.status(200).json({
            session
        });

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
        const menuItem = menuItems.find((item:any) => item._id.toString() === cartItem._id.toString());
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
            unit_amount: Math.round(menuItem.price * 100), 
          },
          quantity: cartItem.quantity,
        };
      });
  
      return lineItems;
    } catch (error) {
      console.error("Error in createLineItems:", error);
      throw error; 
    }
  };
  
