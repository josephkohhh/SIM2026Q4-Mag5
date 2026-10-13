import { useEffect,useState } from "react"

function Favourite({ currentUser }){
  const [favourite_list, setFavourite_list] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setFavourite_list([])
    setError('')

    if (!currentUser) {
      setLoading(false)
      return () => controller.abort()
    }
    async function get_favourite() {
      setLoading(true)
      try {
        const response = await fetch(`http://127.0.0.1:8000/favourite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: currentUser,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to read favourite: ${response.status}`)
        }

        const data = await response.json()
        setFavourite_list(data)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    get_favourite()

        return () => controller.abort()
    }, [currentUser])

    if (!currentUser) {
    return <p>Please log in to view your favourites.</p>
    }
    
  return (
    <div>
      <h1>Favourite</h1>

      {error && <p style={{ color: 'tomato' }}>{error}</p>}

      {!loading && !error && favourite_list.length === 0 && <p>No Data Found.</p>}

      {!loading && !error && favourite_list.map((item, index) => (
        <div className="project-card" key={index}>
          <h2>{item.name}</h2>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  )
}

export default Favourite