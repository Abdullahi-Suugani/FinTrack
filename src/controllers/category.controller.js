import Category from "../models/Category.js";
const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Salary",
  "Business",
  "Other",
];
export async function listCategories(req, res, next) {
  try {
    const custom = await Category.find({
      $or: [{ user: req.user._id }, { user: null }],
    }).select("name -_id");
    const names = [...new Set([...categories, ...custom.map((x) => x.name)])];
    res.json({ success: true, data: names });
  } catch (e) {
    next(e);
  }
}
