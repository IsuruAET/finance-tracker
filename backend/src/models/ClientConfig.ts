import mongoose, { Document, Schema } from "mongoose";

export interface IClientConfig extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  defaultWalletId?: mongoose.Schema.Types.ObjectId | null;
  hasInitializedWallets?: boolean;
  walletInitializationDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ClientConfigSchema = new Schema<IClientConfig>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    defaultWalletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      default: null,
    },
    hasInitializedWallets: {
      type: Boolean,
      default: false,
    },
    walletInitializationDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const ClientConfig = mongoose.model<IClientConfig>(
  "ClientConfig",
  ClientConfigSchema
);
export default ClientConfig;

