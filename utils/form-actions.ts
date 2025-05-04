export const makeFormData = (data: IObject) => {
  const formData = new FormData();
  for (const key in data) {
    try {
      if (data[key] instanceof Array && data[key]?.length > 0 && data[key][0]?.uri) {
        data[key].forEach((file: any) => {
          const match = /\.(\w+)$/.exec(file?.name || '');
          const type = match ? `image/${match[1]}` : 'jpeg';
          formData.append(key, { ...file, type });
        });
        continue;
      }
      if (typeof data[key] === 'string' && data[key]?.startsWith('file:///')) {
        const fileName = data[key].split('/').pop();
        const match = /\.(\w+)$/.exec(fileName || '');
        const type = match ? `image/${match[1]}` : 'image';
        formData.append(key, {
          uri: data[key],
          name: fileName,
          type,
        } as unknown as Blob);
        continue;
      }
      formData.append(key, data[key]);
    } catch (e) {
      console.error('Error in makeFormData', e);
    }
  }
  return formData;
};
