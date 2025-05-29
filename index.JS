const express=require("express");//import express
const app=express();//app as instance
const mongoose=require("mongoose");//import mongoose module to connect with mongobd
const bodyParser = require('body-parser');//handle middleware like parse the form data
const session = require("express-session");//import user session
const {  User,SkinDonation, BloodDonation, BoneMarrowDonation, KidneyDonation,TissueRequest} = require("./models/Schemas.js");
const upload = require('./models/multerConfig'); // Multer configuration
const bcrypt = require('bcryptjs');
const Tesseract = require('tesseract.js');



//Middleware
app.set('view engine', 'ejs');// Set EJS as the view engine
app.set("views", "./views"); 
app.use(express.urlencoded({ extended: true }));// Middleware to parse form data
app.use(bodyParser.json());
// Connect to MongoDB
require('dotenv').config();
const uri = process.env.MONGODB_URI;


mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

.then(() => console.log('MongoDB connected successfully!'))
.catch((err) => console.error('MongoDB connection error:', err));

// Configure session
app.use(
    session({
        secret: "Tissue!!!!", //strong secret key
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // Use `true` only for HTTPS
    })
);


app.use('/uploads', express.static('uploads')); // Serve uploaded files statically
app.use(express.static("public"));//to make static files (e.g., HTML, CSS, JavaScript, images) accessible to the client.


//=====================
// ROUTES
//=====================

app.get('/', (req, res) => {
    res.redirect('/home'); // or res.render('home'); if you prefer direct rendering
});

app.get('/home', (req, res) => {
    res.render('home'); 
});
app.get('/signup', (req, res) => {
    res.render('signup'); 
});
app.get('/login', (req, res) => {
    res.render('login'); 
});
app.get('/firstpage', (req, res) => {
    res.render('firstPage'); 
});
app.get('/myrequest', (req, res) => {
    res.render('myrequest'); // Ensure 'myrequest' is in the 'views' folder
});
app.get('/AllDonate', (req, res) => {
    res.render('AllDonate'); 
});
app.get('/about', (req, res) => {
    res.render('about'); 
});
app.get('/contact', (req, res) => {
    res.render('contact'); 
});


app.post("/signup", async (req, res) => {
    const { name, uniqueId, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.send("Passwords do not match! Please try again.");
    }

    try {
        const existingUser = await User.findOne({ uniqueId });
        if (existingUser) {
            return res.send(`<p>User already exists. Please <a href="/login">login here</a>.</p>`);
        }

        // 🔒 Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

        const newUser = new User({
            name,
            uniqueId,
            password: hashedPassword, // Store hashed password
        });

        await newUser.save();

        return res.render("login", { message: "Signup successful! Please login." });
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).send("Server error during signup.");
    }
});


