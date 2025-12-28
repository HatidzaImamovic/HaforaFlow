const driver = require("../config/neo4j");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const session = driver.session();

  try {
    // 1️⃣ Find User OR Worker
    const result = await session.run(
      `
      MATCH (n)
      WHERE (n:User OR n:Worker) AND n.username = $username
      RETURN n, labels(n) AS labels
      `,
      { username }
    );

    if (result.records.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const record = result.records[0];
    const node = record.get("n").properties;
    const labels = record.get("labels");

    if (labels.includes("Worker") && node.archived === true) {
  return res.status(403).json({ message: "Account is archived" });
}


    // 2️⃣ Compare password
    const isValid = await bcrypt.compare(password, node.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 3️⃣ Determine role
    let role = "admin"; // default for User
    if (labels.includes("Worker")) {
      role = node.role; // waiter / kitchen / market
    }

    // 4️⃣ Generate token
    const token = jwt.sign(
      {
        id: node.id,
        username: node.username,
        role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    await session.close();
  }
};
