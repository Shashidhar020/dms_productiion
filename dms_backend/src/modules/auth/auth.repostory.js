import {db} from "../../config/database.js";

// Generic transaction wrapper
export const transaction = async (callback) => {
  return await db.transaction(callback);
};

export const findManufacturerByEmail = async (email) => {
  return db("manufacturers").where({ email }).first();
};

export const createManufacturer = async (trx, data) => {
  const [row] = await trx("manufacturers")
    .insert({
      manufacturer_code: `MFG-${Date.now()}`,
      company_name: data.company_name,
      email: data.email,
      mobile: data.mobile
    })
    .returning("*");

  return row;
};

export const createUser = async (trx, data) => {
  const [user] = await trx("users")
    .insert({
      manufacturer_id: data.manufacturer_id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      mobile: data.mobile,
      password_hash: data.password_hash,
      user_type: data.user_type,
      is_super_admin: data.is_super_admin
    })
    .returning("*");

  return user;
};

export const createDefaultRoles = async (trx, manufacturer_id) => {
  return trx("roles").insert([
    {
      manufacturer_id,
      role_code: "ADMIN",
      role_name: "Administrator",
      is_system_role: true
    },
    {
      manufacturer_id,
      role_code: "MANAGER",
      role_name: "Manager",
      is_system_role: true
    }
  ]);
};

export const createTallyConnection = async (trx, data) => {
  return trx("tally_connections").insert({
    manufacturer_id: data.manufacturer_id,
    distributor_id: data.distributor_id,
    tally_company_name: "NOT_CONNECTED",
    sync_status: "DISCONNECTED"
  });
};

export const createAuditLog = async (trx, data) => {
  return trx("audit_logs").insert({
    manufacturer_id: data.manufacturer_id,
    user_id: data.user_id,
    module_name: data.module_name,
    action_name: data.action_name,
    new_values: data.new_values,
    created_at: new Date()
  });
};