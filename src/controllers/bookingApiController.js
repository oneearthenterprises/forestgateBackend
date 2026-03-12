import express from "express";
import whatsappBooking from "../models/whatsappBooking";

const createWhatsappBooking = async (req, res) => {
  try {
    const {
      fullName,
      email,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      bookingId,
      roomName,
      numAdults,
      numChildren,
    } = req.body;
    if (
      !fullName ||
      !email ||
      !checkIn ||
      !checkOut ||
      !guests ||
      !totalPrice ||
      !bookingId ||
      !roomName ||
      !numAdults ||
      !numChildren
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newBooking = new whatsappBooking({
      fullName,
      email,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      bookingId,
      roomName,
      numAdults,
      numChildren,
    });
    await newBooking.save();
    res.status(201).json({ message: "Booking created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create booking" });
  }
};

export default {
  createWhatsappBooking,
};
