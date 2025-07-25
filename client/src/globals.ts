import type { User } from "./types/user";
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';

export const timeAgo = (date: string | number | Date) => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: uk,
  });
};