import mongoose from 'mongoose';

const welcomePopupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Book entire rental\nunit in Naggar,\nHimachal Pradesh',
    },
    description: {
      type: String,
      default: 'Welcome to this stunning sanctuary in the heart of Naggar - Manali, Himachal. Located at a quiet crossroads, this cozy residence is the perfect combination of comfort and style.',
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540346941493-3f8d5d87e169?auto=format&fit=crop&q=80&w=1200',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('WelcomePopup', welcomePopupSchema);
