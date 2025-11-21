const { json } = require("express");
const database = require("../../database");
const { validationResult, query } = require("express-validator");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const createAuthor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: errors.array() });
  }
  const client = await database.connectDatabase();
  try {
    const { name, bio, age } = req.body;
    const author = await client.query(
      "INSERT INTO authors (name,bio,age) VALUES ($1, $2,$3) RETURNING *",
      [name, bio, age]
    );

    res.json(author.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ message: "email already exists!" });
    } else if (err.code === "23502") {
      res.status(400).json({ message: `${err.column} is require!` });
    } else if (err.code === "23503") {
      res.status(400).json({ message: "foreign key violation!" });
    } else if (err.code === "42P01") {
      res.status(400).json({ message: "table does not exist!" });
    } else {
      res.status(500).json({ message: "internal server error!" });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getAllAuthors = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const searchKey = req.query.search || "";
    const authors = await client.query(
      "SELECT * FROM authors WHERE name ILIKE $1",
      [`%${searchKey}%`]
    );

    res.json(authors.rows);
  } catch (err) {
    console.log(err);
    if (err.code === "42P01") {
      res.status(400).json({ message: "table does not exist!" });
    } else {
      res.status(500).json({ message: "internal server error!" });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getSingleAuthor = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const authorId = +req.params.id;

    if (!authorId) {
      return res.status(400).json({ message: "provide init id!" });
    }
    const author = await client.query("SELECT * FROM authors WHERE id = $1", [
      authorId,
    ]);
    if (author.rowCount === 0) {
      res.status(404).json({ message: "author not found!" });
    }
    res.json(author.rows[0]);
  } catch (err) {
    if (err.code === "42P01") {
      res.status(400).json({ message: "table does not exist!" });
    } else {
      res.status(500).json({ message: "internal server error!" });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const createBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: errors.array() });
  }
  const client = await database.connectDatabase();
  try {
    const { title, description, authorId } = req.body;
    const author = await client.query("SELECT * FROM authors WHERE id = $1", [
      authorId,
    ]);
    if (author.rowCount === 0) {
      res.status(404).json({ message: "author not found!" });
    }
    const book = await client.query(
      'INSERT INTO books (title, description, "authorId") VALUES ($1, $2,$3) RETURNING *',
      [title, description, authorId]
    );

    res.json(book.rows[0]);
  } catch (err) {
    if (err.code === "23502") {
      res.status(400).json({ message: `${err.column} is require!` });
    } else if (err.code === "23503") {
      res.status(400).json({ message: "foreign key violation!" });
    } else if (err.code === "42P01") {
      res.status(400).json({ message: "table does not exist!" });
    } else {
      res.status(500).json({ message: "internal server error!" });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getAllBook = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const books = await client.query(
      'SELECT * FROM books as bo LEFT JOIN authors as at ON bo."authorId" = at.id LEFT JOIN book_instock as bi ON bi."bookId" = bo.id'
    );

    const response = books.rows.map((element) => {
      return {
        id: element.id,
        title: element.title,
        description: element.description,
        author: {
          id: element.authorId,
          name: element.name,
        },
        stockManagement: {
          stock: element.stock,
          available_stock: element.available_stock,
          lease_stock: element.lease_stock,
        },
      };
    });
    res.json(response);

    //with forloop
    // const bookList = [];
    // for (let index = 0; index < books.rows.length; index++) {
    //      const element = books.rows[index];
    //      const obj = {
    //           id: element.id,
    //           title: element.title,
    //           description: element.description,
    //           author: {
    //                id: element.authorId,
    //                name: element.name,
    //           },
    //           stockManagement: {
    //                stock: element.stock,
    //                available_stock: element.available_stock,
    //                lease_stock: element.lease_stock,
    //           }
    //      }
    //      bookList.push(obj)
    // }
    // res.json(bookList)
  } catch (err) {
    console.log(err);
    if (err.code === "23502") {
      res.status(400).json({
        message: `${err.column} is require!`,
      });
    } else if (err.code === "23503") {
      res.status(400).json({
        message: "foreign key violation!",
      });
    } else if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const deleteBook = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const bookId = +req.params.id;

    if (!bookId) {
      return res.status(400).json({
        message: "Provide a valid book id!",
      });
    }
    const result = await client.query(
      "DELETE FROM books WHERE id = $1 RETURNING *",
      [bookId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Book not found!" });
    }
    res.status(200).json({
      con: true,
      msg: "Book deleted successfully!",
      result: result.rows[0],
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

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const updateBook = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const bookId = +req.params.id;
    const { title, description, authorId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Provide a valid book id!" });
    }
    const existing = await client.query("SELECT * FROM books WHERE id = $1", [
      bookId,
    ]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "Book not found!" });
    }
    if (authorId) {
      const author = await client.query("SELECT * FROM authors WHERE id = $1", [
        authorId,
      ]);
      if (author.rowCount === 0) {
        return res.status(404).json({ message: "Author not found!" });
      }
    }
    const updated = await client.query(
      `UPDATE books SET title = COALESCE($1, title),description = COALESCE($2, description), "authorId" = COALESCE($3, "authorId")
                WHERE id = $4  RETURNING *`,
      [title, description, authorId, bookId]
    );

    res.status(200).json({
      con: true,
      msg: "Book updated successfully!",
      result: updated.rows[0],
    });
  } catch (err) {
    console.error(err);
    if (err.code === "23502") {
      res.status(400).json({ message: `${err.column} is required!` });
    } else if (err.code === "23503") {
      res.status(400).json({ message: "Foreign key violation!" });
    } else if (err.code === "42P01") {
      res.status(400).json({ message: "Table does not exist!" });
    } else {
      res.status(500).json({ message: "Internal server error!" });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const insertInStock = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const { bookId, stock } = req.body;

    const exist = await client.query(
      'SELECT * FROM book_instock WHERE "bookId" = $1',
      [bookId]
    );

    if (exist.rowCount !== 0) {
      const prevStock = exist.rows[0].stock;
      const allStock = prevStock + stock;
      const availableStock = allStock - exist.rows[0].lease_stock;
      const books = await client.query(
        'UPDATE book_instock SET stock = $1, available_stock = $2 WHERE "bookId" = $3 RETURNING *',
        [allStock, availableStock, bookId]
      );
      res.json(books.rows[0]);
    } else {
      const books = await client.query(
        'INSERT INTO book_instock ("bookId", stock, available_stock) VALUES ($1, $2, $3) RETURNING *',
        [bookId, stock, stock]
      );
      res.json(books.rows[0]);
    }
  } catch (err) {
    console.log(err);
    if (err.code === "23502") {
      res.status(400).json({ message: `${err.column} is require!` });
    } else if (err.code === "23503") {
      res.status(400).json({ message: "foreign key violation!" });
    } else if (err.code === "42P01") {
      res.status(400).json({ message: "table does not exist!" });
    } else {
      res.status(500).json({ message: "internal server error!" });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const lease = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const { user_id, due_date, items } = req.body;
    const bookIds = items.map((item) => item.book_id);

    const placeholders = bookIds.map((_, i) => `$${i + 1}`).join(",");

    //db books
    const books = await client.query(
      `SELECT * FROM book_instock WHERE "bookId" IN (${placeholders})`,
      bookIds
    );
    let errorMessages = [];

    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      const givenBook = books.rows.find(
        (item) => item.bookId === element.book_id
      );
      console.log(givenBook);
      if (givenBook) {
        const perTotal = element.quantity * element.per_price;
        element.perTotal = perTotal;
        if (element.quantity > givenBook.available_stock) {
          errorMessages.push(
            `Only ${givenBook.available_stock} books are available for book id : ${element.book_id}`
          );
        } else {
          givenBook.available_stock =
            givenBook.available_stock - element.quantity;
          givenBook.lease_stock += element.quantity;
          await client.query(
            `UPDATE book_instock
SET lease_stock = $1, available_stock = $2 WHERE "bookId" = $3;`,
            [
              // book_instock.rows[0].id,
              givenBook.lease_stock,
              givenBook.available_stock,
              element.book_id,
            ]
          );
          // console.log(givenBook.lease_stock);
          // console.log(givenBook.stock);
        }
      } else {
        errorMessages.push(`not found with book id ${element.book_id}`);
      }
    }

    if (errorMessages.length > 0) {
      return res.status(400).json({
        message: errorMessages,
      });
    }

    const count = await client.query("SELECT COUNT(*) FROM lease_invoice");
    //     console.log(count);

    const INVOICE_NO = "LEASE_" + (parseInt(count.rows[0].count) + 1);
    console.log(INVOICE_NO);
    const totalPrice = items.reduce((a, b) => {
      return a + b.perTotal;
    }, 0);

    const now = new Date();
    const date = new Date(
      now.getTime() + (due_date * 24 + 6.5) * 60 * 60 * 1000
    );
    console.log(date);

    const invoice = await client.query(
      "INSERT INTO lease_invoice (invoice_no, user_id, due_date,total_price) VALUES ($1, $2, $3, $4) RETURNING id",
      [INVOICE_NO, user_id, date, totalPrice]
    );

    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      await client.query(
        "INSERT INTO lease_invoice_items (invoice_id,book_id,quantity,total_price) VALUES ($1,$2,$3,$4) ",
        [
          invoice.rows[0].id,
          element.book_id,
          element.quantity,
          element.perTotal,
        ]
      );
    }

    //handle available

    // const details = await client.query(
    //   `SELECT * FROM lease_invoice LEFT JOIN users ON lease_invoice.user_id = users.id LEFT JOIN lease_invoice_items ON lease_invoice.id = lease_invoice_items.invoice_id LEFT JOIN books ON lease_invoice_items.book_id = books.id LEFT JOIN book_instock ON book_instock."bookId" = books.id WHERE lease_invoice.invoice_no = $1;`,
    //   [INVOICE_NO]
    // );
    const details = await client.query(
      `WITH
        invoices AS (
            SELECT id AS invoice_id, invoice_no, user_id, total_price, due_price, due_date, status, created_at, updated_at
            FROM lease_invoice
        ),
        users_cte AS (
            SELECT id AS user_id, name, email, gender
            FROM users
        ),
        items AS (
            SELECT id AS item_id, invoice_id, book_id, quantity, total_price AS item_total_price
            FROM lease_invoice_items
        ),
        books_cte AS (
            SELECT id AS book_id, title, description
            FROM books
        ),
        stock AS (
            SELECT "bookId" AS book_id, stock, available_stock, lease_stock
            FROM book_instock
        )

    SELECT
        invoices.invoice_id,
        invoices.invoice_no,
        invoices.user_id,
        users_cte.name AS user_name,
        users_cte.email AS user_email,
        books_cte.book_id,
        books_cte.title AS book_title,
        books_cte.description,
        items.item_id,
        invoices.created_at,
        invoices.updated_at,
        invoices.due_date,
        invoices.status,
        invoices.due_price,
        items.quantity,
        items.item_total_price,
        invoices.total_price AS invoice_total_price,
        stock.stock,
        stock.available_stock,
        stock.lease_stock
    FROM invoices
    JOIN users_cte ON users_cte.user_id = invoices.user_id
    JOIN items ON items.invoice_id = invoices.invoice_id
    JOIN books_cte ON books_cte.book_id = items.book_id
    JOIN stock ON stock.book_id = books_cte.book_id
    WHERE invoices.invoice_no =$1;`,
      [INVOICE_NO]
    );

    const data = details.rows;
    console.log(data);

    const result = {
      invoice_id: data[0].invoice_id,
      invoice_no: data[0].invoice_no,
      status: data[0].status,
      due_date: data[0].due_date,
      borrow_date: data[0].created_at,
      invoice_total_price: data[0].invoice_total_price,
      user: {
        id: data[0].user_id,
        name: data[0].user_name,
        email: data[0].user_email,
        books: [],
      },
    };

    data.map((element) => {
      const book = {
        book_id: element.book_id,
        title: element.book_title,
        description: element.description,
        quantity: element.quantity,
        item_total_price: element.item_total_price,
        due_price: element.due_price,
        stockManagement: {
          stock: element.stock,
          available_stock: element.available_stock,
          lease_stock: element.lease_stock,
        },
      };
      result.user.books.push(book);
    });
    // books.rows.forEach((book) => {
    //      book.author = {
    //           id: book.authorId,
    //           name: book.authorName,
    //           bio: book.authorBio,
    //           age: book.age
    //      }
    //    });
    //    const bookList = books.rows.map(({ authorId, authorName, authorBio, age, ...rest }) => rest);
    //    console.log(bookList)
    //     console.log(response);
    res.json(result);
  } catch (err) {
    console.log(err);
    if (err.code === "23502") {
      res.status(400).json({
        message: `${err.column} is required!`,
      });
    } else if (err.code === "23503") {
      res.status(400).json({
        message: "foreign key violation!",
      });
    } else if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getAllStatus = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    //const leaseInvoice = await client.query(`SELECT * FROM lease_invoice order by id desc`);
    const today = new Date();
    const leaseInvoice = await client.query(
      `SELECT * FROM lease_invoice order by id desc`
    );
    if (leaseInvoice.rows[0].due_date < today) {
      const leaseInvoiceUpdate = await client.query(
        `UPDATE lease_invoice SET status = 'OVER_DUE' RETURNING *`
      );
      res.json(leaseInvoiceUpdate.rows);
    }
    res.json(leaseInvoice.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "internal server error!",
    });
  } finally {
    await database.disconnectDatabase();
  }
};
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getSingleStatus = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const invoice_no = req.params.invoice_no;
    console.log(invoice_no);
    if (!invoice_no) {
      return res.status(400).json({
        message: "provide valid invoice no..!",
      });
    }

    const findInvoice = await client.query(
      "SELECT * FROM lease_invoice WHERE invoice_no = $1",
      [invoice_no]
    );
    if (findInvoice.rowCount === 0) {
      res.status(404).json({
        message: "invoice no. not found!",
      });
    }
    const today = new Date();
    console.log(today);
    console.log(findInvoice.rows[0].due_date);
    if (findInvoice.rows[0].due_date < today) {
      const updated = await client.query(
        `UPDATE lease_invoice SET status = 'OVER_DUE' WHERE id = $1 RETURNING *`,
        [findInvoice.rows[0].id]
      );
      return res.json(updated.rows[0]);
    }
    return res.json(findInvoice.rows[0]);
  } catch (err) {
    console.log(err);
    if (err.code === "23502") {
      res.status(400).json({
        message: `${err.column} is required!`,
      });
    } else if (err.code === "23503") {
      res.status(400).json({
        message: "foreign key violation!",
      });
    } else if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getSingleUserInvoice = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const id = parseInt(req.params.id);
    const singleUserLease = await client.query(
      `SELECT li.id AS lease_invoice_id ,li.invoice_no, li.user_id,li.total_price
      AS invoice_total_price, li.due_price,li.created_at
      AS borrowed_at,li.due_date, li.status, users.email, users.name
      AS user_name, items.id AS item_id , items.book_id, items.quantity, items.total_price
      AS items_total_price , bo.title, bo.description, bo."authorId"
      AS author_id, bo."createdAt" AS book_created_at , at.name
      AS author_name FROM lease_invoice as li
      JOIN users ON users.id = li.user_id
      LEFT JOIN lease_invoice_items as items ON li.id= items.invoice_id
      LEFT JOIN books as bo ON bo.id = items.book_id
      LEFT JOIN authors as at ON at.id = bo."authorId"
       WHERE li.user_id = $1`,
      [id]
    );
    const data = singleUserLease.rows;
    const user = {
      id: data[0].user_id,
      name: data[0].user_name,
      email: data[0].email,
    };

    const grouped = [...new Set(data.map((x) => x.lease_invoice_id))];
    console.log({ grouped });
    const result = [];
    for (let index = 0; index < grouped.length; index++) {
      const element = grouped[index];

      const filterBooks = data.filter((d) => d.lease_invoice_id === element);
      console.log(filterBooks);
      result.push({
        invoice_id: element,
        invoice_no: filterBooks[0].invoice_no,
        lease_status: filterBooks[0].status,
        invoice_total_price: filterBooks.reduce((acc, cur) => {
          return acc + cur.items_total_price;
        }, 0),
        due_price: filterBooks[0].due_price,
        borrowed_at: filterBooks[0].borrowed_at,
        books: filterBooks.map((book) => {
          return {
            book_id: book.book_id,
            title: book.title,
            description: book.description,
            createdAt: book.book_created_at,
            author_id: book.author_id,
            author_name: book.author_name,
            quantity: book.quantity,
            total_price: book.items_total_price,
          };
        }),
      });
    }
    return res.json({
      user: user,
      lease_history: result,
    });
  } catch (err) {
    console.log(err);
  } finally {
    await database.disconnectDatabase();
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const RETURNED = async (req, res) => {
  const client = await database.connectDatabase();

  try {
    const invoice_no = req.params.invoice_no;
    const { due_price, booksReturnDate } = req.body;
    console.log(booksReturnDate);

    const joinAll = await client.query(
      `SELECT * FROM lease_invoice_items AS items LEFT JOIN book_instock AS bi ON bi."bookId" = items.book_id LEFT JOIN lease_invoice AS li ON li.id = items.invoice_id WHERE invoice_no = $1`,
      [invoice_no]
    );
    if (joinAll.rowCount === 0) {
      res.status(404).json({
        message: "lease invoice id is not found in lease history!",
      });
    }
    const bookIds = joinAll.rows.map((item) => item.book_id);
    const quantities = joinAll.rows.map((item) => item.quantity);
    console.log(bookIds);
    const invoices = await client.query(
      `SELECT * FROM lease_invoice WHERE invoice_no = $1`,
      [invoice_no]
    );

    console.log(invoices.rows);
    const due_date = invoices.rows[0].due_date;

    if (due_date < new Date(booksReturnDate)) {
      if (!due_price) {
        res.json({
          message: "Return date is over due date. Please pay for due price.",
        });
      } else {
        const lease_overdue = await client.query(
          `UPDATE lease_invoice SET due_price = $1, updated_at = $2, status = 'RETURNED'  WHERE invoice_no = $3`,
          [due_price, booksReturnDate, invoice_no]
        );
      }
    } else {
      const lease_update = await client.query(
        `UPDATE lease_invoice SET updated_at = $1, status = 'RETURNED'  WHERE invoice_no = $2`,
        [booksReturnDate, invoice_no]
      );
    }

    for (let i = 0; i < joinAll.rowCount; i++) {
      const available = joinAll.rows[i].available_stock + quantities[i];
      const lease_stock = joinAll.rows[i].lease_stock - quantities[i];

      const stockUpdate = await client.query(
        `UPDATE book_instock SET available_stock = $1, lease_stock = $2 WHERE "bookId" = $3`,
        [available, lease_stock, bookIds[i]]
      );
    }

    const returnUpdate = await client.query(
      `SELECT li.id AS lease_invoice_id , li.invoice_no, li.user_id,li.total_price AS invoice_total_price, li.due_price,li.created_at AS borrowed_at,li.due_date, li.updated_at AS returned_at, li.status, items.id AS item_id , items.book_id, items.quantity, items.total_price AS items_total_price, bi.available_stock, bi.lease_stock
    FROM lease_invoice as li
    LEFT JOIN lease_invoice_items as items ON li.id= items.invoice_id
    LEFT JOIN book_instock AS bi ON bi."bookId" = items.book_id
         WHERE li.invoice_no = $1`,
      [invoice_no]
    );
    res.json(returnUpdate.rows);
  } catch (error) {
    console.log(error);
  } finally {
    await database.disconnectDatabase();
  }
};

module.exports = {
  createAuthor,
  getAllAuthors,
  getSingleAuthor,
  createBook,
  getAllBook,
  deleteBook,
  updateBook,
  insertInStock,
  lease,
  getSingleStatus,
  getAllStatus,
  getSingleUserInvoice,
  RETURNED,
};
