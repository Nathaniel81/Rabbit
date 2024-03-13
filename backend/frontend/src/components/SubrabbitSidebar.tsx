import { Button, buttonVariants } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { SubscribeToSubrabbitPayload, SubrabbitSubscriptionValidator } from '@/lib/validators/subrabbit';
import { AppDispatch, RootState } from '@/redux/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleAxiosError, getCsrfToken } from '@/lib/utils';
import { Subrabbit } from '@/types/subrabbit';



type SubscribeComponentProps = {
  queryKey: string[];
  subrabbit: Subrabbit;
};

const SubrabbitSidebar = ({ subrabbit, queryKey }: SubscribeComponentProps) => {
  const userLogin = useSelector((state: RootState) => state.userInfo);
  const { user } = userLogin;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast()
  const queryClient = useQueryClient();
  const location = useLocation();
  const path = location.pathname;


  
  const { mutate: subscribe, isPending: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubrabbitPayload = {
        subrabbitId: subrabbit.id
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
        /*eslint-disable*/
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
          title: 'subscribed!',
          description: `You are now subscribed from/${subrabbit?.name}`,
        })
      },
  });

  const { mutate: unsubscribe, isPending: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubrabbitPayload = {
        subrabbitId: subrabbit.id
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
        return data as string
        /*eslint-disable*/
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
              onClick={() => subscribe()}
            >
              Join to post
            </Button>
          )
        ) : null}
        <div
          className={buttonVariants({
            variant: 'outline',
            className: 'w-full mb-6 cursor-pointer',
          })}
          onClick={()=> navigate(path + `/submit`)}>
          Create Post
        </div>
    </dl>
  )
}

export default SubrabbitSidebar
