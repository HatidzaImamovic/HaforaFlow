import driver from "../config/neo4j.js";

/* ----------------------------------------------------
   CREATE CAFE ORDER
-----------------------------------------------------*/
export const createCafeOrder = async (req, res) => {
  const session = driver.session();
  const { items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Items required" });
  }

  try {
    await session.run(
      `
      CREATE (c:CafeOrder {
        id: randomUUID(),
        total: toFloat($total),
        status: "pending",
        createdAt: datetime(),
        finishedAt: NULL
      })
      WITH c
      UNWIND $items AS it
      CREATE (c)-[:CONTAINS {qty: toInteger(it.qty), price: toFloat(it.price)}]->(p:Item {id: toInteger(it.id), name: it.name})
      RETURN c
      `,
      { items, total }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("createCafeOrder error:", err);
    res.status(500).json({ message: "Failed to create cafe order" });
  } finally {
    await session.close();
  }
};

/* ----------------------------------------------------
   GET CAFE ORDER HISTORY
   (pending first, then done)
-----------------------------------------------------*/
export const getCafeOrderHistory = async (req, res) => {
  const session = driver.session();
  const { date, status } = req.query; // status = pending | done

  try {
    let whereClauses = [];
    let params = {};

    if (date) {
      whereClauses.push("date(c.createdAt) = date($date)");
      params.date = date;
    }

    if (status) {
      whereClauses.push("c.status = $status");
      params.status = status;
    }

    const whereString =
      whereClauses.length > 0
        ? "WHERE " + whereClauses.join(" AND ")
        : "";

    const query = `
      MATCH (c:CafeOrder)-[r:CONTAINS]->(p:Item)
      ${whereString}
      RETURN
        c,
        collect({
          name: p.name,
          qty: r.qty,
          price: r.price
        }) AS items
      ORDER BY
        CASE c.status WHEN "pending" THEN 0 ELSE 1 END,
        c.createdAt ASC
    `;

    const result = await session.run(query, params);

    const history = result.records.map((record) => {
      const o = record.get("c").properties;

      const createdAt = new Date(
        o.createdAt.year.low,
        o.createdAt.month.low - 1,
        o.createdAt.day.low,
        o.createdAt.hour.low,
        o.createdAt.minute.low,
        o.createdAt.second.low
      );

      const finishedAt = o.finishedAt
        ? new Date(
            o.finishedAt.year.low,
            o.finishedAt.month.low - 1,
            o.finishedAt.day.low,
            o.finishedAt.hour.low,
            o.finishedAt.minute.low,
            o.finishedAt.second.low
          )
        : null;

      return {
        id: o.id,
        total: Number(o.total),
        status: o.status,
        createdAt,
        finishedAt,
        items: record.get("items").map((i) => ({
          name: i.name,
          qty: Number(i.qty),
          price: Number(i.price),
        })),
      };
    });

    res.json(history);
  } catch (err) {
    console.error("getCafeOrderHistory error:", err);
    res.status(500).json({ message: "Failed to fetch cafe order history" });
  } finally {
    await session.close();
  }
};

/* ----------------------------------------------------
   UPDATE CAFE ORDER STATUS
-----------------------------------------------------*/
export const updateCafeOrderStatus = async (req, res) => {
  const session = driver.session();
  const { id } = req.params;
  const { status } = req.body;

  if (!status || (status !== "pending" && status !== "done")) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const finishedAt = status === "done" ? "datetime()" : "NULL";

    const result = await session.run(
      `
      MATCH (c:CafeOrder {id: $id})
      SET c.status = $status, c.finishedAt = ${finishedAt}
      RETURN c
      `,
      { id, status }
    );

    if (!result.records.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("updateCafeOrderStatus error:", err);
    res.status(500).json({ message: "Failed to update status" });
  } finally {
    await session.close();
  }
};

/* ----------------------------------------------------
   GET AVAILABLE DATES (for history filter)
-----------------------------------------------------*/
export const getCafeOrderDates = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (c:CafeOrder)
      RETURN DISTINCT date(c.createdAt) AS d
      ORDER BY d DESC
      `
    );

    const dates = result.records.map((r) => {
      const d = r.get("d");
      return `${d.year.low}-${String(d.month.low).padStart(2, "0")}-${String(d.day.low).padStart(2, "0")}`;
    });

    res.json(dates);
  } catch (err) {
    console.error("getCafeOrderDates error:", err);
    res.status(500).json({ message: "Failed to fetch dates" });
  } finally {
    await session.close();
  }
};
