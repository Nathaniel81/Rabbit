import { Link } from 'react-router-dom';


const Navbar = () => {
  return (
    <div className='bg-slate-600 text-lime-50 fixed top-0 w-full mx-auto text-center left-0 py-5 flex justify-center gap-3'>
      <Link to='/' className='btn py-2 bg-lime-700 px-3 rounded'>Home</Link>
      <Link to='/users' className='btn py-2 bg-lime-700 px-3 rounded'>
        Users
      </Link>
      <Link to='/sign-in' className='btn py-2 bg-lime-700 px-3 rounded'>
        Login
      </Link>
    </div>
  )
}

export default Navbar
