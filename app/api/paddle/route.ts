import { NextResponse } from "next/server";
import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: Environment.Production,
  logLevel: LogLevel.None,
});

export async function POST(request: Request) {
  try {
    const { priceId, email, userId } = await request.json();

    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customerEmail: email,
      customData: { userId },
    } as any);

    return NextResponse.json({ transactionId: transaction.id, checkoutUrl: (transaction as any).checkout?.url });
  } catch (error: any) {
    console.error("Paddle error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
