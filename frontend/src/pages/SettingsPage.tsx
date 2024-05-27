import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { getCsrfToken } from '@/lib/utils';
import { UsernameValidator } from '@/lib/validators/username';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import * as z from 'zod';

import { Icons } from "@/components/Icons";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import { useSelector } from 'react-redux';

import { 
  logout, 
  openModal, 
  updateProfilePicture, 
  updateUsername 
} from '@/redux/state';
import { AppDispatch, RootState } from '@/redux/store';
import { useDispatch } from 'react-redux';


type FormData = z.infer<typeof UsernameValidator>

export default function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const userInfo = useSelector((state: RootState) => state.user);
  const [profilePictureUrl, setProfilePictureUrl] = useState(userInfo?.profile_picture || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [isNameChanged, setIsNameChanged] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
  if (!userInfo) {
    navigate('/');
  }
  },[userInfo, navigate]);

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      username: userInfo?.username || '',
    },
  });

  const handleClick = () => {
    fileInput?.current?.click();
  }

  const username = watch('username');
  useEffect(() => {
    if (username !== userInfo?.username) {
      setIsNameChanged(true);
    } else {
      setIsNameChanged(false);
    }
  }, [username, userInfo?.username]);

  useEffect(() => {
    setProfilePictureUrl(userInfo?.profile_picture || '');
  }, [userInfo?.profile_picture])

  const handleProfilePictureSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    if (selectedFile) {
      formData.append('profile_picture', selectedFile);
    }
    try {
      const config = {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          "x-csrftoken": getCsrfToken()
        },
      }
      const { data } = await axios.patch(`api/user/profile-picture/`, formData, config)
      dispatch(updateProfilePicture(data.profile_picture));
      setSelectedFile(null);
      toast({
        description: 'Your profile picture has been updated.',
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast({
            title: 'Username already taken.',
            description: 'Please choose another username.',
            variant: 'destructive',
          })
        }
        if (error.response?.status === 401) {
          toast({
            title: 'Login Required.',
            description: 'Please login to proceed.',
            variant: 'destructive',
          })
          dispatch(logout());
          dispatch(openModal('signin'));
          return;
        }
      }
      toast({
        title: 'Something went wrong.',
        description: 'Your profile picture was not updated. Please try again.',
        variant: 'destructive',
      })
    }
    setIsLoading(false);
  }

  const handleUsernameSubmit = handleSubmit(async (values) => {
    setNameLoading(true);
    try {
      const config = {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          "x-csrftoken": getCsrfToken()
        },
      }
      const { data } = await axios.patch(`api/user/username/`, values, config)
      dispatch(updateUsername(data.username));
      toast({
        description: 'Your username has been updated.',
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast({
            title: 'Username already taken.',
            description: 'Please choose another username.',
            variant: 'destructive',
          })
        }
        if (error.response?.status === 401) {
          toast({
            title: 'Login Required.',
            description: 'Please login to proceed.',
            variant: 'destructive',
          })
          // dispatch(logout());
          dispatch(openModal('signin'));
          return;
        }
      }
      toast({
        title: 'Something went wrong.',
        description: 'Your username was not updated. Please try again.',
        variant: 'destructive',
      })
    }
    setNameLoading(false);
  })

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      const newImgURL = URL.createObjectURL(file);
      setProfilePictureUrl(newImgURL);
    } else {
      setSelectedFile(null);
    }
  };
  

  return (
    <div className='max-w-4xl mx-auto py-12 mt-7'>
      <div className='grid items-start gap-8'>
        <h1 className='font-bold text-3xl md:text-4xl mt-4'>Settings</h1>
        <div className='grid gap-10'>
          {/* Username update form */}
          <form
            onSubmit={handleSubmit(() => handleUsernameSubmit())}>
            <Card>
              <CardHeader>
                <CardTitle>Your username</CardTitle>
                <CardDescription>
                  Please enter a display name you are comfortable with.
                </CardDescription>
              </CardHeader>
                <CardContent>
                  <div className='relative grid gap-1'>
                    <div className='absolute top-0 left-0 w-8 h-10 grid place-items-center'>
                      <span className='text-sm text-zinc-400'>u/</span>
                    </div>
                    <Label className='sr-only' htmlFor='name'>
                      Name
                    </Label>
                    <Input
                      id='name'
                      className='w-[400px] pl-6'
                      size={32}
                      value={username}
                      {...register('username')}
                    />
                    {errors?.username && (
                      <p className='px-1 text-xs text-red-600'>{errors.username.message}</p>
                    )}
                  </div>
                </CardContent>
              <CardFooter>
                <Button 
                  isLoading={nameLoading} 
                  disabled={!isNameChanged || nameLoading}>
                    Change name
                </Button>
              </CardFooter>
            </Card>
          </form>
          {/* Profile picture update form */}
          <form
            className=""
            onSubmit={(e) => handleProfilePictureSubmit(e)}
            >
            <Card>
              <CardHeader>
                <CardTitle>Your profile picture</CardTitle>
                <CardDescription>
                  Please select a profile picture you'd like to use.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='relative grid gap-1'>
                  <input
                    ref={fileInput}
                    type='file'
                    hidden
                    onChange={handleFileChange}
                  />
                  <Avatar className='h-8 w-8 cursor-pointer' onClick={handleClick}>
                    <div className='relative aspect-square h-full w-full'>
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt='profile picture'
                          referrerPolicy='no-referrer'
                          className='h-full object-cover'
                        />
                      ) : (
                        <Icons.user className='h-5 w-5' />
                      )}
                    </div>
                  </Avatar>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  isLoading={isLoading} 
                  disabled={!selectedFile || isLoading}>
                    Change profile picture
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
