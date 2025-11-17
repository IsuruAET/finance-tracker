import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define the user interface
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  profileImageUrl?: string | null;
  accountInitializedDate: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define schema
const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: null },
    accountInitializedDate: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export model
const User = mongoose.model<IUser>("User", UserSchema);
export default User;
