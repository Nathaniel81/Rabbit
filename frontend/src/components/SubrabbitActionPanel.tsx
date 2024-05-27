import { Button, buttonVariants } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { getCsrfToken, handleAxiosError } from '@/lib/utils';
import {
  SubrabbitSubscriptionValidator,
  SubscribeToSubrabbitPayload
} from '@/lib/validators/subrabbit';
import { RootState } from '@/redux/store';
import { SubrabbitData } from '@/types/subrabbit';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { openModal } from '@/redux/state';


const SubrabbitActionPanel = () => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const location = useLocation();
  const path = location.pathname;
  const pathname = location.pathname

  const parts = pathname.split('/');
  const queryClient = useQueryClient();
  const queryKey = [`subrabbitDetail ${parts[2]}`];

  const subrabbit = queryClient.getQueryData<SubrabbitData>(queryKey);
  
  const { mutate: subscribe, isPending: isSubLoading } = useMutation({
    mutationFn: async () => {
      if (!subrabbit) {
        throw new Error("Subrabbit is undefined");
      }
      const payload: SubscribeToSubrabbitPayload = {
        subrabbitId: subrabbit?.id || 0
      }
      const result = SubrabbitSubscriptionValidator.safeParse(payload);
      if (!result.success) {
        console.error(result.error);
        throw new Error(result.error.errors[0].message);
      }
      try {
        const { data } = await axios.put(`/api/subrabbit/${subrabbit?.name}/subscribe/`, payload, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "x-csrftoken": getCsrfToken()
          },
        });
        return data as string
        //eslint-disable-next-line
      } catch (err: any) {
        return handleAxiosError(err, dispatch, payload, subrabbit);
      }
    },
    onError: (err) => {
      console.log(err);
      return toast({
        title: 'There was a problem.',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },    
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKey, exact: true });
        toast({
          title: 'subscribed!',
          description: `You are now subscribed from/${subrabbit?.name}`,
        });
      },
  });

  const { mutate: unsubscribe, isPending: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      if (!subrabbit) {
        throw new Error("Subrabbit is undefined");
      }
      const payload: SubscribeToSubrabbitPayload = {
        subrabbitId: subrabbit?.id || 0
      }
      const result = SubrabbitSubscriptionValidator.safeParse(payload);
      if (!result.success) {
        console.error(result.error);
        throw new Error(result.error.errors[0].message);
      }
      try {
        const { data } = await axios.put(`/api/subrabbit/${subrabbit?.name}/unsubscribe/`, payload, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "x-csrftoken": getCsrfToken()
          },
        });
        return data as string;
        //eslint-disable-next-line
      } catch (err: any) {
        return handleAxiosError(err, dispatch, payload, subrabbit);
      }
    },
    onError: (err) => {
      console.log(err)
      return toast({
        title: 'There was a problem.',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },    
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKey, exact: true });
        toast({
          title: 'unsubscribed!',
          description: `You are now unsubscribed from/${subrabbit?.name}`,
        })
      },
  });
  

  return (
    <dl className='divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white'>
        <div className='flex justify-between gap-x-4 py-3'>
           <dt className='text-gray-500'>Created</dt>
           <dd className='text-gray-700'>
            {/* Display creation date */}
             {subrabbit?.created_at && (
               <time dateTime={new Date(subrabbit?.created_at).toDateString()}>
                 {format(new Date(subrabbit?.created_at), 'MMMM d, yyyy')}
               </time>
             )}
           </dd>
        </div>
        <div className='flex justify-between gap-x-4 py-3'>
          <dt className='text-gray-500'>Members</dt>
          <dd className='flex items-start gap-x-2'>
            <div className='text-gray-900'>{subrabbit?.members_count}</div>
          </dd>
        </div>
        {/* Conditional rendering for subscription */}
        {subrabbit?.creator?.id === user?.user_id ? (
          <div className='flex justify-between gap-x-4 py-3'>
            <dt className='text-gray-500'>You created this community</dt>
          </div>
        ) : null}

        {subrabbit?.creator?.id !== user?.user_id ? (
          subrabbit?.isSubscriber ? (
            <Button
              className='w-full mt-1 mb-4'
              isLoading={isUnsubLoading}
              onClick={() => unsubscribe()}
            >
              Leave community
            </Button>
          ) : (
            <Button
              className='w-full mt-1 mb-4'
              isLoading={isSubLoading}
              onClick={() => {
                if (!user) {
                  toast({
                    title: 'Login Required',
                    description: 'Please login or create an account.',
                    variant: 'destructive',
                  });
                  return dispatch(openModal('signin'));
                }
                subscribe();
              }}>
              Join to post
            </Button>
          )
        ) : null}
        {/* Create Post button */}
        {subrabbit?.isSubscriber && 
          <div
            className={buttonVariants({
              variant: 'outline',
              className: 'w-full mb-6 cursor-pointer',
            })}
            onClick={()=> navigate(path + `/submit`)}>
            Create Post
          </div>
        }
    </dl>
  )
};

export default SubrabbitActionPanel;
