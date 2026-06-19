import { Router } from 'express';
// import { asyncHandler } from '../../middlewares/async-handler.js';
// import { authorize } from '../../middlewares/authorization.js';
// import { verifyJwt } from '../auth/auth.middleware.js';
import {getUserData } from './users.controller.js';
import authenticate from '../../shared/middelware/authenticate.middleware.js';

const userRoutes = Router();

// userRoutes.use(verifyJwt);
// userRoutes.get('/', authorize('read', 'User'), asyncHandler(getUsers));
// userRoutes.get('/:id', authorize('read', 'User'), asyncHandler(getUser));
userRoutes.get('/data',authenticate,getUserData)
export { userRoutes };
