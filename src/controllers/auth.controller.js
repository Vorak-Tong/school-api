import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const User = db.User;

const SELECT =  process.env.JWT_SECRET || 'virak123';

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Login and registration operations
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Virak
 *               email:
 *                 type: string
 *                 example: virak@gmail.com
 *               password:
 *                 type: string
 *                 example: name@123$;
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already exists
 */

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) {
        return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user.id,
            email: user.email
        }
    });
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: virak@gmail.com
 *               password:
 *                 type: string
 *                 example: name@123$;
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */

export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if(!validPassword) return res.status(401).json({ message: "Invalid credentials" });

    // generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, SELECT, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, email: user.email } });
};

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all registered users (Protected)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 */

export const getAllUsers = async (req, res) => {
    const users = await User.findAll({
        attributes: ['id', 'name', 'email']
    });
    res.json(users);
}