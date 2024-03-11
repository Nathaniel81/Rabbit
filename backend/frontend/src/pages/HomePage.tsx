import { loginWithGithub } from '@/redux/slices/authSlice';
import { AppDispatch } from '@/redux/store';
import { useEffect } from 'react';
import { useSelector, useDispatch} from 'react-redux'
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { RootState } from '@/redux/store';


function HomePage() {
  const [searchparams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const code = searchparams.get('code');
  const navigate = useNavigate();

  const userLogin = useSelector((state: RootState) => state.userInfo);
  const { loading } = userLogin;

  
  useEffect(() => {
    if (code) {
      dispatch(loginWithGithub(code));
      navigate('/')
    }
  }, [code, dispatch, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // If code is present in the URL, redirect to the same URL with hash
      window.location.href = window.location.origin + '/#' + window.location.pathname + window.location.search;
    }
  }, []);

  if (loading) <div className='mt-16'>Loading..</div>

  return (    
    <div className='mt-20 box'>
      <Link to='users/'>
        Users
      </Link>
    </div>
  );
}

export default HomePage;
