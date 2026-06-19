
import express from 'express';

import { ManufacturerController} from './manufacturer.controller.js';

import authenticate from '../../shared/middelware/authenticate.middleware.js';

const router = express.Router();

/**
 * SEND OTP
 */
router.post('/send-otp',ManufacturerController.sendOTP);

/**
 * VERIFY OTP
 */
router.post('/verify-otp',ManufacturerController.verifyOTP);

/**
 * ONBOARD
 */
router.post('/onboard',ManufacturerController.onboard);

/**
 * DISTRIBUTORS
 */
router.get('/distributors',authenticate,ManufacturerController.getDistributor);

export default router;