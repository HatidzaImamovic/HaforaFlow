import driver from "../config/neo4j.js";

/* ----------------------------------------------------
   GET MARKET ITEMS
-----------------------------------------------------*/
export const getMarketItems = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run("MATCH (p:Product) RETURN p");

    const items = result.records.map(record => {
      const node = record.get("p").properties;

      return {
        id: node.id.toString(),
        name: node.name,
        price: Number(node.price),
        producer: node.producer,
        category: node.category,
        details: node.details,
        image: node.img,
        barcode: node.barcode,
        hidden: node.hidden ?? false   // 🔥
      };
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch items" });
  } finally {
    await session.close();
  }
};


/* ----------------------------------------------------
   CREATE PURCHASE
-----------------------------------------------------*/
export const createPurchase = async (req, res) => {
  const session = driver.session();
  const { items, total, paymentType, amountGiven } = req.body;

  try {
    await session.run(
      `
      CREATE (m:MarketOrder {
        id: randomUUID(),
        total: toFloat($total),
        paymentType: $paymentType,
        amountGiven: ${
          // Neo4j cannot store undefined, so we convert to NULL or Float
          amountGiven === undefined || amountGiven === null
            ? "NULL"
            : "toFloat($amountGiven)"
        },
        date: datetime()
      })
      WITH m
      UNWIND $items AS it
      MATCH (p:Product {id: toInteger(it.id)})
      CREATE (m)-[:CONTAINS {
        qty: toInteger(it.qty),
        price: toFloat(it.price)
      }]->(p)
      `,
      { items, total, amountGiven, paymentType }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("createPurchase error:", err);
    res.status(500).json({ message: "Failed to save purchase" });
  } finally {
    await session.close();
  }
};


export const getPurchaseHistory = async (req, res) => {
  const session = driver.session();
  const { date } = req.query;

  try {
    const result = await session.run(
      `
      MATCH (m:MarketOrder)-[r:CONTAINS]->(p:Product)
      ${date ? "WHERE date(m.date) = date($dateString)" : ""}
      RETURN m,
      collect({
        name: p.name,
        qty: r.qty,
        price: r.price
      }) AS items
      ORDER BY m.date DESC
      `,
      { dateString: date }
    );

    const history = result.records.map((record) => {
      const o = record.get("m").properties;
      const d = o.date;

      const jsDate = new Date(
        d.year.low,
        d.month.low - 1,
        d.day.low,
        d.hour.low,
        d.minute.low,
        d.second.low
      );

      return {
        id: o.id,
        total: Number(o.total),
        paymentType: o.paymentType,
        amountGiven: o.amountGiven ? Number(o.amountGiven) : null,
        date: jsDate,
        items: record.get("items").map((i) => ({
          name: i.name,
          qty: Number(i.qty),
          price: Number(i.price),
        })),
      };
    });

    res.json(history);
  } catch (err) {
    console.error("getPurchaseHistory error:", err);
    res.status(500).json({ message: "Failed to fetch purchase history" });
  } finally {
    await session.close();
  }
};

export const getPurchaseDates = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (m:MarketOrder)
      RETURN DISTINCT date(m.date) AS d
      ORDER BY d DESC
      `
    );

    const dates = result.records.map((r) => {
      const d = r.get("d");
      return `${d.year.low}-${String(d.month.low).padStart(2, "0")}-${String(d.day.low).padStart(2, "0")}`;
    });

    res.json(dates);
  } catch (err) {
    console.error("getPurchaseDates error:", err);
    res.status(500).json({ message: "Failed to fetch dates" });
  } finally {
    await session.close();
  }
};

export const createMarketItem = async (req, res) => {
  const session = driver.session();
  const {
    name, price, producer,
    category, details, img, barcode
  } = req.body;

  try {
    await session.run(
      `
      CREATE (p:Product {
      id: toInteger(timestamp()),
      name: $name,
      price: toFloat($price),
      producer: $producer,
      category: $category,
      details: $details,
      img: $img,
      barcode: $barcode,
      hidden: false
      })

      `,
      { name, price, producer, category, details, img, barcode }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create market item" });
  } finally {
    await session.close();
  }
};

export const deleteMarketItem = async (req, res) => {
  const session = driver.session();
  const id = req.params.id;

  console.log("DELETE market item id:", id);

  try {
    const result = await session.run(
      `
      MATCH (p:Product)
      WHERE p.id = toInteger($id)
      DETACH DELETE p
      RETURN count(p) AS deleted
      `,
      { id }
    );

    const deleted = result.records[0].get("deleted").toInt();

    if (!deleted) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete market item error:", err);
    res.status(500).json({ error: "Delete failed" });
  } finally {
    await session.close();
  }
};


export const updateMarketItem = async (req, res) => {
  const session = driver.session();
  const { id } = req.params;

  const { image, ...rest } = req.body;

  const props = {
    ...rest,
    ...(image !== undefined && { img: image })
  };

  try {
    const result = await session.run(
      `
      MATCH (p:Product { id: toInteger($id) })
      SET p += $props
      RETURN p
      `,
      { id, props }
    );

    if (!result.records.length) {
      return res.status(404).json({ error: "Item not found" });
    }

    const node = result.records[0].get("p").properties;

    res.json({
      id: Number(node.id),
      name: node.name,
      price: Number(node.price),
      producer: node.producer,
      category: node.category,
      details: node.details,
      barcode: node.barcode,
      image: node.img
    });
  } catch (err) {
    console.error("Update market item error:", err);
    res.status(500).json({ error: "Update failed" });
  } finally {
    await session.close();
  }
};

export const toggleMarketItemHidden = async (req, res) => {
  const session = driver.session();
  const { id } = req.params;
  const { hidden } = req.body;

  try {
    await session.run(
      `
      MATCH (p:Product { id: toInteger($id) })
      SET p.hidden = $hidden
      `,
      { id, hidden }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle hidden" });
  } finally {
    await session.close();
  }
};

