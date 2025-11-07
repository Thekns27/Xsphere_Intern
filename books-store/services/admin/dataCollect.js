const RETURNED = async (req, res) => {
  const client = await database.connectDatabase();

  try {
    const invoice_no = req.params.invoice_no;

    const invoiceReturn = await client.query(
      `SELECT * FROM lease_invoice WHERE invoice_no = $1`,
      [invoice_no]
    );

    if (invoiceReturn.rows.length === 0) {
      return res.status(404).json({ message: "This invoice not found!" });
    }

    const invoice = invoiceReturn.rows[0];
    if (invoice.status === "RETURNED" || invoice.status === "OVER_DUE") {
      return res
        .status(400)
        .json({ message: `Invoice already marked as ${invoice.status}` });
    }
    if (invoice.staus === "OVER_DUE") {
      const due_price = req.body.due_price;
      await client.query(
        `UPDATE lease_invoice SET due_price = $1 WHERE id = $2`,
        [due_price, invoice.id]
      );
      await client.query(`UPDATE lease_invoice SET status = $1 WHERE id = $2`, [
        "RETURNED",
        invoice.id,
      ]);
      return res.status(200).json({
        message: `Books returned successfully! Invoice marked as RETURNED.`,
      });
    }

    const itemsReturn = await client.query(
      `SELECT * FROM lease_invoice_items WHERE invoice_id = $1`,
      [invoice.id]
    );
    const items = itemsReturn.rows;

    if (items.length === 0) {
      return res
        .status(400)
        .json({ message: "No items found in this invoice_no" });
    }
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    const status = today > dueDate ? "OVER_DUE" : "RETURNED";
    // code write   invoice.status === (due_date <= today )
    // {update status  RETURNED
    // }
    // ----------------------------------
    // invoice.status === (due_date <  today)// OVER_DUE
    // {
    // 	req.body.due_price
    // 	update status RETURNED
    // }
    // ----------------------------------
    // finally update book_instock
    if (status === "RETURNED") {
      for (let item of items) {
        await client.query(
          `UPDATE "book_instock"
         SET available_stock = available_stock + $1,
             lease_stock = lease_stock - $1,
             "updatedAt" = NOW()
         WHERE "bookId" = $2`,
          [item.quantity, item.book_id]
        );
      }
      await client.query(
        `UPDATE lease_invoice
       SET status = $1, updated_at = NOW()
       WHERE id = $2`,
        [status, invoice.id]
      );
      return res.status(200).json({
        message: `Books returned successfully! Invoice marked as ${status}.`,
      });
    }
    if (status === "OVER_DUE") {
      const overDuePrice = items.reduce((acc, cur) => {
        return acc + cur.items_total_price;
      }, 0);
      await client.query(
        `UPDATE lease_invoice SET due_price = $1 WHERE id = $2`,
        [overDuePrice, invoice.id]
      );
      await client.query(`UPDATE lease_invoice SET status = $1 WHERE id = $2`, [
        "OVER_DUE",
        invoice.id,
      ]);
      return res.status(200).json({
        message: `Books returned successfully! Invoice marked as ${status}.`,
      });
    }
    for (let item of items) {
      await client.query(
        `UPDATE "book_instock"
         SET
           available_stock = available_stock + $1,
           lease_stock = lease_stock - $1,
           "updatedAt" = NOW()
         WHERE "bookId" = $2`,
        [item.quantity, item.book_id]
      );
      //  if (status === "OVER_DUE") {
      //   const overDuePrice = items.reduce((acc, cur) => {
      //     return acc + cur.items_total_price;
      //   }, 0);
      //   await client.query(`UPDATE lease_invoice SET due_price = $1 WHERE id = $2`, [
      //     overDuePrice,
      //     invoice.id,
      //   ]);
      //   await client.query(`UPDATE lease_invoice SET status = $1 WHERE id = $2`, [
      //     "OVER_DUE",
      //     invoice.id,
      //   ]);
      //   res.status(200).json({
      //     message: `Books returned successfully! Invoice marked as ${status}.`,
      //   })
      // }
    }
    await client.query(
      `UPDATE lease_invoice
       SET status = $1, updated_at = NOW()
       WHERE id = $2`,
      [status, invoice.id]
    );
    res.status(200).json({
      message: `Books returned successfully! Invoice marked as ${status}.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error!" });
  } finally {
    await database.disconnectDatabase();
  }
};
// try {
//   const invoice_no = req.params.invoice_no;

//   const invoiceReturn = await client.query(
//     `SELECT * FROM lease_invoice WHERE invoice_no = $1`,
//     [invoice_no]
//   );
//   console.log(invoiceReturn);

//   if (invoiceReturn.rows.length === 0) {
//     return res.status(404).json({ message: "This invoice not found!" });
//   }

//   const invoice = invoiceReturn.rows[0];
//   if (invoice.status === "RETURNED" || invoice.status === "OVER_DUE") {
//     return res
//       .status(400)
//       .json({ message: `Invoice already marked as ${invoice.status}` });
//   }
//   if (invoice.status === "OVER_DUE") {
//     const due_price = req.body.due_price;
//     await client.query(
//       `UPDATE lease_invoice SET total_price = due_price + $1 WHERE id = $2`,
//       [due_price, invoice.id]
//     );
//     await client.query(`UPDATE lease_invoice SET status = $1 WHERE id = $2`, [
//       "RETURNED",
//       invoice.id,
//     ]);
//     return res.status(200).json({
//       message: `Books returned successfully! Invoice marked as RETURNED.`,
//     });
//   }
//   const itemsReturn = await client.query(
//     `SELECT * FROM lease_invoice_items WHERE invoice_id = $1`,
//     [invoice.id]
//   );
//   const items = itemsReturn.rows;

//   if (items.length === 0) {
//     return res
//       .status(400)
//       .json({ message: "No items found in this invoice_no" });
//   }

//   const today = new Date();
//   const dueDate = new Date(invoice.due_date);
//   const status = today > dueDate ? "RETURNED" : "OVER_DUE";

//   for (let item of items) {
//     await client.query(
//       `UPDATE "book_instock"
//        SET
//          available_stock = available_stock + $1,
//          lease_stock = lease_stock - $1,
//          "updatedAt" = NOW()
//        WHERE "bookId" = $2`,
//       [item.quantity, item.book_id]
//     );
//   }
//   await client.query(
//     `UPDATE lease_invoice
//      SET status = $1, updated_at = NOW()
//      WHERE id = $2`,
//     [status, invoice.id]
//   );
//   res.status(200).json({
//     message: `Books returned successfully! Invoice marked as ${status}.`,
//   });
