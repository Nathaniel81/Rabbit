import { Link } from 'react-router-dom';

import { Icons } from './Icons';

const Navbar = () => {
  const userInfo = 'A';

  return (
      <div className='fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-[10] py-2'>
        <div className='box flex items-center justify-between gap-2'>
          <Link to='/' className='flex gap-2 items-center'>
            <Icons.logo className='h-8 w-8 sm:h-6 sm:w-6' />
            <p className='hidden text-zinc-700 text-sm font-medium md:block'>Rabbit</p>
          </Link>
        <div className="flex justify-between gap-5">
          {/* <SearchBar /> */}
          {userInfo ? (
          // <UserAccountNav />
          <div>HHH</div>
          ) : (
            <Link to='/sign-in'>
              Sign In
            </Link>
          )}
          </div>
        </div>
      </div>
  )
}

export default Navbar
