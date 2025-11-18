import dotenv from "dotenv";
import connectDB from "../config/db";
import Category from "../models/Category";

dotenv.config();

interface CategoryData {
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  isDefault: boolean;
}

const incomeCategories: CategoryData[] = [
  { name: "Salary", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b5.png", isDefault: true },
  { name: "Freelance", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4bc.png", isDefault: true },
  { name: "Business", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3e2.png", isDefault: true },
  { name: "Investment", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4c8.png", isDefault: true },
  { name: "Dividends", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b0.png", isDefault: true },
  { name: "Rental Income", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3e0.png", isDefault: true },
  { name: "Interest", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b3.png", isDefault: true },
  { name: "Bonus", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f389.png", isDefault: true },
  { name: "Gift", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f381.png", isDefault: true },
  { name: "Refund", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4e6.png", isDefault: true },
  { name: "Commission", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4ca.png", isDefault: true },
  { name: "Pension", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4bc.png", isDefault: true },
  { name: "Social Security", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f46a.png", isDefault: true },
  { name: "Scholarship", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f393.png", isDefault: true },
  { name: "Lottery", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3b0.png", isDefault: true },
  { name: "Cashback", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b8.png", isDefault: true },
  { name: "Tips", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b4.png", isDefault: true },
  { name: "Royalties", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3b5.png", isDefault: true },
  { name: "Side Hustle", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4aa.png", isDefault: true },
  { name: "Alimony", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b2.png", isDefault: true },
  { name: "Child Support", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f476.png", isDefault: true },
  { name: "Government Benefits", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3db.png", isDefault: true },
  { name: "Insurance Claim", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4dc.png", isDefault: true },
  { name: "Sale of Assets", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f697.png", isDefault: true },
  { name: "Partnership Income", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f91d.png", isDefault: true },
  { name: "Consulting", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4dd.png", isDefault: true },
  { name: "Online Sales", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4f1.png", isDefault: true },
  { name: "Teaching", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3eb.png", isDefault: true },
  { name: "Coaching", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3c3.png", isDefault: true },
  { name: "Other Income", type: "INCOME", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b9.png", isDefault: true },
];

const expenseCategories: CategoryData[] = [
  { name: "Food & Dining", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f35d.png", isDefault: true },
  { name: "Groceries", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f6d2.png", isDefault: true },
  { name: "Transportation", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f68c.png", isDefault: true },
  { name: "Gas", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/26fd.png", isDefault: true },
  { name: "Shopping", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f6cd.png", isDefault: true },
  { name: "Bills & Utilities", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4e6.png", isDefault: true },
  { name: "Rent", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3e0.png", isDefault: true },
  { name: "Mortgage", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3e1.png", isDefault: true },
  { name: "Insurance", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4dc.png", isDefault: true },
  { name: "Healthcare", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f48a.png", isDefault: true },
  { name: "Entertainment", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3a5.png", isDefault: true },
  { name: "Travel", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f6eb.png", isDefault: true },
  { name: "Education", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f393.png", isDefault: true },
  { name: "Fitness", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3cb.png", isDefault: true },
  { name: "Personal Care", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f484.png", isDefault: true },
  { name: "Clothing", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f455.png", isDefault: true },
  { name: "Gifts & Donations", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f381.png", isDefault: true },
  { name: "Subscriptions", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4fa.png", isDefault: true },
  { name: "Phone & Internet", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4f1.png", isDefault: true },
  { name: "Taxes", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4c9.png", isDefault: true },
  { name: "Childcare", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f476.png", isDefault: true },
  { name: "Pet Care", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f436.png", isDefault: true },
  { name: "Home Maintenance", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f6a7.png", isDefault: true },
  { name: "Car Maintenance", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f697.png", isDefault: true },
  { name: "Bank Fees", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b3.png", isDefault: true },
  { name: "Legal Fees", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/2696.png", isDefault: true },
  { name: "Alcohol & Bars", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f37a.png", isDefault: true },
  { name: "Coffee & Cafes", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/2615.png", isDefault: true },
  { name: "Hobbies", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3a8.png", isDefault: true },
  { name: "Other Expense", type: "EXPENSE", icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b2.png", isDefault: true },
];

const seedCategories = async () => {
  try {
    await connectDB();
    console.log("🌱 Starting category seeding...");

    // Clear existing default categories
    await Category.deleteMany({ isDefault: true });
    console.log("🗑️  Cleared existing default categories");

    // Insert income categories
    const incomeResult = await Category.insertMany(incomeCategories);
    console.log(`✅ Inserted ${incomeResult.length} income categories`);

    // Insert expense categories
    const expenseResult = await Category.insertMany(expenseCategories);
    console.log(`✅ Inserted ${expenseResult.length} expense categories`);

    console.log(`\n🎉 Successfully seeded ${incomeResult.length + expenseResult.length} default categories!`);
    console.log(`   - Income: ${incomeResult.length} categories`);
    console.log(`   - Expense: ${expenseResult.length} categories`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();

