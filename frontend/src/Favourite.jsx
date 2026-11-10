import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import './favourite.css';
import defaultImage from './Image/ProjectDefaultImage.png';

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
  const viewerUserId = Number(localStorage.getItem("currentUserId"));

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch("http://127.0.0.1:8000/get_all_idpcategory", {
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
        const response = await fetch(`http://127.0.0.1:8000/get_all_favorite/${viewerUserId}`, {
          method: 'GET',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to read favourite: ${response.status}`)
        }

        const data = await response.json();
        const favourites = Array.isArray(data) ? data : [];
        const projectsResponse = await fetch(
          "http://127.0.0.1:8000/get_all_project",
          { signal: controller.signal }
        );

        if (!projectsResponse.ok) {
          throw new Error(`HTTP ${projectsResponse.status}`);
        }

        const projectsData = await projectsResponse.json();
        const projects = Array.isArray(projectsData)
          ? projectsData
          : projectsData.projects ?? [];

        const projectMap = new Map(
          projects.map((project) => [String(project.project_id), project])
        );
        const formattedData = favourites
          .map((favourite) => {
            const project = projectMap.get(String(favourite.project_id));

            return project
              ? {
                  ...project,
                  favourite_id: favourite.favourite_id,
                }
              : null;
          })
          .filter(Boolean);
        const projectsWithImages = await Promise.all(
          formattedData.map(async (project) => {
            let company = null;
            try {
              const companyResponse = await fetch(
                `http://127.0.0.1:8000/get_companyprofile/${project.user_id}`,
                { signal: controller.signal }
              );
              if (!companyResponse.ok) {
                throw new Error(`HTTP ${companyResponse.status}`);
              }
              const companyData = await companyResponse.json();

              company = companyData.company_profile?.status === "ACTIVE"
                ? companyData.company_profile
                : null;
            } catch (error) {
              if (error.name === "AbortError") throw error;
              console.error("Failed to load company:", error);
            }
            return {
              ...project,
              id: project.project_id,
              name: project.project_name,
              style: project.category_code,
              company,
              image: defaultImage,
            };
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
    }, [viewerUserId, currentUser]);

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

  async function remove_project(projectId) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this project from your favourites?"
    );

    if (!confirmed) return;

    try {
      const favourite = favourite_list.find(
        (project) => String(project.id) === String(projectId)
      );
      if (!favourite) {
        throw new Error("Favourite record not found.");
      }
      const response = await fetch(
        `http://127.0.0.1:8000/delete_favorite/${favourite.favourite_id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error(`Failed to remove favourite: ${response.status}`);
      }
      setFavourite_list((prev) =>
        prev.filter((project) => String(project.id) !== String(projectId))
      );
      const remainingCount = Math.max(0, filteredProjects.length - 1);
      setCurrentPage((prev) =>
        Math.min(
          prev,
          Math.max(1, Math.ceil(remainingCount / projectPerPage))
        )
      );
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
                    <img
                      src={project.image || defaultImage}
                      alt={project.name || "Interior design project"}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultImage;
                      }}
                    />
                    {project.style && (
                      <span className="favourite-tag">{project.style}</span>
                    )}
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
