import { type MutableRefObject, useEffect, useRef, useState } from 'react';

interface UseFileUploadProps {
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
}
export const useFileUpload = ({ fileInputRef }: UseFileUploadProps) => {
  const [file, setFile] = useState<File | undefined>();
  const dataTransfer = useRef(new DataTransfer());

  useEffect(() => {
    if (file) {
      dataTransfer.current.items.add(file);

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.current.files;
      }
    } else {
      dataTransfer.current.items.clear();
    }
  }, [file, fileInputRef]);

  return {
    file,
    setFile,
  };
};
