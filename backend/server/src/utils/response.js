export const sendSuccess = (res, data, meta = undefined) => {
  return res.json({
    success: true,
    data,
    ...(meta && { meta }),
  });
};

export const sendError = (res, statusCode, code, message, meta = undefined) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
    ...(meta && { meta }),
  });
};
