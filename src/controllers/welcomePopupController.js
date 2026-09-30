import WelcomePopup from '../models/welcomePopup.js';
import cloudinary from '../config/cloudinary.js';

// Get the popup configuration
export const getPopupData = async (req, res) => {
  try {
    let popup = await WelcomePopup.findOne();
    if (!popup) {
      // Create default if none exists
      popup = await WelcomePopup.create({});
    }
    res.status(200).json({ success: true, data: popup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update the popup configuration
export const updatePopupData = async (req, res) => {
  try {
    let popup = await WelcomePopup.findOne();
    if (!popup) {
      popup = new WelcomePopup();
    }

    const {
      title,
      description,
      isActive,
      removeImage,
    } = req.body;

    if (title !== undefined) popup.title = title;
    if (description !== undefined) popup.description = description;
    if (isActive !== undefined) popup.isActive = isActive === 'true' || isActive === true;

    // Handle image deletion if requested
    if (removeImage === 'true' || removeImage === true) {
      popup.imageUrl = '';
    }

    // Handle image upload if a file was provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'welcome_popup',
          resource_type: 'auto',
        });
        popup.imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary Upload Error:', uploadError);
        return res.status(500).json({ success: false, message: 'Failed to upload image' });
      }
    }

    await popup.save();
    res.status(200).json({ success: true, message: 'Welcome popup updated correctly!', data: popup });
  } catch (error) {
    console.error('Update Popup Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete the popup image directly
export const deletePopupImage = async (req, res) => {
  try {
    let popup = await WelcomePopup.findOne();
    if (!popup) {
      popup = new WelcomePopup();
    }
    popup.imageUrl = '';
    await popup.save();
    res.status(200).json({ success: true, message: 'Welcome popup image deleted successfully!', data: popup });
  } catch (error) {
    console.error('Delete Popup Image Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
