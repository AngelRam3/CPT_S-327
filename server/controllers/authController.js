const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const createToken = (user) => {
    return jwt.sign(
        { email: user.email, id: user._id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

const test = (req, res) => res.json({ message: 'API is working!' });

//Register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name) return res.status(400).json({ error: 'Name is required' });
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        const hashedPassword = await hashPassword(password);
        const secret = speakeasy.generateSecret({ length: 20 });

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            twofaSecret: secret.base32,
        });

        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        return res.status(201).json({
            message: 'User registered successfully. Scan the QR code for 2FA setup.',
            qrCodeUrl,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// Login
const loginUser = async (req, res) => {
    try {
        const { email, password, totpCode } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ error: 'Invalid password' });

        if (!totpCode) {
            return res.status(400).json({ error: '2FA code required' });
        }

        const isValidTOTP = speakeasy.totp.verify({
            secret: user.twofaSecret,
            encoding: 'base32',
            token: totpCode,
        });

        if (!isValidTOTP) return res.status(400).json({ error: 'Invalid 2FA code' });

        const token = createToken(user);
        res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Fetch user profile
const getProfile = (req, res) => {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });

        res.json(user);
    });
};

// Logout user
const logout = (req, res) => {
    res.clearCookie('token').json({ message: 'Logged out successfully' });
};

module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile,
    logout,
};
