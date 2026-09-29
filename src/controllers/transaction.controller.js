import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
const out = (t) => ({
  ...t.toObject(),
  id: t._id.toString(),
  amount: Number(t.amount),
});
export async function create(req, res, next) {
  try {
    const t = await Transaction.create({ ...req.body, user: req.user._id });
    res
      .status(201)
      .json({
        success: true,
        message: "Transaction created successfully",
        data: out(t),
      });
  } catch (e) {
    next(e);
  }
}
export async function list(req, res, next) {
  try {
    const { page, limit, type, category, search, startDate, endDate } =
      req.validatedQuery || req.query;
    const where = {
      user: req.user._id,
      ...(type && { type }),
      ...(category && { category }),
      ...(search && { title: new RegExp(search, "i") }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { $gte: startDate }),
              ...(endDate && { $lte: endDate }),
            },
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      Transaction.find(where)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments(where),
    ]);
    res.json({
      success: true,
      data: items.map(out),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    next(e);
  }
}
export async function summary(req, res, next) {
  try {
    const month = (req.validatedQuery || req.query).month || new Date().toISOString().slice(0, 7),
      start = new Date(`${month}-01`),
      end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const rows = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: start, $lt: end },
        },
      },
      {
        $facet: {
          totals: [{ $group: { _id: "$type", total: { $sum: "$amount" } } }],
          categories: [
            { $match: { type: "expense" } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $project: { _id: 0, category: "$_id", total: 1 } },
          ],
        },
      },
    ]);
    const totals = Object.fromEntries(
      rows[0].totals.map((x) => [x._id, x.total]),
    );
    const totalIncome = totals.income || 0,
      totalExpense = totals.expense || 0;
    res.json({
      success: true,
      data: {
        month,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        byCategory: rows[0].categories,
      },
    });
  } catch (e) {
    next(e);
  }
}
export async function update(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    const t = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!t)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    res.json({
      success: true,
      message: "Transaction updated successfully",
      data: out(t),
    });
  } catch (e) {
    next(e);
  }
}
export async function remove(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    const t = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!t)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (e) {
    next(e);
  }
}
