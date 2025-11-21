import { Response } from "express";
import ClientConfig from "../models/ClientConfig";
import Wallet from "../models/Wallet";
import { AuthenticatedRequest } from "../types/express";

// Get client configuration
export const getClientConfig = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    let config = await ClientConfig.findOne({ userId });

    // If config doesn't exist, create one with null values
    if (!config) {
      config = new ClientConfig({
        userId,
        defaultWalletId: null,
      });
      await config.save();
    }

    // Get earliest wallet initialization date
    const earliestWallet = await Wallet.findOne({ userId })
      .sort({ initializedAt: 1 })
      .select("initializedAt");

    const earliestWalletDate = earliestWallet?.initializedAt || null;

    // Auto-update flag for existing users who have wallets but flag is not set
    if (earliestWallet && !config.hasInitializedWallets) {
      config.hasInitializedWallets = true;
      config.walletInitializationDate = earliestWalletDate;
      await config.save();
    }

    return res.status(200).json({
      defaultWalletId: config.defaultWalletId || null,
      earliestWalletDate: earliestWalletDate,
      hasInitializedWallets: config.hasInitializedWallets || false,
      walletInitializationDate: config.walletInitializationDate || null,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error fetching client config", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Update client configuration
export const updateClientConfig = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { defaultWalletId } = req.body || {};

    // Validate wallet ID if provided
    if (defaultWalletId) {
      const wallet = await Wallet.findOne({
        _id: defaultWalletId,
        userId,
      });
      if (!wallet) {
        return res.status(400).json({
          message: "Invalid default wallet ID",
        });
      }
    }

    // Update or create config
    let config = await ClientConfig.findOne({ userId });

    if (!config) {
      config = new ClientConfig({
        userId,
        defaultWalletId: defaultWalletId || null,
      });
    } else {
      config.defaultWalletId = defaultWalletId || null;
    }

    await config.save();

    // Get earliest wallet initialization date
    const earliestWallet = await Wallet.findOne({ userId })
      .sort({ initializedAt: 1 })
      .select("initializedAt");

    const earliestWalletDate = earliestWallet?.initializedAt || null;

    return res.status(200).json({
      defaultWalletId: config.defaultWalletId || null,
      earliestWalletDate: earliestWalletDate,
      hasInitializedWallets: config.hasInitializedWallets || false,
      walletInitializationDate: config.walletInitializationDate || null,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error updating client config", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

