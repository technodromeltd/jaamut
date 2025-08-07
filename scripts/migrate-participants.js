#!/usr/bin/env node

const axios = require("axios");

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-domain.vercel.app/api/migrate-participants"
    : "http://localhost:3000/api/migrate-participants";

async function migrateParticipants(groupId = null, defaultToAllUsers = true) {
  try {
    console.log("Starting participant migration...");

    const payload = {
      defaultToAllUsers: defaultToAllUsers,
    };

    if (groupId) {
      payload.groupId = groupId;
      console.log(`Migrating group: ${groupId}`);
    } else {
      console.log("Migrating all groups...");
    }

    const response = await axios.post(API_URL, payload);

    console.log("✅ Migration completed successfully!");
    console.log("Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "❌ Migration failed:",
      error.response?.data || error.message
    );
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const groupId = args[0] || null;
const defaultToAllUsers = args[1] !== "false"; // Default to true unless explicitly set to false

console.log("Participant Migration Script");
console.log("============================");
console.log(`Group ID: ${groupId || "ALL GROUPS"}`);
console.log(`Default to all users: ${defaultToAllUsers}`);
console.log("");

migrateParticipants(groupId, defaultToAllUsers);
