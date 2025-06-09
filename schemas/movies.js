const z = require("zod");

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required.",
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: "Poster must be a valid URL",
  }),
  genre: z.array(
    z.enum([
      "Action",
      "Adventure",
      "Comedy",
      "Drama",
      "Fantasy",
      "Horror",
      "Romance",
      "Sci-Fi",
      "Thriller",
      "Western",
      'Crime'
    ]),
    {
      required_error: "Movie genre is requiered.",
      invalid_type_error: "Movie genre must be an array of enum Genre",
    }
  ),
});

function validateMovie (object) {
    // El safeParse devuelve un objeto con dos propiedades:
    // - success: booleano que indica si la validación fue exitosa o no
    // - data: si success es true, contiene el objeto validado
    // - error: si success es false, contiene un objeto con los errores de validación
    //   - issues: un array de objetos con los errores de validación
    //   - code: el código del error     
    return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  // partial() permite que todos los campos sean opcionales
   return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}