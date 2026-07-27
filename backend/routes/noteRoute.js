const express = require("express");
const {
  createNote,
  getAllNotes,
  getNote,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");
const requestLogger = require("../middlewares/requestLogger");
const validateNoteBody = require("../middlewares/validator/noteValidator");

const router = express.Router();

router.use(requestLogger);

router.route("/").post(validateNoteBody, createNote).get(getAllNotes);
router
  .route("/:id")
  .get(getNote)
  .put(validateNoteBody, updateNote)
  .delete(deleteNote);

module.exports = router;
