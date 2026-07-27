const requestLogger = (req, res, next) => {
  const originalJson = res.json.bind(res);
  let responseBody;

  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    console.log({
      input: {
        body: req.body,
        params: req.params,
        query: req.query,
      },
      endpoint: `${req.method} ${req.originalUrl}`,
      output: responseBody,
      statusCode: res.statusCode,
    });
  });

  next();
};

module.exports = requestLogger;
