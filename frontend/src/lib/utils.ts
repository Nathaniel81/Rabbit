import { SubscribeToSubrabbitPayload } from '@/lib/validators/subrabbit';
import { openModal } from '@/redux/state';
import { Dispatch } from "@reduxjs/toolkit";
import axios, { AxiosError } from 'axios';
import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNowStrict } from 'date-fns';
import locale from 'date-fns/locale/en-US';
import { twMerge } from "tailwind-merge";


type Creator = {
  id: string;
}

type Subrabbit = {
  id: number;
  name: string;
  created_at: string;
  members_count: string;
  creator: Creator;
  isSubscriber: string;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))?.split('=')[1];
}

export const handleAxiosError = async (
  err: AxiosError, 
  dispatch: Dispatch, 
  payload: SubscribeToSubrabbitPayload, 
  subrabbit: Subrabbit
  ) => {
    
  if (err instanceof AxiosError && err.response?.status === 401) {
    try {
      await axios.post('/api/user/refresh/', {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken()
        },
      });
      const { data } = await axios.put(
        `/api/subrabbit/${subrabbit?.name}/subscribe/`,
         payload, 
        {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken()
        },
      });
      return data as string
    } catch (refreshErr) {
      if (refreshErr instanceof AxiosError && (
        refreshErr.response?.status === 401 || refreshErr.response?.status === 400)) {
        dispatch(openModal('signin'));
      }
    }
  }
  throw err;
}

const formatDistanceLocale = {
  lessThanXSeconds: 'just now',
  xSeconds: 'just now',
  halfAMinute: 'just now',
  lessThanXMinutes: '{{count}}m',
  xMinutes: '{{count}}m',
  aboutXHours: '{{count}}h',
  xHours: '{{count}}h',
  xDays: '{{count}}d',
  aboutXWeeks: '{{count}}w',
  xWeeks: '{{count}}w',
  aboutXMonths: '{{count}}m',
  xMonths: '{{count}}m',
  aboutXYears: '{{count}}y',
  xYears: '{{count}}y',
  overXYears: '{{count}}y',
  almostXYears: '{{count}}y',
}

function formatDistance(token: string, count: number, options?: any): string {
  options = options || {}

  const result = formatDistanceLocale[
    token as keyof typeof formatDistanceLocale
  ].replace('{{count}}', count.toString())

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return 'in ' + result
    } else {
      if (result === 'just now') return result
      return result + ' ago'
    }
  }

  return result
}

export function formatTimeToNow(date: Date): string {
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance,
    },
  })
}