// Login Route
app.post("/login", async (req, res) => {
    const { uniqueId, password } = req.body;
    try {
        // Check if uniqueId exists
        const user = await User.findOne({ uniqueId });
        if (!user) {
            res.render("signup", { message: "User not found! Please signup." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            // Start a session
            req.session.userId = user.uniqueId;
            req.session.userName = user.name;
            res.render("firstPage",{ userName: user.name,userId :user.uniqueId });//pass to first page
        } else {
            res.send("Invalid password. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Server error during login.");
    }
});
//myrequest post
app.post('/submit', async (req, res) => {
    // Extract data from the request body
    const { fullName, age, address, phoneNumber, email, tissueType, bloodType, tissueCondition, availabilityDate, documentName, donorId } = req.body;

    // Verify the logged-in user through the session
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized: Please log in first.');
    }

    // Ensure the donorId matches the logged-in user's uniqueId
    if (req.session.userId !== donorId) {
        return res.status(403).send('Forbidden: You can only submit a donation form for your own account.<a href="/myrequest">Back</a>');
    }

    try {
        // Fetch the user based on the session and verify the fullName
        const user = await User.findOne({ uniqueId: req.session.userId });
        if (!user || user.name !== fullName) {
            return res.status(400).send('Donor ID and Full Name do not match the logged-in user.<a href="/myrequest">Back</a>');
        }

        // Select the appropriate model based on tissueType
        let DonationModel;
        switch (tissueType) {
            case 'Skin':
                DonationModel = SkinDonation;
                break;
            case 'Blood':
                DonationModel = BloodDonation;
                break;
            case 'Bone Marrow':
                DonationModel = BoneMarrowDonation;
                break;
            case 'Kidney':
                DonationModel = KidneyDonation;
                break;
            default:
                return res.status(400).send('Invalid tissue type.');
        }

        // Create a new donation record
        const newDonation = new DonationModel({
            fullName,
            age,
            address,
            phoneNumber,
            email,
            tissueType,
            bloodType,
            tissueCondition,
            availabilityDate,
            documentName,
            donorId: user._id, // Store the MongoDB ObjectId as donorId
        });

        // Save the new donation record to the database
        await newDonation.save();

        // Respond with success
        res.status(200).send('Donation details submitted successfully!<a href="/firstPage">Back to firstPage</a>');
    } catch (error) {
        console.error('Error saving donation:', error);
        res.status(500).send('An error occurred while submitting your donation details.');
    }
});

//route of all donation
app.get('/donations/:tissueType', async (req, res) => {
    const { tissueType } = req.params;
    
    let DonationModel;

    // Dynamically select the donation model based on tissue type
    switch(tissueType) {
        case 'skin':
            DonationModel = SkinDonation;
            break;
        case 'blood':
            DonationModel = BloodDonation;
            break;
        case 'boneMarrow':
            DonationModel = BoneMarrowDonation;
            break;
        case 'kidney':
            DonationModel = KidneyDonation;
            break;
        default:
            return res.status(400).send('Invalid tissue type');
    }

    try {
        const donations = await DonationModel.find();
        res.render('EachTissue', { tissueType, donations });
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).send('An error occurred while fetching the donations.');
    }
});


//mydonation route

app.get('/myDonations', async (req, res) => {
    // Verify the logged-in user through the session
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized: Please log in first.');
    }

    try {
        // Fetch the user's ObjectId based on their uniqueId
        const user = await User.findOne({ uniqueId: req.session.userId }); 
        if (!user) {
            return res.status(404).send('User not found.');
        }

        const donorId = user._id; // Use the ObjectId from the `User` document

        // Retrieve all donations made by the logged-in user and populate notifications' requestId
        const skinDonations = await SkinDonation.find({ donorId }).populate({
            path: 'notifications.requestId',
            model: 'TissueRequest'
        });
        const bloodDonations = await BloodDonation.find({ donorId }).populate({
            path: 'notifications.requestId',
            model: 'TissueRequest'
        });
        const boneMarrowDonations = await BoneMarrowDonation.find({ donorId }).populate({
            path: 'notifications.requestId',
            model: 'TissueRequest'
        });
        const kidneyDonations = await KidneyDonation.find({ donorId }).populate({
            path: 'notifications.requestId',
            model: 'TissueRequest'
        });

        // Combine all donations into a single array
        const allDonations = [
            ...skinDonations.map(donation => ({ ...donation.toObject(), type: 'Skin' })),
            ...bloodDonations.map(donation => ({ ...donation.toObject(), type: 'Blood' })),
            ...boneMarrowDonations.map(donation => ({ ...donation.toObject(), type: 'Bone Marrow' })),
            ...kidneyDonations.map(donation => ({ ...donation.toObject(), type: 'Kidney' })),
        ];

        // Render the donations page with populated requests
        res.render('myDonations', { donations: allDonations, userName: req.session.userName });
    } catch (error) {
        console.error('Error fetching user donations:', error);
        res.status(500).send('An error occurred while fetching your donations.');
    }
});



//logout
app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return res.status(500).send("An error occurred while logging out.");
        }
        // Redirect to the login page after logout
        res.redirect('/home');
    });
});

//route to get requestForm
app.get('/requestForm', (req, res) => {
    const { fullName, age, address, bloodType, tissueCondition, availabilityDate, donorId } = req.query;  // Use req.query instead of req.body
    res.render('requestForm', {
        fullName,
        age,
        address,
        bloodType,
        tissueCondition,
        availabilityDate,
        donorId // Pass donorId to the form
    });
});



// Route to handle request form submission

const tissueModelMap = {
    'Skin': SkinDonation,
    'Blood': BloodDonation,
    'Bone Marrow': BoneMarrowDonation,
    'Kidney': KidneyDonation
};



