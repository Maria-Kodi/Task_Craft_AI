import { Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get the logged-in user's profile
// @route   GET /api/users/me
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(`Error in getProfile: ${error}`);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// @desc    Update the logged-in user's profile (fullName, email)
// @route   PUT /api/users/me
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, email } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // If changing email, make sure no other account already uses it
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) {
        res.status(400).json({ message: 'This email is already in use' });
        return;
      }
      user.email = email;
    }

    if (fullName) user.fullName = fullName;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(`Error in updateProfile: ${error}`);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// @desc    Change the logged-in user's password
// @route   PUT /api/users/me/password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Please provide your current and new password' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: 'New password must be at least 8 characters' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(`Error in changePassword: ${error}`);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};

// @desc    Delete the logged-in user's account and all their tasks
// @route   DELETE /api/users/me
// @access  Private
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Task.deleteMany({ user: req.userId });
    await User.findByIdAndDelete(req.userId);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(`Error in deleteAccount: ${error}`);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};