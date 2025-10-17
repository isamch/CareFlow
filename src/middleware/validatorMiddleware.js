
export const validate = (schema) => {

  return (req, res, next) => {
    
    if (!req.body || Object.keys(req.body).length === 0) {
      throw { message: "Request body is required", statusCode: 400 };
    }

    const { error } = schema.validate(req.body, { abortEarly: false });   // { abortEarly: false }); : stp in first error


    if (error) {
      const messages = {};

      for (const err of error.details) {
        messages[err.path[0]] = err.message;
      }

      throw { message: messages, statusCode: 400 };
    }

    next();

  };

};