// Route to handle request form submission
app.post('/submitRequest', upload.single('doctorRecommendation'), async (req, res) => {
    try {
        const { fullName, age, address, phone, email, bloodType, tissueType, reason, condition, dateNeeded, requestId, donorId } = req.body;

        // Validate donor ID
        if (!donorId || !mongoose.Types.ObjectId.isValid(donorId)) {
            return res.status(400).send('Invalid or missing donor ID.');
        }

        // Handle file upload and check for doctor recommendation
        const doctorRecommendation = req.file ? req.file.filename : null;
        if (!doctorRecommendation) {
            return res.status(400).send('Doctor recommendation file is required.');
        }

       

        // Check if the user is logged in
        if (!req.session.userId) {
            return res.status(401).send('Unauthorized: Please log in first.');
        }

        const user = await User.findOne({ uniqueId: req.session.userId });
        if (!user) {
            return res.status(400).send('Logged-in user not found.');
        }

        // Ensure the request is for the logged-in user's account
        if (user.uniqueId !== requestId) {
            return res.status(403).send('You can only submit a request for your own account.');
        }

        // Validate the full name
        if (user.name !== fullName) {
            return res.status(400).send('The provided Full Name or ID does not match the logged-in user.');
        }

        // Find the correct donor model based on tissue type
const donorModel = tissueModelMap[tissueType];

// ✅ First, find the donor
const donor = await donorModel.findOne({ donorId });
if (!donor) {
    return res.status(400).send(`Donor has not registered for ${tissueType} donation.`);
}

// ✅ Then, push the notification
donor.notifications.push({
    requestId: user._id,
    message: `New request from ${fullName}.`,
    responseStatus: "Pending"
});

// ✅ Save the donor with updated notifications
await donor.save();


        // OCR to validate document content
        const relevantKeywords = ["kidney", "skin", "bone marrow", "blood"];
        const imagePath = req.file ? req.file.path : null;

        if (!imagePath) {
            return res.status(400).send('Doctor recommendation image is missing.');
        }

        Tesseract.recognize(imagePath, 'eng')
            .then(({ data: { text } }) => {
                const extractedTextLower = text.toLowerCase();
                const isRelevant = relevantKeywords.some(keyword => extractedTextLower.includes(keyword));

                if (isRelevant) {
                    // Create and save the tissue request
                    const tissueRequest = new TissueRequest({
                        fullName,
                        age,
                        address,
                        phone,
                        email,
                        bloodType,
                        tissueType,
                        reason,
                        doctorRecommendation,
                        condition,
                        dateNeeded,
                        requestId: user._id,
                        donorModel: donorModel.modelName,
                        donorId: donor._id
                    });

                    tissueRequest.save()
                        .then(() => {
                            req.session.successMessage = "Submitted successfully!";
                            res.redirect('/myRequests');
                            return; // Return to prevent further execution
                        })
                        .catch(err => {
                            console.error(err);
                            req.session.successMessage = "Error saving data!";
                            res.redirect('/myRequests');
                            return; // Return to prevent further execution
                        });
                } else {
                    req.session.successMessage = "Content is not relevant. Form not submitted!";
                    res.redirect('/myRequests');
                    return; // Return to prevent further execution
                }
            })
            .catch(err => {
                console.error(err);
                req.session.successMessage = "Error processing the image!";
                res.redirect('/myRequests');
                return; // Return to prevent further execution
            });

                // Send Notification to the Donor
                await donorModel.findByIdAndUpdate(donor._id, {
                    $push: {
                        notifications: {
                            requestId: user._id,
                            message: `Request from ${fullName}.`,
                            responseStatus: 'Pending'
                        }
                    }
                });
        
            } catch (error) {
                console.error("Error in submitRequest:", error);
                res.status(500).send("Internal Server Error");
            }
        });
        

// Route to handle my request
app.get('/myRequests', async (req, res) => {
    // Ensure the user is logged in
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized: Please log in first.');
    }

    try {
        // Find the logged-in user
        const user = await User.findOne({ uniqueId: req.session.userId });
        if (!user) {
            return res.status(404).send('User not found.');
        }

        const requestId = user._id; // Use the ObjectId from the `User` document

        // Fetch all tissue requests and populate donor details (name, address, age)
        const tissueRequests = await TissueRequest.find({ requestId })
            .populate('donorId', 'name address age') // Populate donor details
            .exec();

        // Log the populated tissueRequests to check if donorId is populated correctly
        console.log(tissueRequests); // Should show the donor details inside the `donorId`

        if (tissueRequests.length === 0) {
            return res.status(404).send('No requests found for this user.');
        }

        // Render the page with donor details
        res.render('myRequests', { userName: req.session.userName, tissueRequests });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving your requests.');
    }
});

//route to donor detail
app.get('/donor/:id/details', async (req, res) => {
    try {
        const donorId = req.params.id;
        console.log("Fetching donor ID:", donorId);

        // List of all tissue donation models
        const donationTypes = [SkinDonation, BloodDonation, BoneMarrowDonation, KidneyDonation];

        let donor = null;

        for (let DonationModel of donationTypes) {
            donor = await DonationModel.findById(donorId);
            if (donor) break; // Stop searching if found
        }

        if (!donor) {
            return res.status(404).send('Donor not found in any tissue donation records.');
        }

        res.render('donorDetails', { donor });
    } catch (error) {
        console.error('Error fetching donor details:', error);
        res.status(500).send('An error occurred.');
    }
});


//Accepted
app.post('/requests/:id/accept', async (req, res) => {
    try {
        const requestId = req.params.id;

        // Update the request status in TissueRequest model
        const updatedRequest = await TissueRequest.findByIdAndUpdate(
            requestId,
            { status: 'Accepted' },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).send('Request not found.');
        }

        // Redirect to the request details page after accepting
        res.redirect(`/request/${requestId}/details`);
    } catch (error) {
        console.error('Error accepting request:', error);
        res.status(500).send('An error occurred.');
    }
});

//requester detail after acceptance
app.get('/request/:id/details', async (req, res) => {
    try {
        const requestId = req.params.id;

        // Fetch request details
        const request = await TissueRequest.findById(requestId);

        if (!request) {
            return res.status(404).send('Request not found.');
        }

        // Render the details page (Make sure 'requestDetails.ejs' exists)
        res.render('requestDetails', { request });
    } catch (error) {
        console.error('Error fetching request details:', error);
        res.status(500).send('An error occurred.');
    }
});


//setup server on port 8000
const PORT =  8000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
