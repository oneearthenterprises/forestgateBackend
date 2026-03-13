import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    trim: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  shortDescription: {
    type: String,
    default: ""
  },
  fullDescription: {
    type: String,
    default: ""
  },
  amenities: [{
    type: String
  }],
  images: [{
    url: String,
    public_id: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tag: {
    type: String,
    default: "Premium Stay"
  },
  videos: [{
    url: String,
    public_id: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const RoomLists = mongoose.model("RoomLists", roomSchema);
export default RoomLists;