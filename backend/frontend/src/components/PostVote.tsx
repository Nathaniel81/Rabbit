import { PostVoteRequest } from '@/lib/validators/vote';
import { usePrevious } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { useToast } from '@/hooks/useToast';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoteType } from '@/types/post';
import { getCsrfToken } from '@/lib/utils';
import { openModal } from '@/redux/slices/modalSlice';
import { AppDispatch } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { RootState } from '@/redux/rootReducer';
import { logout } from '@/redux/slices/authSlice';


interface PostVoteProps {
  postId: string | null | undefined;
  initialVotesAmt?: number;
  initialVote: VoteType | null | undefined;
}

const PostVote = ({
  postId,
  initialVotesAmt = 0,
  initialVote = null,
}: PostVoteProps) => {

  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const queryClient = useQueryClient();
  const queryKey = ['posts'];

  const userLogin = useSelector((state: RootState) => state.userInfo);
  const { user } = userLogin;


  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: PostVoteRequest = {
        voteType: type,
        postId: postId ?? '',
      }
      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken()
        },
      }
      try {
        await axios.patch(
          '/api/subrabbit/post/vote/',
           payload,
           config
        )
      } catch(err) {
        if (err instanceof AxiosError && err.response?.status === 401) {
          try {
            await axios.post('/api/user/refresh/', {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
                "x-csrftoken": getCsrfToken()
              },
            });
            const { data } = await axios.patch(
              '/api/subrabbit/post/vote/',
              payload, 
              config
            );
            return data as string
          } catch (refreshErr) {
            if (refreshErr instanceof AxiosError && (
              refreshErr.response?.status === 401 || refreshErr.response?.status === 400)) {
              dispatch(logout());
              // queryClient.invalidateQueries({ queryKey: queryKey, exact: true });
              dispatch(openModal('signin'));
            }
          }
        } 
        throw err;
      }

    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKey, exact: true });
    },
    onError: (err, voteType) => {
      if (voteType === 'UP') setVotesAmt((prev) => prev - 1)
      else setVotesAmt((prev) => prev + 1);

      // reset current vote
      const prevVoteOrDefault = prevVote || null;
      setCurrentVote(prevVoteOrDefault);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          dispatch(openModal('signin'));
        }
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your vote was not registered. Please try again.',
        variant: 'destructive',
      })
    },
    onMutate: (type: VoteType) => {
        if (currentVote === type) {
          // User is voting the same way again, so remove their vote
          setCurrentVote(null);
          if (type === 'UP') setVotesAmt((prev) => prev - 1);
          else if (type === 'DOWN') setVotesAmt((prev) => prev + 1);
        } else {
          // User is voting in the opposite direction, so subtract 2
          setCurrentVote(type);
          if (type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1));
          else if (type === 'DOWN')
            setVotesAmt((prev) => prev - (currentVote ? 2 : 1));
        }
    },
  })

  return (
    <div className='flex md:flex-col sm:flex-row gap-4 sm:gap-0 pr-6 sm:w-20 sm:mt-10 md:mt-0 pb-4 sm:pb-0'>
      {/* upvote */}
      <Button
        onClick={() => {
          if (!user) {
              dispatch(openModal('signin'));
              return toast({
                title: 'Login Required',
                description: 'Please login or create an account.',
                variant: 'destructive',
              });
          }
          return vote('UP');
        }}

        size='sm'
        variant='ghost'
        aria-label='upvote'>
        <ArrowBigUp
          className={cn('h-5 w-5 text-zinc-700', {
            'text-emerald-500 fill-emerald-500': currentVote === 'UP',
          })}
        />
      </Button>

      {/* score */}
      <p className='text-center py-2 font-medium text-sm text-zinc-900'>
        {votesAmt}
      </p>

      {/* downvote */}
      <Button
        onClick={() => {
          if (!user) {
              dispatch(openModal('signin'));
              return toast({
                title: 'Login Required',
                description: 'Please login or create an account.',
                variant: 'destructive',
              });
          }
          return vote('DOWN');
        }}
        size='sm'
        className={cn({
          'text-emerald-500': currentVote === 'DOWN',
        })}
        variant='ghost'
        aria-label='downvote'>
        <ArrowBigDown
          className={cn('h-5 w-5 text-zinc-700', {
            'text-red-500 fill-red-500': currentVote === 'DOWN',
          })}
        />
      </Button>
    </div>
  )
}

export default PostVote
