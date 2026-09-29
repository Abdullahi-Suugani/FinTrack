import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
export async function overview(req, res, next) {
  try {
    const [totalUsers, totalTransactions, stats, categories] =
      await Promise.all([
        User.countDocuments(),
        Transaction.countDocuments(),
        Transaction.aggregate([
          { $group: { _id: "$type", total: { $sum: "$amount" } } },
        ]),
        Transaction.aggregate([
          { $match: { type: "expense" } },
          { $group: { _id: "$category", total: { $sum: "$amount" } } },
          { $sort: { total: -1 } },
          { $limit: 5 },
        ]),
      ]);
    const totals = Object.fromEntries(stats.map((x) => [x._id, x.total]));
    res.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        totalIncome: totals.income || 0,
        totalExpenses: totals.expense || 0,
        topSpendingCategories: categories.map((x) => ({
          category: x._id,
          total: x.total,
        })),
      },
    });
  } catch (e) {
    next(e);
  }
}
