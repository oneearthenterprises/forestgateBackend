import cron from "node-cron";
import Usermodel from "../models/user.js";
import { sendBirthdayEmail, sendAnniversaryEmail } from "./emailService.js";

const checkGreetings = async () => {
  console.log("Running daily greeting check...");
  try {
    const users = await Usermodel.find({
      $or: [{ dob: { $ne: "" } }, { anniversaryDate: { $ne: "" } }],
    });

    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1; // 1-12

    for (const user of users) {
      // Check Birthday
      if (user.dob) {
        const dobDate = new Date(user.dob);
        if (
          dobDate.getDate() === todayDay &&
          dobDate.getMonth() + 1 === todayMonth
        ) {
          await sendBirthdayEmail(user.email, user.name);
        }
      }

      // Check Anniversary
      if (user.anniversaryDate) {
        const annivDate = new Date(user.anniversaryDate);
        if (
          annivDate.getDate() === todayDay &&
          annivDate.getMonth() + 1 === todayMonth
        ) {
          await sendAnniversaryEmail(user.email, user.name);
        }
      }
    }
  } catch (error) {
    console.error("Error in greeting cron job:", error);
  }
};

// Run every day at midnight (00:00)
export const initCronJobs = () => {
  cron.schedule(
    "0 0 * * *",
    () => {
      checkGreetings();
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    },
  );

  console.log("Cron jobs initialized.");

  // For testing/verification purposes, can also trigger once on startup
  // checkGreetings();
};
