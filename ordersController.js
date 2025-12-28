import driver from "../config/neo4j.js";

/* ----------------------------------------------------
   GET pending orders (kitchen)
-----------------------------------------------------*/
export const getPendingOrders = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (o:CafeOrder)-[r:CONTAINS]->(c:Cafe)
      WHERE o.status = "pending"
      WITH o, collect({
        id: c.id,
        name: c.name,
        qty: r.qty,
        price: r.price
      }) AS items
      RETURN o, items
      ORDER BY o.createdAt ASC
    `);

    const orders = result.records.map(record => {
      const o = record.get("o").properties;
      const itemsRaw = record.get("items");
      const d = o.createdAt;

      // Convert Neo4j datetime to JavaScript Date
      const createdDate = new Date(
        d.year.low,
        d.month.low - 1,
        d.day.low,
        d.hour.low,
        d.minute.low,
        d.second.low
      );

      return {
        id: o.id,
        items: itemsRaw.map(it => ({
          id: it.id.toNumber ? it.id.toNumber() : it.id,
          name: it.name,
          qty: it.qty.toNumber(),
          price: it.price.toNumber()
        })),
        total: o.total.toNumber(),
        status: o.status,
        createdAt: createdDate,
        finishedAt: null
      };
    });

    res.json(orders);
  } catch (err) {
    console.error("getPendingOrders error:", err);
    res.status(500).json({ error: "Failed to fetch pending orders" });
  } finally {
    await session.close();
  }
};

/* ----------------------------------------------------
   GET order history with optional date filter
-----------------------------------------------------*/
export const getHistoryOrders = async (req, res) => {
  const session = driver.session();
  const { date } = req.query;

  try {
    const result = await session.run(
      `
      MATCH (o:CafeOrder)-[r:CONTAINS]->(c:Cafe)
      ${date ? "WHERE date(o.createdAt) = date($dateString)" : ""}
      WITH o, collect({
        id: c.id,
        name: c.name,
        qty: r.qty,
        price: r.price
      }) AS items
      RETURN o, items
      ORDER BY o.createdAt DESC
      `,
      { dateString: date }
    );

    const orders = result.records.map(record => {
      const o = record.get("o").properties;
      const itemsRaw = record.get("items");
      const d = o.createdAt;

      // Convert Neo4j datetime to JavaScript Date
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
        items: itemsRaw.map(it => ({
          id: it.id?.toNumber ? it.id.toNumber() : it.id,
          name: it.name,
          qty: it.qty.toNumber(),
          price: it.price.toNumber()
        })),
        total: o.total.toNumber(),
        status: o.status,
        createdAt: jsDate,
        finishedAt: o.finishedAt ? (() => {
          const f = o.finishedAt;
          return new Date(
            f.year.low,
            f.month.low - 1,
            f.day.low,
            f.hour.low,
            f.minute.low,
            f.second.low
          );
        })() : null
      };
    });

    res.json(orders);
  } catch (err) {
    console.error("getHistoryOrders error:", err);
    res.status(500).json({ error: "Failed to fetch order history" });
  } finally {
    await session.close();
  }
};

/* ----------------------------------------------------
   GET available order dates for calendar
-----------------------------------------------------*/
export const getOrderDates = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (o:CafeOrder)
      RETURN DISTINCT date(o.createdAt) AS d
      ORDER BY d DESC
      `
    );

    const dates = result.records.map((r) => {
      const d = r.get("d");
      return `${d.year.low}-${String(d.month.low).padStart(2, "0")}-${String(d.day.low).padStart(2, "0")}`;
    });

    res.json(dates);
  } catch (err) {
    console.error("getOrderDates error:", err);
    res.status(500).json({ message: "Failed to fetch dates" });
  } finally {
    await session.close();
  }
};

/* ----------------------------------------------------
   CREATE order (from cafe)
-----------------------------------------------------*/
export const createOrder = async (req, res) => {
  const session = driver.session();
  const { items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Items required" });
  }

  try {
    const result = await session.run(
      `
      CREATE (o:CafeOrder {
        id: randomUUID(),
        total: toFloat($total),
        status: "pending",
        createdAt: datetime(),
        finishedAt: NULL
      })
      WITH o
      UNWIND $items AS it
      MATCH (c:Cafe { id: toInteger(it.id) })
      CREATE (o)-[:CONTAINS {
        qty: toInteger(it.qty),
        price: toFloat(it.price)
      }]->(c)
      RETURN o
      `,
      { items, total }
    );

    const o = result.records[0].get("o").properties;

    res.status(201).json({
      id: o.id,
      items,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt,
      finishedAt: null
    });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    await session.close();
  }
};

/* ----------------------------------------------------
   UPDATE order status (kitchen)
-----------------------------------------------------*/
export const updateOrder = async (req, res) => {
  const session = driver.session();
  const { id } = req.params;
  const { status } = req.body;

  if (!status || (status !== "pending" && status !== "done")) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const result = await session.run(
      `
      MATCH (o:CafeOrder { id: $id })
      SET o.status = $status,
          o.finishedAt = CASE
            WHEN $status = "done" THEN datetime()
            ELSE NULL
          END
      RETURN o
      `,
      { id, status }
    );

    if (!result.records.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    const o = result.records[0].get("o").properties;

    res.json({
      id: o.id,
      status: o.status,
      finishedAt: o.finishedAt ?? null
    });
  } catch (err) {
    console.error("updateOrder error:", err);
    res.status(500).json({ error: "Failed to update order" });
  } finally {
    await session.close();
  }
};