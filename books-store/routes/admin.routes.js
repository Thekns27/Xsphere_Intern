const express = require("express");
const adminRouter = express.Router();
const { body, param } = require("express-validator");
const {
  createAuthor,
  getAllAuthors,
  getSingleAuthor,
  createBook,
  getAllBook,
  insertInStock,
  lease,
  deleteBook,
  updateBook,
  getSingleStatus,
  getAllStatus,
  getSingleUserInvoice,
  RETURNED,
} = require("../services/admin/admin.controller");

//user register
adminRouter.post(
  "/author",
  [
    body("bio").isString().withMessage("Please provide a bio"),
    body("name")
      .isString()
      .isLength({ min: 6, max: 20 })
      .withMessage("Name must be between 6 and 20 characters long"),
    body("age").isInt().withMessage("Age must be a number"),
  ],
  createAuthor
);

adminRouter.get("/author", getAllAuthors);

adminRouter.get(
  "/author/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("provide id")
      .isInt()
      .withMessage("provide init id")
      .toInt(),
  ],
  getSingleAuthor
);

//create book
adminRouter.post(
  "/book",
  [
    body("title").isString().withMessage("Please provide a title"),
    body("description")
      .isString()
      .isLength({ min: 6, max: 20 })
      .withMessage("Name must be between 6 and 20 characters long"),
    body("authorId").isInt().withMessage("Provide authorId"),
  ],
  createBook
);

adminRouter.get("/book", getAllBook);

adminRouter.delete(
  "/book/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Provide book ID")
      .isInt()
      .withMessage("Book ID must be an integer")
      .toInt(),
  ],
  deleteBook
);

adminRouter.put(
  "/book/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Provide book ID")
      .isInt()
      .withMessage("Book ID must be an integer")
      .toInt(),
    body("title").optional().isString().withMessage("Title must be a string"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("authorId")
      .optional()
      .isInt()
      .withMessage("Author ID must be an integer"),
  ],
  updateBook
);

//create book
adminRouter.post(
  "/book/instock",
  [
    body("bookId").isInt().withMessage("Please provide a bookId"),
    body("stock").isIn().withMessage("Please provide a stock quantity"),
  ],
  insertInStock
);

adminRouter.post(
  "/book/lease",
  [
    body("userId").isInt().withMessage("Please provide a bookId"),
    body("dueDate").isString().withMessage("Please provide a due date"),
    body("items").isArray().withMessage("Please provide a items"),
  ],
  lease
);
adminRouter.get(
  "/lease-status/:invoice_no",
  [param("invoice_no").notEmpty().withMessage("provide init id")],
  getSingleStatus
);

adminRouter.get("/lease-status", getAllStatus);
adminRouter.get("/user-lease/:id", getSingleUserInvoice);

// adminRouter.put(
//   "/book/returned/:invoice_no",
//   [
//     param("invoice_no").notEmpty().withMessage("provide invoice id"),
//   ],
//   RETURNED
// );

adminRouter.put(
  "/book/returned/:invoice_no",
  [
    param("invoice_no")
      .notEmpty()
      .withMessage("Please provide an invoice number"),
  ],
  RETURNED
);

//body("items").isArray().withMessage("Please provide a items"),

module.exports = adminRouter;
