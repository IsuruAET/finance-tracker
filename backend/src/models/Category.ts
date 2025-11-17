import mongoose, { Document, Schema } from "mongoose";

export type CategoryType = "INCOME" | "EXPENSE";

export interface ICategory extends Document {
  userId?: mongoose.Schema.Types.ObjectId;
  name: string;
  type: CategoryType;
  icon: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required(this: ICategory) {
        return !this.isDefault;
      },
    },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
      required: true,
    },
    icon: { type: String, default: "default-icon" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CategorySchema.index(
  { userId: 1, name: 1, type: 1 },
  { unique: true, partialFilterExpression: { isDefault: false } }
);
CategorySchema.index(
  { name: 1, type: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
