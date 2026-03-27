import mongoose from 'mongoose'
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const transactionSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    amount:{
        type:Number,
        required:true
    },
    type:{
        type:String,
        enum:['income','expense'],
        required:true
    },
    category:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    date:{
        type:Date,
        required:true
    },
    note:{
        type:String,
        trim:true,
        maxLength:500        
    }
},{
    timestamps:true

});



transactionSchema.plugin(aggregatePaginate);

const Transaction = mongoose.model('Transaction',transactionSchema);

export default Transaction;