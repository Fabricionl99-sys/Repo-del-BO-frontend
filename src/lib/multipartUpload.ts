/**
 * Config Axios compartido para uploads multipart.
 * El browser setea Content-Type con el boundary correcto si NO ponemos
 * el default JSON de axios.
 */
export function multipartRequestConfig() {
  return {
    transformRequest: (data: unknown, headers: Record<string, string>) => {
      if (data instanceof FormData) {
        delete headers['Content-Type'];
      }
      return data;
    },
  };
}

export const STORAGE_UPLOAD_FILE_FIELD = 'file';
