import { sendError } from '../utils/response.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';

export const notFound = (req, res) => {
  sendError(
    res,
    404,
    API_ERROR_CODES.NOT_FOUND,
    'The requested resource was not found.',
    { requestId: req.id }
  );
};
