import { errorResponse } from './../utils/apiResponse.js'

const errorHandler = (err, req, res, next) => {

  const statusCode = err.statusCode || 500;

  return errorResponse(res, err, null, statusCode);

};

export default errorHandler;
