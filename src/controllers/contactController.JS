import ContactUs from "../models/contactus.js";




const createContext = async (req, res) => {
    try {
        const { fullName, email, message } = req.body;
        if (!fullName || !email || !message) {
            return res.status(400).json({
                message: "Please fill all fields"
            })
        }
        const contact = await ContactUs.create({
            fullName,
            email,
            message
        })
        return res.status(201).json({
            message: "Contact created successfully",
            contact
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        })
    }
}



// GET ALL MESSAGES (Admin)
const getAllContacts = async (req, res) => {

    try {
        const contact = await ContactUs.find().sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Contacts fetched successfully",
            contact
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        })
    }
}



export default {
    createContext,
    getAllContacts
}
