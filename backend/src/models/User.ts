import { Schema, model } from 'mongoose';

// 1. Define the TypeScript interface representing a user document
interface IUser {
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'member'; // Roles for the business application
  createdAt: Date;
}

// 2. Create the Mongoose schema corresponding to the TypeScript interface
const userSchema = new Schema<IUser>({
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, // Prevents registering duplicate emails
    lowercase: true, 
    trim: true 
  },
  passwordHash: { 
    type: String, 
    required: [true, 'Password is required'] 
  },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'member'], 
    default: 'member' // Default role for new users
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 3. Export the Mongoose model
export const User = model<IUser>('User', userSchema);