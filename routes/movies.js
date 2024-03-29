const { Movies, validate } = require("../models/movie");
const { Genre } = require("../models/genre");
const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  const movies = await Movies.find().sort({ name: 1 });
  res.send(movies);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre");

  const movie = new Movies({
    title: req.body.title,
    genre: {
      _id: genre.id,
      name: genre.name,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  });

  await movie.save();
  res.send(movie);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre");

  const movie = await Movies.findByIdAndUpdate(req.params.id, {
    $set: {
      title: req.body.title,
      genre: {
        _id: genre.id,
        name: genre.name,
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    },
  });
  if (!movie) return res.status(404).send("The movie cannot be found");
  res.send(movie);
});

router.delete("/:id", async (req, res) => {
  const movie = await Movies.findByIdAndRemove(req.params.id);
  if (!movie)
    return res.status(404).send("The movie with the given iD was not found");
  res.send(movie);
});

router.get("/:id", async (req, res) => {
  const movie = await Movies.findById(req.params.id);
  if (!movie)
    return res.status(404).send("The movie with the given iD was not found");
  res.send(movie);
});

module.exports = router;
