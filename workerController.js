import driver from "../config/neo4j.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

import { sendWorkerEmail } from "../utils/sendEmail.js";


const roleConfig = {
  market: { prefix: "register", passPrefix: "CR" },
  cafe: { prefix: "waiter", passPrefix: "WT" },
  kitchen: { prefix: "kitchen", passPrefix: "KT" }
};

/* ---------------- GET WORKERS ---------------- */

export const getWorkers = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (w:Worker)
      RETURN w
      ORDER BY w.createdAt DESC
      `
    );

    const workers = result.records.map(r => {
      const w = r.get("w").properties;
      return {
  id: w.id,
  username: w.username,
  password: w.password,
  role: w.role,
  archived: w.archived ?? false
};

    });

    res.json(workers);
  } catch (err) {
    console.error("GET WORKERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch workers" });
  } finally {
    await session.close();
  }
};

/* ---------------- CREATE WORKER ---------------- */

export const createWorker = async (req, res) => {
  const session = driver.session();
  const { role, email } = req.body;

  if (!email) {
  return res.status(400).json({ message: "Email is required" });
}


  if (!roleConfig[role]) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    // Count workers by role (NO APOC, NO REGEX)
    const countResult = await session.run(
      `
      MATCH (w:Worker { role: $role })
      RETURN count(w) AS count
      `,
      { role }
    );

    const count = countResult.records[0].get("count").toInt();
    const index = count + 1;

    const username = `${roleConfig[role].prefix}${index}`;
    const password = `${roleConfig[role].passPrefix}${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const id = crypto.randomUUID();

    const result = await session.run(
      `
      CREATE (w:Worker {
      id: $id,
      username: $username,
      password: $hashedPassword,
      role: $role,
      archived: false,
      createdAt: datetime()
      })

      RETURN w
      `,
      { id, username, hashedPassword, role }
    );

    const w = result.records[0].get("w").properties;

    await sendWorkerEmail(email, username, password, role);

    res.json({
      id: w.id,
      username: w.username,
      role: w.role
    });
  } catch (err) {
    console.error("CREATE WORKER ERROR:", err);
    res.status(500).json({ message: err.message });
  } finally {
    await session.close();
  }
};

/* ---------------- DELETE WORKER ---------------- */

export const deleteWorker = async (req, res) => {
  const session = driver.session();
  const { id } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (w:Worker { id: $id })
      DELETE w
      RETURN count(w) AS deleted
      `,
      { id }
    );

    const deleted = result.records[0].get("deleted").toInt();

    if (deleted === 0) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE WORKER ERROR:", err);
    res.status(500).json({ message: "Failed to delete worker" });
  } finally {
    await session.close();
  }
};

/* ---------------- UPDATE WORKER ---------------- */

export const updateWorker = async (req, res) => {
  const session = driver.session();
  const { id } = req.params;
  const { username, password } = req.body;

  try {
    const result = await session.run(
      `
      MATCH (w:Worker { id: $id })
      SET
        w.username = $username,
        w.password = COALESCE($hashedPassword, w.hashedPassword)
      RETURN w
      `,
      {
        id,
        username,
        password: password || null
      }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const w = result.records[0].get("w").properties;

    res.json({
      id: w.id,
      username: w.username,
      role: w.role
    });
  } catch (err) {
    console.error("UPDATE WORKER ERROR:", err);
    res.status(500).json({ message: "Failed to update worker" });
  } finally {
    await session.close();
  }
};
/* ---------------- ARCHIVE WORKER ---------------- */
export const archiveWorker = async (req, res) => {
  const session = driver.session();
  const { id } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (w:Worker { id: $id })
      SET w.archived = true
      RETURN w
      `,
      { id }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const w = result.records[0].get("w").properties;

    res.json({
      id: w.id,
      archived: w.archived
    });
  } catch (err) {
    console.error("ARCHIVE WORKER ERROR:", err);
    res.status(500).json({ message: "Failed to archive worker" });
  } finally {
    await session.close();
  }
};

