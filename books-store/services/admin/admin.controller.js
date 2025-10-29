const { json } = require('express');
const database = require('../../database');
const { validationResult, query } = require('express-validator');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const createAuthor = async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          return res.status(400).json({message: 'Validation error',errors: errors.array()});
     }
     const client = await database.connectDatabase();
     try {
          const { name, bio, age } = req.body;
          const author = await client.query('INSERT INTO authors (name,bio,age) VALUES ($1, $2,$3) RETURNING *', [name, bio, age]);

          res.json(author.rows[0])
     } catch (err) {

          if (err.code === '23505') {
               res.status(400).json({message: "email already exists!" })
          } else if (err.code === '23502') {
               res.status(400).json({message: `${err.column} is require!`})
          }else if (err.code === '23503') {
               res.status(400).json({message: "foreign key violation!"})
          }else if (err.code === '42P01') {
               res.status(400).json({message: "table does not exist!"})
          } else {
               res.status(500).json({message: "internal server error!"})
          }
     } finally {
          await database.disconnectDatabase();
      }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getAllAuthors = async (req, res) => {

     const client = await database.connectDatabase();
     try {
          const searchKey = req.query.search || '';
          const authors = await client.query('SELECT * FROM authors WHERE name ILIKE $1', [`%${searchKey}%`]);

          res.json(authors.rows)

     } catch (err) {
          console.log(err)
          if (err.code === '42P01') {
               res.status(400).json({message: "table does not exist!"})
          } else {
               res.status(500).json({message: "internal server error!"})
          }
     } finally {
          await database.disconnectDatabase();
     }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getSingleAuthor = async (req, res) => {

     const client = await database.connectDatabase();
     try {
          const authorId = +req.params.id;

          if (!authorId) {
               return res.status(400).json({message: "provide init id!"})
          }
          const author = await client.query('SELECT * FROM authors WHERE id = $1', [authorId]);
          if (author.rowCount === 0) {
               res.status(404).json({message: "author not found!"})
          }
          res.json(author.rows[0])

     } catch (err) {
          if (err.code === '42P01') {
               res.status(400).json({message: "table does not exist!"})
          } else {
               res.status(500).json({message: "internal server error!"})
          }
     } finally {
          await database.disconnectDatabase();
     }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const createBook = async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          return res.status(400).json({message: 'Validation error',errors: errors.array()});
     }
     const client = await database.connectDatabase();
     try {
          const { title, description, authorId } = req.body;
          const author = await client.query('SELECT * FROM authors WHERE id = $1', [authorId]);
          if (author.rowCount === 0) {
               res.status(404).json({message: "author not found!"})
          }
          const book = await client.query('INSERT INTO books (title, description, "authorId") VALUES ($1, $2,$3) RETURNING *', [title, description, authorId]);

          res.json(book.rows[0])

     } catch (err) {
          if (err.code === '23502') {
               res.status(400).json({message: `${err.column} is require!`})
          } else if (err.code === '23503') {
               res.status(400).json({message: "foreign key violation!"})
          } else if (err.code === '42P01') {
               res.status(400).json({message: "table does not exist!"})
          } else {
               res.status(500).json({ message: "internal server error!"})
          }
     } finally {
          await database.disconnectDatabase();
     }
}
const getAllBook = async (req, res) => {

     const client = await database.connectDatabase();
     try {
          const books = await client.query('SELECT * FROM books as bo LEFT JOIN authors as at ON bo."authorId" = at.id LEFT JOIN book_instock as bi ON bi."bookId" = bo.id');

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
                    }
               }
          })
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
          console.log(err)
          if (err.code === '23502') {
               res.status(400).json({
                    message: `${err.column} is require!`
               })
          }
          else if (err.code === '23503') {
               res.status(400).json({
                    message: "foreign key violation!"
               })
          }
          else if (err.code === '42P01') {
               res.status(400).json({
                    message: "table does not exist!"
               })
          } else {

               res.status(500).json({
                    message: "internal server error!"
               })
          }
     }
     finally {
          await database.disconnectDatabase();
     }
}

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
                    message: "Provide a valid book id!"
               });
          }
          const result = await client.query('DELETE FROM books WHERE id = $1 RETURNING *', [bookId]);
          if (result.rowCount === 0) {
               return res.status(404).json({message:"Book not found!"});
          }
          res.status(200).json({con: true,msg: "Book deleted successfully!",result: result.rows[0]});

     } catch (err) {
          console.error(err);
          if (err.code === '42P01') {
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
               return res.status(400).json({message: "Provide a valid book id!"});
          }
          const existing = await client.query('SELECT * FROM books WHERE id = $1', [bookId]);
          if (existing.rowCount === 0) {
               return res.status(404).json({message: "Book not found!"});
          }
          if (authorId) {
               const author = await client.query('SELECT * FROM authors WHERE id = $1', [authorId]);
               if (author.rowCount === 0) {
                    return res.status(404).json({message: "Author not found!"});
               }
          }
          const updated = await client.query(`UPDATE books SET title = COALESCE($1, title),description = COALESCE($2, description), "authorId" = COALESCE($3, "authorId")
                WHERE id = $4  RETURNING *`,[title, description, authorId, bookId]
          );

          res.status(200).json({ con: true,msg: "Book updated successfully!",result: updated.rows[0]
          });
     } catch (err) {
          console.error(err);
          if (err.code === '23502') {
               res.status(400).json({ message: `${err.column} is required!` });
          } else if (err.code === '23503') {
               res.status(400).json({ message: "Foreign key violation!" });
          } else if (err.code === '42P01') {
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

          const exist = await client.query('SELECT * FROM book_instock WHERE "bookId" = $1', [bookId]);

          if (exist.rowCount !== 0) {
               const prevStock = exist.rows[0].stock;
               const allStock = prevStock + stock;
               const availableStock = allStock - exist.rows[0].lease_stock;
               const books = await client.query('UPDATE book_instock SET stock = $1, available_stock = $2 WHERE "bookId" = $3 RETURNING *', [allStock, availableStock, bookId]);
               res.json(books.rows[0]);
          } else {
               const books = await client.query('INSERT INTO book_instock ("bookId", stock, available_stock) VALUES ($1, $2, $3) RETURNING *', [bookId, stock, stock]);
               res.json(books.rows[0])
          }


     } catch (err) {
          console.log(err)
          if (err.code === '23502') {
               res.status(400).json({message: `${err.column} is require!`})
          } else if (err.code === '23503') {
               res.status(400).json({message: "foreign key violation!"})
          } else if (err.code === '42P01') {
               res.status(400).json({message: "table does not exist!"})
          } else {
               res.status(500).json({message: "internal server error!"})
          }
     } finally {
          await database.disconnectDatabase();
     }
}

