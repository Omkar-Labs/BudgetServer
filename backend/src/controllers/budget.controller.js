import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Budget from "../models/budget.model.js";
import mongoose from "mongoose";





const createBudget = asyncHandler(async (req, res) => {
    const { limit, category, month, year } = req.body;

    if ([limit, category, month, year].some(field => field === undefined)) {
        throw new ApiError(400, "All fields are required")
    }

    // Check if budget already exists for the user, category, month and year
    const existingBudget = await Budget.findOne({
        user: req.user._id,
        category,
        month,
        year
    });

    if (existingBudget) {
        throw new ApiError(400, "Budget already exists for this category and month")
    }

    const budget = await Budget.create({
        user: req.user._id,
        limit,
        category,
        month,
        year
    });

    res.status(201).json(
        new ApiResponse(201, budget, "Budget created successfully")
    )
});

const getBudgets = asyncHandler(async (req, res) => {
    const { month, year} = req.query;

    if (!month || !year ) {
        res.status(400).json(new ApiError(400, "Month, year and category are required"));
        return;
    }

    const budget = await Budget.aggregate([
        { $match: {
                user: req.user._id,
                month: parseInt(month),
                year: parseInt(year),
            }
        },{
            $group: {
                _id: "$category",
                totalLimit: { $sum: "$limit" },
            }
        },{
            $lookup: {
                from: "transactions",
                let: { budgetCategory: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$userId", new mongoose.Types.ObjectId(req.user._id)] },
                                    { $eq: ["$category", "$$budgetCategory"] },
                                    { $eq: [{$month : "$date"},parseInt(month)] },
                                    { $eq: [{$year: "$date"}, parseInt(year)] }
                                ]
                            }
                        }
                    }
                ],
                as: "transactions"
            }
        }
        
    ]);
    const totalLimit = budget.reduce((acc, curr) => acc + curr.totalLimit, 0);

    res.status(200).json(
        new ApiResponse(200,  "Budgets retrieved successfully",{    budget, totalLimit})
    )
});

export { createBudget, getBudgets };