import { useQuery } from 'react-query';
// import { Link } from 'react-router-dom';

interface Rabbit {
  id: string,
  name: string
}

function HomePage() {
  const { isLoading, data } = useQuery<Rabbit[]>('subrabbits', () =>
    fetch('/api/subrabbits/').then(res =>
      res.json()
    )
  );

  // if (error) return 'An error has occurred: ' + error.message;
  
  return (
    <>
      <div className='mt-20 box'>
        {isLoading ? 'Loading...' : (
          <>
            {data?.map((rabbit: Rabbit) => (
              <h1 key={rabbit.id}>{rabbit.name}</h1>
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default HomePage;
