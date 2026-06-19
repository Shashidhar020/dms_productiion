import { getUserById, getUsersByCompany, fetchUserData } from './users.service.js';

export async function getUsers(request, response) {
  const users = await getUsersByCompany(request.user.company_id);

  return response.status(200).json({
    success: true,
    data: users
  });
}

export async function getUser(request, response) {
  const user = await getUserById(request.params.id, request.user.company_id);

  return response.status(200).json({
    success: true,
    data: user
  });
}

export const getUserData = async (req, res) => {
  try {
    const auth = req.auth

    const user = await fetchUserData(auth);

    return res.status(200).json({
      success: true,
      ProfileData: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};