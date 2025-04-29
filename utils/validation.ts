export const isNull = (value: any) => {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    Object.keys(value).length === 0
  );
};
