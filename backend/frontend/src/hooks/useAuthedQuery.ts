import { useQuery, useQueryClient, QueryFunction, QueryKey, UseQueryOptions, UseQueryResult } from 'react-query';
import axios, { AxiosError } from 'axios';
import { AppDispatch } from '@/redux/store';
import { useNavigate } from 'react-router-dom';
import { resetUserInfo } from '@/redux/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '@/redux/slices/modalSlice';
import { RootState } from '@/redux/rootReducer';

// eslint-disable-next-line
type QueryFn = QueryFunction<any, QueryKey>;
// eslint-disable-next-line
type Options = UseQueryOptions<any, AxiosError, any, QueryKey>;
// eslint-disable-next-line
const useAuthedQuery = (key: QueryKey, queryFn: QueryFn, options?: Options): UseQueryResult<any, AxiosError> => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userLogin = useSelector((state: RootState) => state.userInfo);
  const { user } = userLogin;

  const handleLogout = async () => {
    try {
      await axios.post('/api/user/logout/');
      localStorage.removeItem('userInfo');
      navigate('/');
      dispatch(resetUserInfo());
      dispatch(openModal('signin'));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleTokenRefresh = async () => {
    try {
      await axios.post('/api/user/refresh/', {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      queryClient.invalidateQueries(key);
    } catch (refreshError: unknown) {
      if (!user) {
        dispatch(openModal('signin'));
      }
      //@ts-expect-error 'response' does not exist error
      if (refreshError?.response?.status === 400) {
        handleLogout();
      }
    }
  };

  const query = useQuery(key, queryFn, {
    ...options,
    retry: false,
    onError: (error: AxiosError) => {
      if (error?.response?.status === 401) {
        handleTokenRefresh();
      }
    },
  });

  return query;
};

export default useAuthedQuery;
