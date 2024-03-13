import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AxiosError } from 'axios';
import axios from 'axios';
import { openModal } from "@/redux/slices/modalSlice";
import { SubscribeToSubrabbitPayload } from '@/lib/validators/subrabbit';
import { Dispatch } from "@reduxjs/toolkit";


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
