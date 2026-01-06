import driver from "../config/neo4j.js";

/* ---------------- GET CAFE ITEMS ---------------- */
export const getItems = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (c:Cafe)
      RETURN c
      ORDER BY c.name
    `);

    const items = result.records.map(r => {
      const node = r.get("c");

      return {
        id: node.identity.toInt(),        // ✅ Neo4j internal ID
        name: node.properties.name,
        category: node.properties.category,
        price: Number(node.properties.price),
        image: node.properties.img ?? "",
        hidden: node.properties.hidden ?? false
      };
    });

    res.json(items);
  } catch (err) {
    console.error("GET /items error:", err);
    res.status(500).json({ message: "Failed to fetch cafe items" });
  } finally {
    await session.close();
  }
};

/* ---------------- CREATE CAFE ITEM ---------------- */
export const createCafeItem = async (req, res) => {
  const session = driver.session();
  const { name, category, price, image, img } = req.body;

  try {
    await session.run(
      `
      CREATE (c:Cafe {
        name: $name,
        category: $category,
        price: toFloat($price),
        img: $img,
        hidden: false
      })
      `,
      {
        name,
        category,
        price,
        img: image ?? img ?? ""
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("CREATE item error:", err);
    res.status(500).json({ message: "Failed to create cafe item" });
  } finally {
    await session.close();
  }
};

/* ---------------- DELETE CAFE ITEM ---------------- */
export const deleteCafeItem = async (req, res) => {
  const session = driver.session();
  const id = Number(req.params.id);

  try {
    const result = await session.run(
      `
      MATCH (c:Cafe)
      WHERE id(c) = $id
      DETACH DELETE c
      RETURN count(c) AS deleted
      `,
      { id }
    );

    const deleted = result.records[0].get("deleted").toInt();

    if (!deleted) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE item error:", err);
    res.status(500).json({ error: "Delete failed" });
  } finally {
    await session.close();
  }
};

/* ---------------- UPDATE CAFE ITEM ---------------- */
export const updateCafeItem = async (req, res) => {
  const session = driver.session();
  const id = Number(req.params.id);
  const { name, category, price, image, img } = req.body;

  const props = {};
  if (name !== undefined) props.name = name;
  if (category !== undefined) props.category = category;
  if (price !== undefined) props.price = Number(price);
  if (image !== undefined) props.img = image;
  if (img !== undefined) props.img = img;

  if (!Object.keys(props).length) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    const result = await session.run(
      `
      MATCH (c:Cafe)
      WHERE id(c) = $id
      SET c += $props
      RETURN c
      `,
      { id, props }
    );

    if (!result.records.length) {
      return res.status(404).json({ error: "Item not found" });
    }

    const node = result.records[0].get("c");

    res.json({
      id: node.identity.toInt(),
      name: node.properties.name,
      category: node.properties.category,
      price: Number(node.properties.price),
      image: node.properties.img ?? "",
      hidden: node.properties.hidden ?? false
    });
  } catch (err) {
    console.error("UPDATE item error:", err);
    res.status(500).json({ error: "Update failed" });
  } finally {
    await session.close();
  }
};

/* ---------------- TOGGLE CAFE ITEM HIDDEN ---------------- */
export const toggleCafeItemHidden = async (req, res) => {
  const session = driver.session();
  const id = Number(req.params.id);
  const { hidden } = req.body;

  try {
    const result = await session.run(
      `
      MATCH (c:Cafe)
      WHERE id(c) = $id
      SET c.hidden = $hidden
      RETURN c
      `,
      { id, hidden }
    );

    if (!result.records.length) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("TOGGLE hidden error:", err);
    res.status(500).json({ error: "Failed to toggle hidden" });
  } finally {
    await session.close();
  }
};
