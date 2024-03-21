import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/hooks/useToast'
import { CreateSubrabbitPayload } from '@/lib/validators/subrabbit'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useState } from 'react'
import {  AppDispatch } from '@/redux/store'
import { openModal } from '@/redux/slices/modalSlice';

import { useNavigate } from 'react-router-dom'
import { useDispatch} from 'react-redux'
import { SubrabbitValidator } from '@/lib/validators/subrabbit'
import { getCsrfToken } from '@/lib/utils'


const CreateSubrabbitPage = () => {
  const [input, setInput] = useState<string>('');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();


  const { mutate: createCommunity, isPending } = useMutation({
    mutationFn: async () => {
      const payload: CreateSubrabbitPayload = {
        name: input,
      }

      const result = SubrabbitValidator.safeParse(payload);

      if (!result.success) {
        throw new Error(result.error.errors[0].message);
      }
      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken()
        },
      }
      const { data } = await axios.post('/api/subrabbits/', payload, config )
      return data as string
    },
    /* eslint-disable-next-line */
    onError: (err: any) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: 'Subreddit already exists.',
            description: 'Please choose a different name.',
            variant: 'destructive',
          })
        }

        if (err.response?.status === 422) {
          return toast({
            title: 'Invalid subreddit name.',
            description: 'Please choose a name between 3 and 21 letters.',
            variant: 'destructive',
          })
        }

        if (err.response?.status === 401) {
          dispatch(openModal("signin"))
          toast({
            title: 'Log In Required.',
            description: 'Please log in or sign up to create a community.',
            variant: 'destructive',
          })
          return;
        }
      }

      toast({
        title: 'There was an error.',
        description: err.message,
        variant: 'destructive',
      })
    },
    
    onSuccess: (data) => {
      navigate(`/r/${data}`)
    },
  })

  return (
    <div className='container flex items-center h-full max-w-3xl mx-auto'>
      <div className='relative bg-white w-full h-fit p-4 rounded-lg space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-xl font-semibold'>Create a Community</h1>
        </div>
        <hr className='bg-red-500 h-px' />
        {/* Community name input */}
        <div>
          <p className='text-lg font-medium'>Name</p>
          <p className='text-xs pb-2'>
            Community names including capitalization cannot be changed.
          </p>
          <div className='relative'>
            {/* Prefix for community name */}
            <p className='absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400'>
              r/
            </p>
            {/* Input field for community name */}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className='pl-6'
            />
          </div>
        </div>
        <div className='flex justify-end gap-4'>
          {/* Cancel button */}
          <Button
            disabled={isPending}
            variant='subtle'
            onClick={() => navigate(-1)}>
            Cancel
          </Button>
          {/* Create community button */}
          <Button
            isLoading={isPending}
            disabled={input.length === 0}
            onClick={() => createCommunity()}>
            Create Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateSubrabbitPage;
