const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    uniqueId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema); // Create a model

//Skin
const skinDonationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },

    // Communication Preferences
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },

    // Tissue and Health Information
    tissueType: {
        type: String,
        enum: ['Skin'],
        required: true
    },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    tissueCondition: {
        type: String,
        required: true
    },
    availabilityDate: {
        type: Date,
        required: true
    },

    // Verification
    documentName: {
        type: String,
        required: true
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});
//Blood
const bloodDonationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },

    // Communication Preferences
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },

    // Tissue and Health Information
    tissueType: {
        type: String,
        enum: ['Blood'],
        required: true
    },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    tissueCondition: {
        type: String,
        required: true
    },
    availabilityDate: {
        type: Date,
        required: true
    },

    // Verification
    documentName: {
        type: String,
        required: true
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

//Bone Marrow
const boneMarrowDonationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },

    // Communication Preferences
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },

    // Tissue and Health Information
    tissueType: {
        type: String,
        enum: ['Bone Marrow'],
        required: true
    },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    tissueCondition: {
        type: String,
        required: true
    },
    availabilityDate: {
        type: Date,
        required: true
    },

    // Verification
    documentName: {
        type: String,
        required: true
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});
//Kidney
const kidneyDonationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },

    // Communication Preferences
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },

    // Tissue and Health Information
    tissueType: {
        type: String,
        enum: ['Kidney'],
        required: true
    },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    tissueCondition: {
        type: String,
        required: true
    },
    availabilityDate: {
        type: Date,
        required: true
    },

    // Verification
    documentName: {
        type: String,
        required: true
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const donationSchemaExtension = {
    notifications: [{
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel'  // or whatever model stores requesters
        },
        message: String,
        responseStatus: {
            type: String,
            default: 'Pending'
        }
    }]
    
};

skinDonationSchema.add(donationSchemaExtension);
bloodDonationSchema.add(donationSchemaExtension);
boneMarrowDonationSchema.add(donationSchemaExtension);
kidneyDonationSchema.add(donationSchemaExtension);

//create models

const SkinDonation = mongoose.model('SkinDonation', skinDonationSchema);
const BloodDonation = mongoose.model('BloodDonation', bloodDonationSchema);
const BoneMarrowDonation = mongoose.model('BoneMarrowDonation', boneMarrowDonationSchema);
const KidneyDonation = mongoose.model('KidneyDonation', kidneyDonationSchema);




//request form schema


    const TissueRequestSchema = new mongoose.Schema({
        fullName: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        bloodType: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            required: true,
        },
        tissueType: {
            type: String,
            enum: ['Skin', 'Blood', 'Bone Marrow', 'Kidney'],
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        doctorRecommendation: {
            type: String, // Path to the uploaded file
            required: true,
        },
        condition: {
            type: String,
            required: true,
        },
        dateNeeded: {
            type: Date,
            required: true,
        },
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to User schema // The ID of the person making the request
            required: true,
        },
        donorModel: {
            type: String,
            enum: ['SkinDonation', 'BloodDonation', 'BoneMarrowDonation', 'KidneyDonation'],
            required: true
        },
        donorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'donorModel' // Dynamically reference the correct model
        },
        
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending',
        },
        responseMessage: String,
    }, { timestamps: true });
    

// Export model
const TissueRequest = mongoose.model('TissueRequest', TissueRequestSchema);

module.exports = {  User,SkinDonation, BloodDonation, BoneMarrowDonation, KidneyDonation,TissueRequest };

