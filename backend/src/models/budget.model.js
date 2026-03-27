import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const budgetSchema = new mongoose.Schema(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    limit:{
        type: Number,
        required: true,
    },
    category:{
        type: String,
        required: true,
        lowercase:true,
        trim:true
    },
    month:{
        type:Number,
        required: true,
    },
    year:{
        type:Number,
        required: true,
    }
});

budgetSchema.plugin(aggregatePaginate);
const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;