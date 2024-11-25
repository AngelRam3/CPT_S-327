const User = require('../models/User');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const test = (req, res) => {
    res.json('test is working')
}

// Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if name is entered
        if (!name) {
            return res.json({
                error: 'Please enter your name'
            });
        }

        // Check if password is entered and meets length requirement
        if (!password || password.length < 6) {
            return res.json({
                error: 'Password is required and must be at least 6 characters long'
            });
        }

        // Check if email is already registered
        const exist = await User.findOne({ email });
        if (exist) {
            return res.json({
                error: 'Email is already in use'
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Generate 2FA secret using speakeasy
        const secret = speakeasy.generateSecret({ length: 20 });

        // Create a new user and save the 2FA secret
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            twofaSecret: secret.base32, // Save 2FA secret in the database
        });

        // Generate QR code for Google Authenticator to scan
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        return res.json({
            user,
            message: 'Registration successful. Scan the QR code with Google Authenticator to enable 2FA.',
            qrCodeUrl,  // Send the QR code URL to frontend for display
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred during registration' });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ error: 'No user found' });
        }

        const match = await comparePassword(password, user.password);
        if (match) {
            if (user.is2FAEnabled) {
                // User has 2FA enabled
                return res.json({
                    userId: user._id,
                    is2FAEnabled: true,
                });
            } else {
                // No 2FA enabled, return user data for regular login
                const token = jwt.sign({ email: user.email, id: user._id, name: user.name }, process.env.JWT_SECRET);
                res.cookie('token', token).json(user);
            }
        } else {
            return res.json({ error: 'Passwords do not match' });
        }
    } catch (error) {
        console.log(error);
    }
};

const getProfile =(req, res) => {
    const {token} = req.cookies;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
            if (err) throw err;
            res.json(user)
        })
    } else {
        res.json(null)
    }
}

//2FA
const verify2FA = async (req, res) => {
    const { userId, totp } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.json({ error: 'User not found' });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret, // Stored 2FA secret
            encoding: 'base32',
            token: totp,
        });

        if (verified) {
            const token = jwt.sign({ email: user.email, id: user._id, name: user.name }, process.env.JWT_SECRET);
            res.cookie('token', token).json({ success: true });
        } else {
            res.json({ success: false, error: 'Invalid 2FA code' });
        }
    } catch (error) {
        console.log(error);
        res.json({ error: 'An error occurred' });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};


module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile,
    logout,
};