import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './user.js';
import deviceRoutes from './device.js';
import notificationRoutes from './notification.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/devices', deviceRoutes);
router.use('/notifications', notificationRoutes);

export default router;
