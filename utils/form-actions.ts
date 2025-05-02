export const makeFormData = (data: IObject) => {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] instanceof Object && data[key].uri) {
      formData.append(key, {
        uri: data[key].uri,
        name: data[key].fileName,
        type: data[key].type,
      });
      continue;
    }
    formData.append(key, data[key]);
  }
  return formData;
};
