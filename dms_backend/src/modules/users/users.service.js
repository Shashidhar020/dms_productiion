import { findUserByIdAndCompany, findUsersByCompany } from '../../models/user.model.js';
import { AppError } from '../../shared/app-error.js';
import { getUserData} from "./users.repository.js";
export async function getUsersByCompany(companyId) {
  return findUsersByCompany(companyId);
}

export async function getUserById(userId, companyId) {
  const user = await findUserByIdAndCompany(userId, companyId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}


export const fetchUserData = async (auth) => {
  const user = await getUserData(auth);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};