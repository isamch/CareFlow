import Role from "../models/Role.js";
import connectDB from "../config/db.js";

import dotenv from 'dotenv'

// Load env vars
dotenv.config()


connectDB();


const setRoles = async () => {

  const roles = ["admin", "patient", "doctor"];

  for (let roleName of roles) {

    const role = new Role(
      {
        name: roleName,
      });


    await role.save();
  }
}


setRoles();
