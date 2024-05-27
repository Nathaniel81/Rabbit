import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils'
import { CommentVoteRequest } from '@/lib/validators/vote';
import { usePrevious } from '@mantine/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { FC, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getCsrfToken } from '@/lib/utils';
import { Votes } from '@/types/post';
import { openModal, logout } from '@/redux/state';
import { AppDispatch, RootState } from '@/redux/store';

interface CommentVotesProps {
  commentId: string
  votesAmt: number
  currentVote?: Votes | undefined
}

enum VoteType {
  UP = 'UP',
  DOWN = 'DOWN'
}


const CommentVotes: FC<CommentVotesProps> = ({
  commentId,
  votesAmt: _votesAmt,
  currentVote: _currentVote,
}) => {

  const dispatch = useDispatch<AppDispatch>();
  const [votesAmt, setVotesAmt] = useState<number>(_votesAmt)
  const [currentVote, setCurrentVote] = useState(_currentVote)
  const prevVote = usePrevious(currentVote)
  const { toast } = useToast();
  const user = useSelector((state: RootState) => state.user);
  const queryClient = useQueryClient();
  const queryKey = ['postDetail'];

  const { mutate: vote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: CommentVoteRequest = {
        voteType: type,
        commentId,
      }
      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken()
        },
      }
      try {
        await axios.patch('/api/subrabbit/post/comment/vote/', payload, config)
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
              '/api/subrabbit/post/comment/vote/',
              payload, 
              config
            );
            return data as string
          } catch (refreshErr) {
            if (refreshErr instanceof AxiosError && (
              refreshErr.response?.status === 401 || refreshErr.response?.status === 400)) {
              dispatch(logout());
              queryClient.invalidateQueries({ queryKey: queryKey, exact: true });
              dispatch(openModal('signin'));
            }
          }
        } 
        throw err;
      }
    },
    onError: (err, voteType) => {
      if (voteType === 'UP') setVotesAmt((prev) => prev - 1)
      else setVotesAmt((prev) => prev + 1)

      // reset current vote
      setCurrentVote(prevVote)

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          dispatch(openModal('signin'))
          return toast({
              title: 'Unauthorized',
              description: 'Please Login.',
              variant: 'destructive',
            });
        }
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your vote was not registered. Please try again.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKey, exact: true })
      },
    onMutate: (type: VoteType) => {
      if (currentVote?.type === type) {
        // User is voting the same way again, so remove their vote
        setCurrentVote(undefined)
        if (type === 'UP') setVotesAmt((prev) => prev - 1)
        else if (type === 'DOWN') setVotesAmt((prev) => prev + 1)
      } else {
        // User is voting in the opposite direction, so subtract 2
        // @ts-expect-error __ _
        setCurrentVote({ type })
        if (type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
        else if (type === 'DOWN')
          setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
      }
    },
  })

  return (
    <div className='flex gap-1'>
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
          return vote(VoteType.UP)
        }}
        size='xs'
        variant='ghost'
        aria-label='upvote'>
        <ArrowBigUp
          className={cn('h-5 w-5 text-zinc-700', {
            'text-emerald-500 fill-emerald-500': currentVote?.type === 'UP',
          })}
        />
      </Button>

      {/* score */}
      <p className='text-center py-2 px-1 font-medium text-xs text-zinc-900'>
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
          return vote(VoteType.DOWN)
        }}
        size='xs'
        className={cn({
          'text-emerald-500': currentVote?.type === 'DOWN',
        })}
        variant='ghost'
        aria-label='downvote'>
        <ArrowBigDown
          className={cn('h-5 w-5 text-zinc-700', {
            'text-red-500 fill-red-500': currentVote?.type === 'DOWN',
          })}
        />
      </Button>
    </div>
  )
}

export default CommentVotes
