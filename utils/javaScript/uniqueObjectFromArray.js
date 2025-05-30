const uniqueObjectFromArray = (array, variable = "_id") => {
  if (!Array.isArray(array)) return array;

  const unique = [
    ...new Map(
      array
        .filter((f) => f[variable] !== undefined)
        .map((f) => [f[variable], f])
    ).values(),
  ];

  return unique;
};

export default uniqueObjectFromArray;