const lease = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const { user_id, due_date, items } = req.body;
    const bookIds = items.map((item) => item.book_id);
    const placeholders = bookIds.map((_, i) => `$${i + 1}`).join(",");

    const books = await client.query(
      `SELECT * FROM book_instock WHERE "bookId" IN (${placeholders})`,bookIds);

    let errorMessages = [];
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      const givenBook = books.rows.find(
        (item) => item.bookId === element.book_id
      );
      if (givenBook) {
        const perTotal = element.quantity * element.per_price;
        element.perTotal = perTotal;
        if (element.quantity > givenBook.available_stock) {
          errorMessages.push(`Only ${givenBook.available_stock} books are unavailable for ${element.book_id}`);
        }

      } else {
        errorMessages.push(`not found with book id ${element.book_id}`);
      }
    } if (errorMessages.length > 0) {
      return res.status(400).json({ message: errorMessages });
    }
    const count = await client.query("SELECT COUNT(*) FROM lease_invoice");
    const INVOICE_NO = "LEASE_" + (parseInt(count.rows[0].count) + 1);

    const totalPrice = items.reduce((a, b) => a + b.perTotal, 0);

    const invoice = await client.query(
      "INSERT INTO lease_invoice (invoice_no, user_id, due_date, total_price) VALUES ($1, $2, $3, $4) RETURNING id",
      [INVOICE_NO, user_id, due_date, totalPrice]
    );

    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      await client.query(
        "INSERT INTO lease_invoice_items (invoice_id, book_id, quantity, total_price) VALUES ($1, $2, $3, $4)",
        [invoice.rows[0].id, element.book_id, element.quantity, element.perTotal]
      );
    }

    // handle available
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      await client.query(
        `UPDATE book_instock
         SET available_stock = available_stock - $1,
             lease_stock = lease_stock + $1
         WHERE "bookId" = $2`,
        [element.quantity, element.book_id]
      );
    }
   const details = await client.query( `SELECT
    lease_invoice.id AS invoice_id,
    lease_invoice.invoice_no,
    lease_invoice.status,
    lease_invoice.created_at,
    lease_invoice.due_date,
    lease_invoice.total_price AS invoice_total,
    users.id AS user_id,
    users.name,
    users.email,
    users.gender,
    lease_invoice_items.book_id,
    lease_invoice_items.quantity,
    lease_invoice_items.total_price AS item_total,
    books.title AS book_title,
    books."authorId",
    books.description,
    books."createdAt",
    books."updatedAt",
    book_instock.stock,
    book_instock.available_stock,
    book_instock.lease_stock
FROM lease_invoice
LEFT JOIN users ON lease_invoice.user_id = users.id
LEFT JOIN lease_invoice_items ON lease_invoice.id = lease_invoice_items.invoice_id
LEFT JOIN books ON lease_invoice_items.book_id = books.id
LEFT JOIN book_instock ON books.id = book_instock."bookId"
WHERE lease_invoice.invoice_no = $1`,[INVOICE_NO]);
    const data = details.rows;

    const result = {
      invoice_id: data[0].invoice_id,
      invoice_no: data[0].invoice_no,
      status: data[0].status,
      due_date: data[0].due_date,
      borrow_date: data[0].created_at,
      totalPrice: data[0].invoice_total,
      user: {
        id: data[0].user_id,
        name: data[0].name,
        email: data[0].email,
        gender: data[0].gender,
        books: [],
      },
    };

    data.forEach((element) => {
      const book = {
        book_id: element.book_id,
        title: element.book_title,
        author_id: element.authorid,
        description: element.description,
        createdAt: element.createdat,
        updatedAt: element.updatedat,
        quantity: element.quantity,
        due_price: element.due_price,
        per_price: element.item_total,
        stockManagement: {
          stock: element.stock,
          available_stock: element.available_stock,
          lease_stock: element.lease_stock,
        },
      };
      result.user.books.push(book);
    });

    res.json(result);

  } catch (err) {
    console.log(err);
    if (err.code === "23502") {
      res.status(400).json({ message: `${err.column} is required!` });
    } else if (err.code === "23503") {
      res.status(400).json({ message: "foreign key violation!" });
    } else if (err.code === "42P01") {
      res.status(400).json({ message: "table does not exist!" });
    } else {
      res.status(500).json({ message: "internal server error! " + err });
    }
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
lease
};



