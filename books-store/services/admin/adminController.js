
  const client = await database.connectDatabase();
  try {
    const { invoice_id } = req.body;
    const exist = await client.query(
      "SELECT * FROM lease_invoice WHERE id = $1",
      [invoice_id]
    );
    if (exist.rows.length === 0) {
      res.status(400).json({ message: "invoice not found!" });
    }
    res.json(exist.rows[0]);

    if (exist.rowCount !== 0) {
      const books = await client.query(
        "UPDATE lease_invoice SET status = $1 WHERE id = $2 RETURNING *",
        ["returned", invoice_id]
      );
      await client.query(
        "UPDATE lease_invoice_items SET status = $1 WHERE invoice_id = $2",
        ["returned", invoice_id]

      );
      res.json(books.rows[0]);
    }
  } catch (err) {
    if (err.code === "23502") {
      res.status(400).json({ message: `${err.column} is required!` });
    } else if (err.code === "23503") {
      res.status(400).json({ message: "foreign key violation!" });
    } else if (err.code === "42P01") {
      res.status(400).json({ message: "table does not exist!" });
    } else {
      res.status(500).json({ message: "internal server error! " + err });
    }
  }
  // const RETURNED = async () => {
  //   const client = await database.connectDatabase();
  //   try {
  //     const { invoice_id } = req.body;
  //     const exist = await client.query(
  //       "SELECT * FROM lease_invoice WHERE id = $1",
  //       [invoice_id]
  //     );
  //     if (exist.rows.length === 0) {
  //       res.status(400).json({ message: "invoice not found!" });
  //     }
  //     res.json(exist.rows[0]);

  //     if (exist.rowCount !== 0) {
  //       const books = await client.query(
  //         "UPDATE lease_invoice SET status = $1 WHERE id = $2 RETURNING *",
  //         ["returned", invoice_id]
  //       );
  //       await client.query(
  //         "UPDATE lease_invoice_items SET status = $1 WHERE invoice_id = $2",
  //         ["returned", invoice_id]
  //       );
  //       res.json(books.rows[0]);
  //     }
  //   } catch (err) {
  //     if (err.code === "23502") {
  //       res.status(400).json({ message: `${err.column} is required!` });
  //     } else if (err.code === "23503") {
  //       res.status(400).json({ message: "foreign key violation!" });
  //     } else if (err.code === "42P01") {
  //       res.status(400).json({ message: "table does not exist!" });
  //     } else {
  //       res.status(500).json({ message: "internal server error! " + err });
  //     }
  //   }
  // };

  // const lease = async (req, res) => {
  //   const client = await database.connectDatabase();
  //   try {
  //     const { user_id, due_date, items } = req.body;
  //     const bookIds = items.map((item) => item.book_id);
  //     const placeholders = bookIds.map((_, i) => `$${i + 1}`).join(",");

  //     const books = await client.query(
  //       `SELECT * FROM book_instock WHERE "bookId" IN (${placeholders})`,
  //       bookIds
  //     );

  //     let errorMessages = [];
  //     for (let index = 0; index < items.length; index++) {
  //       const element = items[index];
  //       const givenBook = books.rows.find(
  //         (item) => item.bookId === element.book_id
  //       );
  //       if (givenBook) {
  //         const perTotal = element.quantity * element.per_price;
  //         element.perTotal = perTotal;
  //         if (element.quantity > givenBook.available_stock) {
  //           errorMessages.push(
  //             `Only ${givenBook.available_stock} books are unavailable for ${element.book_id}`
  //           );
  //         }
  //       } else {
  //         errorMessages.push(`not found with book id ${element.book_id}`);
  //       }
  //     }
  //     if (errorMessages.length > 0) {
  //       return res.status(400).json({ message: errorMessages });
  //     }
  //     const count = await client.query("SELECT COUNT(*) FROM lease_invoice");
  //     const INVOICE_NO = "LEASE_" + (parseInt(count.rows[0].count) + 1);

  //     const totalPrice = items.reduce((a, b) => a + b.perTotal, 0);
  //     const now = new Date();
  //     const date = new Date(
  //       now.getTime() + (due_date * 24 + 6.5) * 60 * 60 * 1000
  //     );
  //     const invoice = await client.query(
  //       "INSERT INTO lease_invoice (invoice_no, user_id, due_date, total_price) VALUES ($1, $2, $3, $4) RETURNING id",
  //       [INVOICE_NO, user_id, date, totalPrice]
  //     );

  //     for (let index = 0; index < items.length; index++) {
  //       const element = items[index];
  //       await client.query(
  //         "INSERT INTO lease_invoice_items (invoice_id, book_id, quantity, total_price) VALUES ($1, $2, $3, $4)",
  //         [
  //           invoice.rows[0].id,
  //           element.book_id,
  //           element.quantity,
  //           element.perTotal,
  //         ]
  //       );
  //     }

  //      handle available
  //     for (let index = 0; index < items.length; index++) {
  //       const element = items[index];
  //       await client.query(
  //         `UPDATE book_instock
  //          SET available_stock = available_stock - $1,
  //              lease_stock = lease_stock + $1
  //          WHERE "bookId" = $2`,
  //         [element.quantity, element.book_id]
  //       );
  //     }
  //     const details = await client.query(
  //       `SELECT
  //     lease_invoice.id AS invoice_id,
  //     lease_invoice.invoice_no,
  //     lease_invoice.status,
  //     lease_invoice.created_at,
  //     lease_invoice.due_date,
  //     lease_invoice.total_price AS invoice_total,
  //     users.id AS user_id,
  //     users.name,
  //     users.email,
  //     users.gender,
  //     lease_invoice_items.book_id,
  //     lease_invoice_items.quantity,
  //     lease_invoice_items.total_price AS item_total,
  //     books.title AS book_title,
  //     books."authorId",
  //     books.description,
  //     books."createdAt",
  //     books."updatedAt",
  //     book_instock.stock,
  //     book_instock.available_stock,
  //     book_instock.lease_stock
  // FROM lease_invoice
  // LEFT JOIN users ON lease_invoice.user_id = users.id
  // LEFT JOIN lease_invoice_items ON lease_invoice.id = lease_invoice_items.invoice_id
  // LEFT JOIN books ON lease_invoice_items.book_id = books.id
  // LEFT JOIN book_instock ON books.id = book_instock."bookId"
  // WHERE lease_invoice.invoice_no = $1`,
  //       [INVOICE_NO]
  //     );
  //     const data = details.rows;

  //     const result = {
  //       invoice_id: data[0].invoice_id,
  //       invoice_no: data[0].invoice_no,
  //       status: data[0].status,
  //       due_date: data[0].due_date,
  //       borrow_date: data[0].created_at,
  //       totalPrice: data[0].invoice_total,
  //       user: {
  //         id: data[0].user_id,
  //         name: data[0].name,
  //         email: data[0].email,
  //         gender: data[0].gender,
  //         books: [],
  //       },
  //     };

  //     data.forEach((element) => {
  //       const book = {
  //         book_id: element.book_id,
  //         title: element.book_title,
  //         author_id: element.authorid,
  //         description: element.description,
  //         createdAt: element.createdat,
  //         updatedAt: element.updatedat,
  //         quantity: element.quantity,
  //         due_price: element.due_price,
  //         per_price: element.item_total,
  //         stockManagement: {
  //           stock: element.stock,
  //           available_stock: element.available_stock,
  //           lease_stock: element.lease_stock,
  //         },
  //       };
  //       result.user.books.push(book);
  //     });

  //     res.json(result);
  //   } catch (err) {
  //     if (err.code === "23502") {
  //       res.status(400).json({ message: `${err.column} is required!` });
  //     } else if (err.code === "23503") {
  //       res.status(400).json({ message: "foreign key violation!" });
  //     } else if (err.code === "42P01") {
  //       res.status(400).json({ message: "table does not exist!" });
  //     } else {
  //       res.status(500).json({ message: "internal server error! " + err });
  //     }
  //   } finally {
  //     await database.disconnectDatabase();
  //   }
  // };


  /**
 * Return leased books with due date & overdue check
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const returnLeasedBooks = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const { invoice_no, items } = req.body;

    if (!invoice_no || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "invoice_no and items are required!" });
    }

    const invoice = await client.query(
      "SELECT * FROM lease_invoice WHERE invoice_no = $1",
      [invoice_no]
    );
    if (invoice.rowCount === 0) {
      return res.status(404).json({ message: "Invoice not found!" });
    }

    const invoiceData = invoice.rows[0];
    const invoiceId = invoiceData.id;

    const now = new Date();
    const dueDate = new Date(invoiceData.due_date);
    const isOverdue = now > dueDate;
    const overdueDays = isOverdue
      ? Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24))
      : 0;

    const leasedItems = await client.query(
      "SELECT * FROM lease_invoice_items WHERE invoice_id = $1",
      [invoiceId]
    );


    for (let i = 0; i < items.length; i++) {
      const { book_id, quantity } = items[i];
      const leasedItem = leasedItems.rows.find((li) => li.book_id === book_id);

      if (!leasedItem) {
        return res.status(400).json({ message: `Book id ${book_id} not found in this invoice!` });
      }

      if (quantity > leasedItem.quantity) {
        return res.status(400).json({ message: `Returned qty exceeds leased qty for book id ${book_id}` });
      }

      // update stock
      await client.query(
        `UPDATE book_instock
         SET available_stock = available_stock + $1,
             lease_stock = lease_stock - $1
         WHERE "bookId" = $2`,
        [quantity, book_id]
      );

      // update returned qty
      await client.query(
        `UPDATE lease_invoice_items
         SET returned_quantity = COALESCE(returned_quantity, 0) + $1
         WHERE invoice_id = $2 AND book_id = $3`,
        [quantity, invoiceId, book_id]
      );
    }

    const checkReturn = await client.query(
      `SELECT SUM(quantity) AS total, SUM(COALESCE(returned_quantity,0)) AS returned
       FROM lease_invoice_items WHERE invoice_id = $1`,
      [invoiceId]
    );

    const { total, returned } = checkReturn.rows[0];
    const fullyReturned = parseInt(total) === parseInt(returned);

    let newStatus = "active";
    if (fullyReturned) {
      newStatus = isOverdue ? "returned_late" : "returned";
    } else if (isOverdue) {
      newStatus = "overdue";
    }

    await client.query(
      `UPDATE lease_invoice 
       SET status = $1, overdue_days = $2 
       WHERE id = $3`,
      [newStatus, overdueDays, invoiceId]
    );

    res.json({
      message: "Books returned successfully!",
      status: newStatus,
      overdue: isOverdue,
      overdue_days: overdueDays,
    });
  } catch (err) {
    console.error(err);
    if (err.code === "42P01") {
      res.status(400).json({ message: "Table does not exist!" });
    } else {
      res.status(500).json({ message: "Internal server error!" });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

