const express = require("express");
const crypto = require("node:crypto");
const movies = require("./movies.json");
const cors = require("cors");
const { validateMovie, validatePartialMovie } = require("./schemas/movies");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://movies.com",
        "https://example.com",
      ];

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return  callback(null, true); // Permitir el origen
      }

      if(!orihin) {
        return callback(null, true); // Permitir peticiones sin origen (como las de Postman)
      }

      return callback(new Error("Not allowed by CORS")); // Denegar el origen
    },
  })
);
app.disable("x-powered-by"); // Disable 'X-Powered-By' header for security

// metodos normales: GET/HEAD/POST
// metodos complejos: PUT/PATCH/DELETE // las peticiones complejas preguntan al
// servidor si pueden hacer la peticion con OPTIONS
// CORS PRE-FLIGHT
// OPTIONS

// const ACCEPTED_ORIGINS = [
//   "http://localhost:3000",
//   'http://localhost:5500',
//   'http://127.0.0.1:5500',
//   "http://movies.com",
//   "https://example.com",
// ];

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.get("/movies", (req, res) => {
  // Manera manual de habilitar CORS
  // const origin = req.header("origin");
  // // cuando la peticion es del mismo origin no envia la cabecera origin
  // // http://localhost:3000 -> http://localhost:3000
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   res.header("Access-Control-Allow-Origin", origin); // Permitir origin
  // }

  // En las request podemos acceder a la propiedad query y en la query tenemos un objeto
  // donde ya estan transformados todos los query params en un objeto
  const { genre } = req.query;

  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }

  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  // path-to-regex
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);

  res.status(404).json({ message: "Movie not found" });
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  if (result.error) {
    // Tambien se puede utilizar el 422 Unprocessable Entity pero es subjetivo
    // ya que normalmente se utiliza el codigo 400 Bad Request
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  // Una vez validados podemos hacerlo de la siguiente manera
  // en vez de usar la destructuracion de objetos

  const newMovie = {
    id: crypto.randomUUID(), // uuid v4
    ...result.data,
  };

  // const {
  //   title,
  //   genre,
  //   year,
  //   director,
  //   duration,
  //   rate,
  //   poster
  // } = req.body

  // Es mejor no validar los datos a mano, sino usar una libreria.
  // if (!title || !genre || !year || !director || !duration) {
  //   return res.status(400).json({ message: "Missing required fields" });
  // }

  // if (typeof year !== 'number') {
  //   return res.status(400).json({ message: "Year must be a number" });
  // }

  // if (typeof duration !== 'number') {
  //   return res.status(400).json({ message: "Duration must be a number" });
  // }

  // const newMovie = {
  //   id: crypto.randomUUID(), // uuid v4
  //   title,
  //   genre,
  //   director,
  //   year,
  //   duration,
  //   rate: rate ?? 0,
  //   poster
  // }

  // Esto no serie REST, porque estamos guardando
  // el estado de la aplicacion en memoria
  movies.push(newMovie);

  res.status(201).json(newMovie); // actualizar la cache del cliente
});

app.delete("/movies/:id", (req, res) => {
  // Manera manual de habilitar CORS
  // const origin = req.header("origin");
  // cuando la peticion es del mismo origin no envia la cabecera origin
  // http://localhost:3000 -> http://localhost:3000
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   res.header("Access-Control-Allow-Origin", origin); // Permitir origin
  // }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  movies.splice(movieIndex, 1); // Eliminar la pelicula del array

  return res.status(204).json({ message: "Movie deleted successfully" });
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body);

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1)
    return res.status(404).json({ message: "Movie not found" });

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updateMovie;

  return res.json(updateMovie);
});

// Manera manual para habilitar CORS y que no nos afecte el pre-flight
// app.options("/movies/:id", (req, res) => {
//   const origin = req.header("origin");
//   // cuando la peticion es del mismo origin no envia la cabecera origin
//   // http://localhost:3000 -> http://localhost:3000
//   if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//     res.header("Access-Control-Allow-Origin", origin); // Permitir origin
//     res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE"); // Permitir metodos
//   }

//   res.send(200)
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
