import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import './favourite.css';

function Favourite({ currentUser }){
  const navigate = useNavigate();
  const currentEmail = localStorage.getItem("currentEmail")
  const [favourite_list, setFavourite_list] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("All");
  const [categories, setCategories] = useState([]);
  const styles = ["All", ...categories.map((category) => category.category_code)];
  const [currentPage, setCurrentPage] = useState(1);
  const projectPerPage = 9;

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch("http://127.0.0.1:8000/categories", {
          signal: controller.signal,
        });
        if (!response.ok) {throw new Error(`HTTP ${response.status}`);}
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.categories ?? [];
        if (!controller.signal.aborted) {setCategories(items);}
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load categories:", error);
        }
      }
    }

    loadCategories();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController()

    if (!currentUser) {
      return () => controller.abort()
    }
    async function get_favourite() {
      setFavourite_list([])
      setError('')
      setLoading(true)
      try {
        const response = await fetch(`http://127.0.0.1:8000/favourite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: currentEmail,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to read favourite: ${response.status}`)
        }

        const data = await response.json()
        const formattedData = data.map((project) => ({
          id: project[0],
          name: project[1],
          description: project[2],
          style: project[3],
        }));

        const projectsWithImages = await Promise.all(
          formattedData.map(async (project) => {
            const projectId = project.id;
            if (projectId == null) {return { ...project, image: null, company: null };}

            const companyPromise = fetch(`http://127.0.0.1:8000/projects/${projectId}/company`, {
              signal: controller.signal,
              cache: "no-store",
            }).then(async (response) => {
              if (!response.ok) {throw new Error(`HTTP ${response.status}`);}
              const companyData = await response.json();
              return companyData.company?.status === "ACTIVE" ? companyData.company : null;
            }).catch((error) => {
              if (!controller.signal.aborted) {
                console.error(`Failed to load company for project ${projectId}:`, error);
              }
              return null;
            });

            try {
              const imageResponse = await fetch(`http://127.0.0.1:8000/projects/${projectId}/images`, {
                signal: controller.signal,
              });
              if (!imageResponse.ok) {throw new Error(`HTTP ${imageResponse.status}`);}
              const imageData = await imageResponse.json();
              const coverImage = (imageData.images ?? []).find((image) => image.is_cover === true);
              return { ...project, image: coverImage?.image_url ?? null, company: await companyPromise };
            } catch (error) {
              if (error.name === "AbortError") {throw error;}
              console.error(`Failed to load cover for project ${projectId}:`, error);
              return { ...project, image: null, company: await companyPromise };
            }
          })
        );

        if (!controller.signal.aborted) {
          setFavourite_list(projectsWithImages);
          setCurrentPage(1);
        }
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
    }, [currentEmail, currentUser])

    if (!currentUser) {
    return <p>Please log in to view your favourites.</p>
    }

  const filteredProjects = favourite_list.filter((project) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      (project.name || "").toLowerCase().includes(keyword) ||
      (project.description || "").toLowerCase().includes(keyword) ||
      (project.company?.status === "ACTIVE" &&
        (project.company.company_name || "").toLowerCase().includes(keyword));

    const matchesStyle = selectedStyle === "All" || project.style === selectedStyle;

    return matchesSearch && matchesStyle;
  });
  const totalPages = Math.ceil(
  filteredProjects.length / projectPerPage
  );
  const startIndex = (currentPage - 1) * projectPerPage;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + projectPerPage
  );

  function viewProject(projectId) {
    navigate(`/projects/${projectId}`);
  }

  async function remove_project(projectId){
    const confirmed = window.confirm(
      "Are you sure you want to remove this project from your favourites?");
      if (!confirmed) {return;}

    try{
      const response = await fetch(`http://127.0.0.1:8000/favourite/remove`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          email: currentEmail,
          project_id: projectId,
        }),
      })
        if (!response.ok) {throw new Error(`Failed to remove favourite: ${response.status}`);}
        setFavourite_list((prev) =>prev.filter((project) => project.id !== projectId));
        const remainingCount = filteredProjects.length - 1;
        setCurrentPage((prev) => Math.min( prev, Math.max(1, Math.ceil(remainingCount / projectPerPage))));
      } catch (error) {
        alert(error.message);
      }
  }

  return (
    <div className="favourite-page">
      <section className="favourite-search-section">
        <span className="favourite-eyebrow">Your Favourite</span>
        <div className="favourite-search-box">
          <input type="text" placeholder="Search projects or companies" value={search} onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}/>
          <Search className="favourite-search-icon" size={23} />
        </div>
        <div className="favourite-style-filters">
          {styles.map((style) => (
            <button type="button" key={style} className={selectedStyle === style ? "favourite-style-button active" : "favourite-style-button"} onClick={() => {setSelectedStyle(style); setCurrentPage(1);}}>{style}</button>
          ))}
        </div>
      </section>
      <section className="favourite-section">
        <div className="favourite-section-heading">
          <div>
            <span className="favourite-eyebrow">Saved Project</span>
            <h2>Interior Design Projects</h2>
          </div>
        </div>
        {loading && <p className="favourite-empty" role="status">Loading favourites...</p>}
        {error && <p className="favourite-empty" role="alert">{error}</p>}
        {!loading && !error && (
          <>
            <div className="favourite-grid">
              {paginatedProjects.map((project) => (
                <div className="favourite-card" key={project.id}>
                  <div className="favourite-image">
                    {project.image ? (<img src={project.image} alt={project.name || "Interior design project"}/>) : (<div className="favourite-placeholder">Interior Design Cover Picture</div>)}
                    {project.style && (<span className="favourite-tag">{project.style}</span>)}
                  </div>
                  <div className="favourite-info">
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <div className="favourite-actions">
                      <button
                        type="button"
                        className="favourite-view-button"
                        onClick={() => viewProject(project.project_id ?? project.id)}>View Project</button>
                      <button
                        type="button"
                        className="favourite-remove-button"
                        onClick={() => remove_project(project.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
            <div className="pagination">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button type="button"key={index + 1}className={currentPage === index + 1 ? "active" : ""}onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
              ))}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </div>)}

            {filteredProjects.length === 0 && (
              <p className="favourite-empty">
                No projects found
              </p>
            )}
          </>
        )}
      </section>
    </div>
)}

export default Favourite;
