import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function GET() {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }

    // The Admin SDK exposes project ID via app.options
    const app = admin.app();
    const projectId = app.options.projectId;

    return NextResponse.json({
      success: true,
      message: "Firebase Admin initialized successfully.",
      projectId,
    });
  } catch (error) {
    console.error("Firebase Admin test error:", error);
    return NextResponse.json({
      success: false,
      message: "Firebase Admin initialization failed.",
      error: String(error),
    });
  }
}

