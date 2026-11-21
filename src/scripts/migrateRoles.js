import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

const roleMigration = {
  sales: { role: "telecom", roleTitle: "Telecom Team", department: "Telecom & Lead Generation" },
  processing: { role: "relationship_manager", roleTitle: "Relationship Manager", department: "Relationship & Credit Operations" },
  viewer: { role: "manager", roleTitle: "Manager", department: "Operations Management" },
  admin: { role: "superadmin", roleTitle: "Admin / SUPERADMIN", department: "Executive Management" },
};

await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB });

let updated = 0;
for (const [oldRole, replacement] of Object.entries(roleMigration)) {
  const result = await User.updateMany(
    { role: oldRole },
    {
      $set: {
        role: replacement.role,
        roleTitle: replacement.roleTitle,
        department: replacement.department,
      },
    },
  );
  updated += result.modifiedCount;
}

await mongoose.disconnect();
console.log(`[Loan CRM Backend] Role migration completed. Updated ${updated} user record(s).`);
