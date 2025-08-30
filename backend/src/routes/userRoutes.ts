import express from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { userRegistrationSchema, userUpdateSchema } from '../models/userModel';

const router = express.Router();

// Public routes
router.post('/register', validate(userRegistrationSchema), UserController.register);
router.post('/login', UserController.login);
router.post('/refresh-token', UserController.refreshToken);

// Protected routes
router.use(authenticate);

router.get('/me', UserController.getCurrentUser);
router.put('/me', validate(userUpdateSchema), UserController.updateUser);
router.put('/me/password', UserController.updatePassword);
router.post('/logout', UserController.logout);

// Admin routes
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', validate(userUpdateSchema), UserController.updateUser);
router.put('/:id/password', UserController.updatePassword);
router.delete('/:id', UserController.deleteUser);

export default router;