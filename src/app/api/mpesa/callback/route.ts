
import { NextResponse } from 'next/server';

// This is the endpoint Safaricom will call to notify you of payment status
export async function POST(req: Request) {
    console.log("M-Pesa callback received");

    try {
        const body = await req.json();
        console.log("Callback body:", JSON.stringify(body, null, 2));

        // The body contains the result of the STK push
        const stkCallback = body.Body.stkCallback;
        const resultCode = stkCallback.ResultCode;
        const checkoutRequestId = stkCallback.CheckoutRequestID;

        if (resultCode === 0) {
            // Payment was successful
            console.log(`Payment successful for CheckoutRequestID: ${checkoutRequestId}`);

            const metadata = stkCallback.CallbackMetadata.Item;
            const amount = metadata.find((i: any) => i.Name === 'Amount').Value;
            const mpesaReceiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber').Value;
            const phoneNumber = metadata.find((i: any) => i.Name === 'PhoneNumber').Value;

            // TODO: Implement your business logic here
            // 1. Find the transaction in your database using the checkoutRequestId
            // 2. Verify that the amount and other details match
            // 3. If everything is correct, update the user's record to grant them access to the course
            // 4. Send a confirmation email to the user
            
            console.log({
                amount,
                mpesaReceiptNumber,
                phoneNumber
            });

        } else {
            // Payment failed or was cancelled
            console.log(`Payment failed for CheckoutRequestID: ${checkoutRequestId}. Result Code: ${resultCode}, Reason: ${stkCallback.ResultDesc}`);
            // TODO: Update the transaction in your database to reflect the failure
        }

        // Respond to Safaricom to acknowledge receipt of the callback.
        // If you don't send a success response, Safaricom will retry the callback.
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

    } catch (error) {
        console.error("Error processing M-Pesa callback:", error);
        // Respond with a non-zero code to indicate an error on your end.
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Rejected" }, { status: 500 });
    }
}
