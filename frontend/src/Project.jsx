import { useEffect, useState } from 'react'
import './project.css'

const API = 'http://127.0.0.1:8000'

function Project({ currentUser }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("All");
  const styles = [
    "All",
    "Residential",
    "Commercial",
    "Kitchen",
    "Bathroom",
    "Luxury"
  ];

  const filteredProjects = projects.filter((project) => {
    const keyword = search.toLowerCase();
    const matchesSearch =
      (project.name || "").toLowerCase().includes(keyword) ||
      (project.description || "").toLowerCase().includes(keyword);

    const matchesStyle =
      selectedStyle === "All" ||
      project.style === selectedStyle;

    return matchesSearch && matchesStyle;
  });

  useEffect(() => {
    const controller = new AbortController()
    async function loadProjects() {
      try {
        const response = await fetch(`${API}/projects`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('${response.status}')
        }
        const data = await response.json()
        const items = Array.isArray(data) ? data : data.projects
        setProjects(items)
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
    loadProjects()
    return () => controller.abort()
  }, [])

  async function addFavourite(projectId) {
    if (!currentUser) {
      alert('Please log in first')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`${API}/addTofavourites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser,
          project_id: projectId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || data.detail || 'Failed to add favourite'
        )
      }

      alert(data.message || 'Added to favourites!')
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="project-page">
      {/* Search Section */}
      <section className="project-search-section">
        <span className="project-eyebrow">EXPLORE IDEAS</span>
        <h2>Find your inspiration</h2>
        <p>Browse designs that match your personal style.</p>
        <div className="project-search-box">
          <input
            type="text"
            placeholder="Search interior design projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="project-search-icon">⌕</span>
        </div>
        <div className="project-style-filters">
          {styles.map((style) => (
            <button
              key={style}
              className={
                selectedStyle === style
                  ? "project-style-button active"
                  : "project-style-button"
              }
              onClick={() => setSelectedStyle(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      {/* Project Cards */}
      <section className="project-section">
        <div className="project-section-heading">
          <div>
            <span className="project-eyebrow">DISCOVER PROJECTS</span>
            <h2>Interior Design Projects</h2>
          </div>
          <p>Explore designs for your next renovation.</p>
        </div>

        {loading && <p>Loading projects...</p>}

        {error && <p style={{ color: "tomato" }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="project-grid">
              {filteredProjects.map((project) => (
                <article
                  className="project-card"
                  key={project.id}
                >
                  <div className="project-image">
                    {project.image ? (
                      <img src={project.image} alt={project.name} />
                    ) : (
                      <div className="project-placeholder">
                        Interior Design
                      </div>
                    )}

                    {project.style && (
                      <span className="project-tag">
                        {project.style}
                      </span>
                    )}
                  </div>

                  <div className="project-info">
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>

                    <button
                      className="project-favourite-button"
                      disabled={saving}
                      onClick={() => addFavourite(project.id)}
                    >♡ Favourite</button>
                  </div>
                </article>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <p className="project-empty">
                No projects found.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
export default Project;