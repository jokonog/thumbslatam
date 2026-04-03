import { NextResponse } from "next/server";
import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";

const isSandbox = process.env.PADDLE_ENV === "sandbox";
const paddle = new Paddle(
  isSandbox ? process.env.PADDLE_SANDBOX_API_KEY! : process.env.PADDLE_API_KEY!,
  {
    environment: isSandbox ? Environment.sandbox : Environment.production,
    logLevel: LogLevel.none,
  }
);

export async function POST(request: Request) {
  try {
    const { priceId, email, userId } = await request.json();

    const finalPriceId = isSandbox
      ? (priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO
          ? process.env.PADDLE_SANDBOX_PRICE_PRO
          : process.env.PADDLE_SANDBOX_PRICE_STUDIO)
      : priceId;

    const transaction = await paddle.transactions.create({
      items: [{ priceId: finalPriceId, quantity: 1 }],
      customerEmail: email,
      customData: { userId },
    } as any);

    return NextResponse.json({ transactionId: transaction.id, checkoutUrl: (transaction as any).checkout?.url });
  } catch (error: any) {
    console.error("Paddle error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
