
'use server';

/**
 * @fileOverview A Genkit flow for handling M-Pesa STK push payments.
 *
 * - processMpesaPayment - A function that initiates an STK push request.
 * - MpesaPaymentInput - The input type for the processMpesaPayment function.
 * - MpesaPaymentOutput - The return type for the processMpesaPayment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';

const MpesaPaymentInputSchema = z.object({
  phoneNumber: z.string().describe("The user's 10-digit phone number (e.g., 07xxxxxxxx)."),
  amount: z.number().describe("The amount to be charged."),
  courseId: z.string().describe("The ID of the course being purchased."),
});
export type MpesaPaymentInput = z.infer<typeof MpesaPaymentInputSchema>;

const MpesaPaymentOutputSchema = z.object({
  success: z.boolean().describe("Whether the STK push was initiated successfully."),
  message: z.string().describe("A message indicating the status of the request."),
  checkoutRequestId: z.string().optional().describe("The CheckoutRequestID from M-Pesa, used to query the transaction status."),
});
export type MpesaPaymentOutput = z.infer<typeof MpesaPaymentOutputSchema>;

// This is a placeholder. In a real app, you would have a callback URL
// registered with Safaricom to receive the payment status.
const CALLBACK_URL = "https://your-callback-url.com/mpesa/callback";

async function getMpesaAccessToken(): Promise<string> {
    // IMPORTANT: Store these credentials securely in environment variables.
    // Do not hardcode them in your application.
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        throw new Error("M-Pesa consumer key or secret is not configured in environment variables.");
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    try {
        const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error("Failed to get M-Pesa access token:", error);
        throw new Error("Could not authenticate with M-Pesa.");
    }
}


export async function processMpesaPayment(
  input: MpesaPaymentInput
): Promise<MpesaPaymentOutput> {
  return mpesaPaymentFlow(input);
}

const mpesaPaymentFlow = ai.defineFlow(
  {
    name: 'mpesaPaymentFlow',
    inputSchema: MpesaPaymentInputSchema,
    outputSchema: MpesaPaymentOutputSchema,
  },
  async ({ phoneNumber, amount, courseId }) => {
    
    // In a real application, you would get these from your environment variables
    const shortCode = process.env.MPESA_SHORTCODE || '174379'; // Test shortcode
    const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

    if (!shortCode || !passkey) {
        return {
            success: false,
            message: 'M-Pesa credentials (Shortcode or Passkey) are not configured.'
        }
    }

    const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, -1);
    const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');
    
    // Format phone number to Safaricom's required format (254...)
    const formattedPhoneNumber = `254${phoneNumber.slice(-9)}`;

    try {
        const accessToken = await getMpesaAccessToken();

        const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline", // Or "CustomerBuyGoodsOnline"
            Amount: amount,
            PartyA: formattedPhoneNumber,
            PartyB: shortCode,
            PhoneNumber: formattedPhoneNumber,
            CallBackURL: `${CALLBACK_URL}?courseId=${courseId}`,
            AccountReference: "SkillSetAcademy", // Replace with your company name
            TransactionDesc: `Payment for ${courseId}`
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const { ResponseCode, ResponseDescription, CheckoutRequestID } = response.data;
        
        if (ResponseCode === "0") {
             return {
                success: true,
                message: ResponseDescription,
                checkoutRequestId: CheckoutRequestID
            };
        } else {
             return {
                success: false,
                message: ResponseDescription
            };
        }

    } catch (error: any) {
        console.error("M-Pesa STK Push error:", error.response ? error.response.data : error.message);
         return {
            success: false,
            message: "Failed to initiate M-Pesa payment. Please try again."
        };
    }
  }
);
