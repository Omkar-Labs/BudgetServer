import { asyncHandler } from "../utils/asyncHandler.js"
import Transaction from "../models/transaction.model.js"
import ApiResponse from "../utils/apiResponse.js"
import ApiError from "../utils/apiError.js"


const addTransaction = asyncHandler(async (req, res) => {
    // Extract transaction details from the request body
    // Validate required fields
    // Create new transaction in the database
    // Send response

    const { amount, category, date, note, type, title } = req.body;

    if ([amount, category, date, type, title].some(field => !field)) {
        throw new ApiError(400, 'All fields are required');
    }

    const transaction = await Transaction.create({
        userId: req.user._id,
        title,
        amount,
        category,
        date,
        note,
        type
    });

    res.status(201).json(new ApiResponse(201, 'Transaction added successfully', transaction));
});

const updateTransaction = asyncHandler(async (req, res) => {
    // Extract transaction ID from request parameters
    // Extract updated details from request body
    // Validate required fields
    // Find transaction by ID and update in the database
    // Send response
    const { id } = req.params;
    const { amount, category, date, note, type, title } = req.body;
    if ([amount, category, date, type, title].some(field => !field)) {
        throw new ApiError(400, 'All fields are required');
    }

    const transaction = await Transaction.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { title, amount, category, date, note, type },
        { new: true }
    );
    if (!transaction) {
        throw new ApiError(404, 'Transaction not found');
    }
    res.status(200).json(new ApiResponse(200, 'Transaction updated successfully', transaction));
});

const deleteTransaction = asyncHandler(async (req, res) => {
    // Extract transaction ID from request parameters
    // Find transaction by ID and delete from the database
    // Send response

    const { id } = req.params;
    

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.user._id });
    
    if (!transaction) {
        throw new ApiError(404, 'Transaction not found');
    }
    res.status(200).json(new ApiResponse(200, 'Transaction deleted successfully'));
});

const getTransactions = asyncHandler(async (req, res) => {
    // Extract user ID from request (assuming it's available in req.user)
    // Find all transactions for the user in the database
    // Send response with transactions

    let query = { userId: req.user._id };
    const { search, type, category, startDate, endDate,limit,skip} = req.query;

    if (search) {
        query.title = { $regex: search, $options: 'i' }
    }
    if (type) {
        query.type = type;
    }
    if (category) {
        query.category = category;
    }
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const transactions = await Transaction.aggregate([
        { $match: query },
        { $sort: { date: -1 } },
        { $skip: parseInt(skip) || 0 },
        { $limit: parseInt(limit) || 100 },
        
    ]);

    res.status(200).json(new ApiResponse(200, 'Transactions retrieved successfully', transactions));
});

const transactionStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { month, year } = req.query;
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);
    const startDate = new Date(yearInt, monthInt, 1);
    const endDate = new Date(yearInt, monthInt + 1, 0,23,59,59,999);
    
    let matchQuery = { userId: userId };
    if (month && year) {
        matchQuery.date = {
            $gte: startDate,
            $lte: endDate
        }
    }

    const stats = await Transaction.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$type',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            },
        }
    ]);

    const stats2 = await Transaction.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$category',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            },
        }
    ]);
    const response = {
        totalIncome: stats.find(stat => stat._id === 'income')?.totalAmount || 0,
        totalExpense: stats.find(stat => stat._id === 'expense')?.totalAmount || 0,
        totalBalance: (stats.find(stat => stat._id === 'income')?.totalAmount || 0) - (stats.find(stat => stat._id === 'expense')?.totalAmount || 0),
        categoryStats: stats2
    }

    res.status(200).json(new ApiResponse(200, 'Transaction stats retrieved successfully', response));
});

const singleTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const transaction = await Transaction.findOne({ _id: id, userId: req.user._id });
    if (!transaction) {
        throw new ApiError(404, 'Transaction not found');
    }
    res.status(200).json(new ApiResponse(200, 'Transaction retrieved successfully', transaction));
});

export { addTransaction, updateTransaction, deleteTransaction, getTransactions, transactionStats, singleTransaction };