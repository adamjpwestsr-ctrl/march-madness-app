import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const { token, title, body } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "Missing FCM token" }, { status: 400 });
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }

    const message = {
      token,
      notification: {
        title: title || "BracketBoss Test",
        body: body || "This is a live push notification test from your Firebase Admin route.",
      },
    };

    const response = await admin.messaging().send(message);

    return NextResponse.json({
      success: true,
      message: "Push notification sent successfully.",
      response,
    });
  } catch (error) {
    console.error("Push notification error:", error);
    return NextResponse.json({
      success: false,
      message: "Push notification failed.",
      error: String(error),
    });
  }
}
