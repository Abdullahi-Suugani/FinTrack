import { app } from "./app.js";
import { env } from "./config/env.js";
import connectDB from "./config/db.js";
await connectDB();
const server = app.listen(env.PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${env.PORT}`),
);
process.on("SIGINT", () => server.close());
