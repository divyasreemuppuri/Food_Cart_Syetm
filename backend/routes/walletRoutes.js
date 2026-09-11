import express from "express";
import { sendWalletOTP, verifyWalletOTP ,addMoneyToWallet} from "../controllers/walletController.js";

const router = express.Router();

router.post("/otp/:studentId", sendWalletOTP);
router.post("/verify/:studentId", verifyWalletOTP);
router.post("/add/:studentId", addMoneyToWallet);


export default router;
