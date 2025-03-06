import mongoose, { model, Schema } from "mongoose";

const cartCollection = 'Cart'

const cartSchema = new Schema({
    products: [
        {
            product:{
                type: mongoose.Schema.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
})

export const CartModel = model(cartCollection, cartSchema)
