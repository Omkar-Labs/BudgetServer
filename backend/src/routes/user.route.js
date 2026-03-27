import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser, logOutUser, refreshAccessToken, registerUser,generateOtp,verifyOtp,getUserProfile } from "../controllers/user.controller.js";
import { addTransaction, deleteTransaction, updateTransaction,transactionStats ,singleTransaction,getTransactions} from "../controllers/transaction.controller.js";
import { createBudget, getBudgets } from "../controllers/budget.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";



const router = Router();

router.route("/register").post(
    upload.single("avatar"),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyToken , logOutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/forgot-password").post(generateOtp)

router.route("/verify-otp").put(verifyOtp)

router.route("/profile").get(verifyToken, getUserProfile)

router.route("/transactions").post(verifyToken, addTransaction)
router.route("/transactions").get(verifyToken, getTransactions)
router.route("/transactions/:id").put(verifyToken, updateTransaction)
router.route("/transactions/:id").delete(verifyToken, deleteTransaction)

router.route("/transactions/stats").get(verifyToken, transactionStats)
router.route("/transactions/:id").get(verifyToken, singleTransaction)

router.route("/budgets").post(verifyToken, createBudget)
router.route("/budgets").get(verifyToken, getBudgets)

export default router