import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import * as c from "../controllers/transaction.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  transactionSchema,
  querySchema,
  monthSchema,
} from "../schemas/transaction.schema.js";
const r = Router();
r.use(authenticate);
r.post("/", validate(transactionSchema), c.create);
r.get("/", validate(querySchema, "query"), c.list);
r.get("/monthly-summary", validate(monthSchema, "query"), c.summary);
r.put("/:id", validate(transactionSchema), c.update);
r.delete("/:id", c.remove);
export default r;
