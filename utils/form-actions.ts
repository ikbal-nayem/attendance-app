export const makeFormData = (data: IObject) => {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] instanceof Object && data[key].uri) {
      const match = /\.(\w+)$/.exec(data[key].fileName);
      const type = match ? `image/${match[1]}` : 'image';
      formData.append(key, {
        uri: data[key].uri,
        name: data[key].fileName,
        type,
      });
      continue;
    }
    formData.append(key, data[key]);
  }
  return formData;
};
