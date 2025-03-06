import { model, Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const productCollections = 'Product'

const productSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
    },
    code:{
        type: String,
        unique: true,
        require: true
    },
    price:{
        type: Number,
        require: true
    },
    stock: {
        type: Number,
        require: true
    },
    category: {
        type: String,
        require:true
    }
})

productSchema.plugin(mongoosePaginate)

export const ProductModel = model(productCollections, productSchema)