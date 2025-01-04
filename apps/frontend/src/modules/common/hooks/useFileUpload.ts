import { type MutableRefObject, useEffect, useState } from 'react';

interface UseFileUploadProps {
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
}
export const useFileUpload = ({ fileInputRef }: UseFileUploadProps) => {
  const [file, setFile] = useState<File | undefined>();

  useEffect(() => {
    let dataTransfer: DataTransfer;

    if (file) {
      dataTransfer = new DataTransfer();

      dataTransfer.items.add(file);

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  }, [file, fileInputRef]);

  return {
    file,
    setFile,
  };
};
