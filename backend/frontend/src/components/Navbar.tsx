import { Link } from 'react-router-dom';
import { Icons } from './Icons';
import { buttonVariants } from './ui/Button';
import { openModal } from '@/redux/slices/modalSlice'
import { useDispatch } from 'react-redux'


const Navbar = () => {
  const userInfo = false;
  const dispatch = useDispatch();

  const signIn = () => {
    dispatch(openModal('signin'))
  }


  return (
      <div className='fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-[10] py-2'>
        <div className='box flex items-center justify-between gap-2'>
          <Link to='/' className='flex gap-2 items-center'>
            <Icons.logo className='h-10 w-10 sm:h-8 sm:w-8' />
            <p className='hidden text-zinc-700 text-sm font-medium md:block'>Rabbit</p>
          </Link>
        <div className="flex justify-between gap-5">
          {/* <SearchBar /> */}
          {userInfo ? (
          // <UserAccountNav />
          <div>HHH</div>
          ) : (
            <div className={`${buttonVariants()} cursor-pointer`}
            onClick={signIn}>
              Sign In
            </div>
          )}
          </div>
        </div>
      </div>
  )
}

export default Navbar
