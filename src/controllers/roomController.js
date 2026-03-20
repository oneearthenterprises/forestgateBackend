import RoomLists from "../models/room.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const createRoom = async (req, res) => {
    let tempFiles = []; // Track temporary files for cleanup

    try {
        const {
            roomName,
            pricePerNight,
            shortDescription,
            fullDescription,
            amenities,
            tag,
            maxAdults,
            maxChildren
        } = req.body;

        // Validate required fields
        if (!roomName || !pricePerNight) {
            return res.status(400).json({
                message: "Room name and price per night are required"
            });
        }

        // Upload images to Cloudinary
        let imageUrls = [];
        if (req.files?.images) {
            try {
                const images = Array.isArray(req.files.images)
                    ? req.files.images
                    : [req.files.images];

                for (const file of images) {
                    tempFiles.push(file.path); // Track for cleanup

                    // Validate file type
                    if (!file.mimetype.startsWith('image/')) {
                        return res.status(400).json({
                            message: "Only image files are allowed for images"
                        });
                    }

                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "forestgate/rooms/images",
                    });
                    imageUrls.push({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                }
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);

                // Clean up temp files
                tempFiles.forEach(filePath => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });

                return res.status(500).json({
                    message: "Failed to upload images to Cloudinary",
                    error: uploadError.message
                });
            }
        }

        // Upload videos to Cloudinary
        let videoUrls = [];
        if (req.files?.videos) {
            try {
                const videos = Array.isArray(req.files.videos)
                    ? req.files.videos
                    : [req.files.videos];

                for (const file of videos) {
                    tempFiles.push(file.path); // Track for cleanup

                    if (!file.mimetype.startsWith('video/')) {
                        return res.status(400).json({
                            message: "Only video files are allowed for videos"
                        });
                    }

                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "forestgate/rooms/videos",
                        resource_type: "video",
                    });
                    videoUrls.push({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                }
            } catch (uploadError) {
                console.error("Video upload error:", uploadError);

                // Clean up temp files
                tempFiles.forEach(filePath => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });

                return res.status(500).json({
                    message: "Failed to upload videos to Cloudinary",
                    error: uploadError.message
                });
            }
        }

        // Parse amenities
        const amenitiesArray = amenities
            ? (Array.isArray(amenities) ? amenities : amenities.split(',').map(item => item.trim()))
            : [];

        // Create room
        const room = await RoomLists.create({
            roomName,
            pricePerNight,
            shortDescription: shortDescription || "",
            fullDescription: fullDescription || "",
            amenities: amenitiesArray,
            tag: tag || "Premium Stay",
            maxAdults: maxAdults || 2,
            maxChildren: maxChildren || 2,
            images: imageUrls,
            videos: videoUrls
        });

        // Clean up temporary files after successful upload
        tempFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        return res.status(201).json({
            message: "Room created successfully",
            room
        });
    } catch (error) {
        // Clean up on error
        tempFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        console.log("Create room error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// Get all rooms
const getAllRooms = async (req, res) => {
    try {
        const rooms = await RoomLists.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: "Rooms fetched successfully",
            total: rooms.length,
            rooms,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get single room
const getSingleRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await RoomLists.findById(id);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.status(200).json({
            message: "Room fetched successfully",
            room,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Update room
const updateRoom = async (req, res) => {
    let tempFiles = [];

    try {
        const { id } = req.params;

        const room = await RoomLists.findById(id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Upload NEW images
        let newImageUrls = [];
        if (req.files?.images) {
            for (const file of req.files.images) {
                tempFiles.push(file.path);

                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "forestgate/rooms/images",
                });
                newImageUrls.push({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
        }

        // Upload NEW videos
        let newVideoUrls = [];
        if (req.files?.videos) {
            for (const file of req.files.videos) {
                tempFiles.push(file.path);

                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "forestgate/rooms/videos",
                    resource_type: "video",
                });
                newVideoUrls.push({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
        }

        // Update fields
        room.roomName = req.body.roomName ?? room.roomName;
        room.pricePerNight = req.body.pricePerNight ?? room.pricePerNight;
        room.shortDescription = req.body.shortDescription ?? room.shortDescription;
        room.fullDescription = req.body.fullDescription ?? room.fullDescription;
        room.tag = req.body.tag ?? room.tag;
        room.maxAdults = req.body.maxAdults ?? room.maxAdults;
        room.maxChildren = req.body.maxChildren ?? room.maxChildren;

        if (req.body.amenities) {
            room.amenities = Array.isArray(req.body.amenities)
                ? req.body.amenities
                : req.body.amenities.split(',').map(item => item.trim());
        }

        // Append new media
        if (newImageUrls.length > 0) {
            room.images.push(...newImageUrls);
        }

        if (newVideoUrls.length > 0) {
            room.videos.push(...newVideoUrls);
        }

        await room.save();

        // Clean up temp files
        tempFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        res.status(200).json({
            message: "Room updated successfully",
            room,
        });
    } catch (error) {
        // Clean up on error
        tempFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        console.log("Update room error:", error);
        res.status(500).json({
            message: error.message,
        });
    }
};

// Delete room with Cloudinary cleanup
const deleteRoom = async (req, res) => {
    try {
        const room = await RoomLists.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Delete images from Cloudinary
        if (room.images && room.images.length > 0) {
            for (const image of room.images) {
                if (image.public_id) {
                    try {
                        await cloudinary.uploader.destroy(image.public_id);
                    } catch (cloudinaryError) {
                        console.error("Error deleting image from Cloudinary:", cloudinaryError);
                    }
                }
            }
        }

        // Delete videos from Cloudinary
        if (room.videos && room.videos.length > 0) {
            for (const video of room.videos) {
                if (video.public_id) {
                    try {
                        await cloudinary.uploader.destroy(video.public_id, {
                            resource_type: "video"
                        });
                    } catch (cloudinaryError) {
                        console.error("Error deleting video from Cloudinary:", cloudinaryError);
                    }
                }
            }
        }

        // Delete room from database
        await RoomLists.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Room deleted successfully",
        });
    } catch (error) {
        console.error("Delete room error:", error);
        res.status(500).json({
            message: error.message,
        });
    }
};

// Delete specific image from room
const deleteRoomImage = async (req, res) => {
    try {
        const { roomId, imageId } = req.params;

        const room = await RoomLists.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const imageIndex = room.images.findIndex(img => img._id.toString() === imageId);
        if (imageIndex === -1) {
            return res.status(404).json({ message: "Image not found" });
        }

        const image = room.images[imageIndex];

        // Delete from Cloudinary
        if (image.public_id) {
            try {
                await cloudinary.uploader.destroy(image.public_id);
            } catch (cloudinaryError) {
                console.error("Error deleting image from Cloudinary:", cloudinaryError);
            }
        }

        // Remove from array
        room.images.splice(imageIndex, 1);
        await room.save();

        res.status(200).json({
            message: "Image deleted successfully",
            room,
        });
    } catch (error) {
        console.error("Delete image error:", error);
        res.status(500).json({
            message: error.message,
        });
    }
};

// Delete specific video from room
const deleteRoomVideo = async (req, res) => {
    try {
        const { roomId, videoId } = req.params;

        const room = await RoomLists.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const videoIndex = room.videos.findIndex(vid => vid._id.toString() === videoId);
        if (videoIndex === -1) {
            return res.status(404).json({ message: "Video not found" });
        }

        const video = room.videos[videoIndex];

        // Delete from Cloudinary
        if (video.public_id) {
            try {
                await cloudinary.uploader.destroy(video.public_id, {
                    resource_type: "video"
                });
            } catch (cloudinaryError) {
                console.error("Error deleting video from Cloudinary:", cloudinaryError);
            }
        }

        // Remove from array
        room.videos.splice(videoIndex, 1);
        await room.save();

        res.status(200).json({
            message: "Video deleted successfully",
            room,
        });
    } catch (error) {
        console.error("Delete video error:", error);
        res.status(500).json({
            message: error.message,
        });
    }
};

export default {
    createRoom,
    getAllRooms,
    getSingleRoom,
    updateRoom,
    deleteRoom,
    deleteRoomImage,
    deleteRoomVideo
};