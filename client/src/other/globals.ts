import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { SIZES } from './constants';

export const timeAgo = (date: string | number | Date) => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: uk,
  });
};

export const formatBytes = (bytes: number): string => {
  if (bytes == 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const result = (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + SIZES[i];
  return result
};

export const downloadFile = async (fileUrl: string, originalname: string) => {
	const key = fileUrl.split('/').pop();
  const res = await fetch(`/api/storage/download?filename=${key}&originalname=${originalname}`, {
    credentials: 'include',
  });

  const { url } = await res.json();

  const a = document.createElement('a');
  a.href = url;
  a.download = originalname;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

