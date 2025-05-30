const sanitizedQuery = (query) => {
  return query
    .trim()
    .toLowerCase()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export default sanitizedQuery;
