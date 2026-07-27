const { randomUUID } = require("crypto");
const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const ErrorHandler = require("../utils/errorHandler");

const notes = [];

exports.createNote = asyncErrorHandler(async (req, res, next) => {
  const timestamp = new Date().toISOString();
  const note = {
    id: randomUUID(),
    text: req.body.text,
    created_at: timestamp,
    updated_at: timestamp,
  };

  notes.push(note);

  res.status(201).json(note);
});

exports.getAllNotes = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json(notes);
});

exports.getNote = asyncErrorHandler(async (req, res, next) => {
  const note = notes.find(({ id }) => id === req.params.id);

  if (!note) {
    return next(new ErrorHandler("Note Not Found", 404));
  }

  res.status(200).json(note);
});

exports.updateNote = asyncErrorHandler(async (req, res, next) => {
  const noteIndex = notes.findIndex(({ id }) => id === req.params.id);

  if (noteIndex === -1) {
    return next(new ErrorHandler("Note Not Found", 404));
  }

  notes[noteIndex] = {
    ...notes[noteIndex],
    text: req.body.text,
    updated_at: new Date().toISOString(),
  };

  res.status(200).json(notes[noteIndex]);
});

exports.deleteNote = asyncErrorHandler(async (req, res, next) => {
  const noteIndex = notes.findIndex(({ id }) => id === req.params.id);

  if (noteIndex === -1) {
    return next(new ErrorHandler("Note Not Found", 404));
  }

  const [deletedNote] = notes.splice(noteIndex, 1);

  res.status(200).json(deletedNote);
});
