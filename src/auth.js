import jwt from "jsonwebtoken";

export default (request) => {
  const authHeader = request.req.headers.authorization;
  const [scheme, token] = authHeader
    ? authHeader.split(" ")
    : [undefined, undefined];

  if (!token || token === null || !/^Bearer$/i.test(scheme))
    return { authenticated: false };

  let data;
  try {
    data = jwt.verify(token, privateKey);
  } catch (err) {
    return { authenticated: false };
  }

  // in case any error found
  if (!!!data) return { authenticated: false };

  // token decoded successfully, and extracted data
  return { authenticated: true, ...data };
};
