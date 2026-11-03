import { useEffect, useState } from 'react'
import { Search } from "lucide-react";
import ProjectCompanyBox from "./Component/ProjectCompanyBox";
import { useNavigate } from "react-router-dom";
import './project.css'

function Project({ currentUser }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("All");
  const [categories, setCategories] = useState([]);
  const styles = ["All", ...categories.map((category) => category.category_code)];
  const [currentPage, setCurrentPage] = useState(1);
  const projectPerPage = 9;

  const filteredProjects = projects.filter((project) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      (project.name || "").toLowerCase().includes(keyword) ||
      (project.description || "").toLowerCase().includes(keyword) ||
      (project.company?.status === "ACTIVE" &&
        (project.company.company_name || "").toLowerCase().includes(keyword));

    const matchesStyle =
      selectedStyle === "All" ||
      project.style === selectedStyle;

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

  useEffect(() => {
    async function loadCategories() {
        try {
          const response = await fetch(`http://127.0.0.1:8000/get_all_idpcategory`);
          if (!response.ok) {throw new Error(`HTTP ${response.status}`);}
          const data = await response.json();
          const items = Array.isArray(data)? data : data.categories ?? [];
          setCategories(items);
        } catch (error) {
          console.error("Failed to load categories:", error);
        }
      }

    const controller = new AbortController()
    async function loadProjects() {
      try {
        const response = await fetch(`http://127.0.0.1:8000/get_all_project`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('${response.status}')
        }
        const data = await response.json()
        const items = Array.isArray(data)? data : data.projects ?? [];

        // Fetch cover image for each project
        const projectsWithImages = await Promise.all(
          items.map(async (project) => {
            let company = null;
            try {
              const companyResponse = await fetch(
                `http://127.0.0.1:8000/get_companyprofile/${project.user_id}`,
                {
                  signal: controller.signal,
                  cache: "no-store",
                }
              );

              if (!companyResponse.ok) {
                throw new Error(`HTTP ${companyResponse.status}`);
              }

              const companyData = await companyResponse.json();

              company = companyData.company_profile?.status === "ACTIVE"
                ? companyData.company_profile
                : null;

            } catch (error) {
              if (error.name === "AbortError") {
                throw error;
              }

              console.error("Failed to load company:", error);
            }

            return {
              ...project,
              id: project.project_id ?? project.id,
              name: project.project_name ?? project.name,
              style: project.category_code ?? project.style,
              company,
              image: project.project_image
                ? `data:image/${
                    project.project_image.startsWith("iVBOR") ? "png" : "jpeg"
                  };base64,${project.project_image}`
                : null,
            };
          })
        );
        if (!controller.signal.aborted) {
          setProjects(projectsWithImages);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCategories();
    loadProjects();
    return () => controller.abort();
  }, []);

  async function addFavourite(projectId) {
    const currentUserId = Number(localStorage.getItem("currentUserId"));

    if (!currentUser || !Number.isInteger(currentUserId) || currentUserId <= 0) {
      alert("Please log in first");
      return;
    }

    if (saving) return;
    setSaving(true);

    try {
      const params = new URLSearchParams({
        user_id: String(currentUserId),
        project_id: String(projectId),
      });

      const response = await fetch(
        `http://127.0.0.1:8000/save_favorite?${params}`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to add favourite."
        );
      }

      alert(data.message || "Added to favourites!");
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  function viewProject(projectId) {
    navigate(`/projects/${projectId}`);
  }

  function markCompanyUnavailable(projectId) {
    setProjects((previous) => previous.map((project) =>
      String(project.project_id ?? project.id) === String(projectId)
        ? { ...project, company: null }
        : project
    ));
  }

  return (
    <div className="project-page">
      {/* Search Section */}
      <section className="project-search-section">
        <span className="project-eyebrow">EXPLORE IDEAS</span>
        <h2>Find your inspiration</h2>
        <p>Browse designs that match your personal style</p>
        <div className="project-search-box">
          <input type="text" placeholder="Search projects or companies" value={search} onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}/>
          <Search className="project-search-icon" size={23} />
        </div>
        <div className="project-style-filters">
          {styles.map((style) => (
            <button key={style} className={selectedStyle === style ? "project-style-button active" : "project-style-button"}onClick={() => {setSelectedStyle(style); setCurrentPage(1);}}>{style}</button>
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
          <p>Explore designs for your next renovation</p>
        </div>
        {!loading && !error && (
          <>
            <div className="project-grid">
              {paginatedProjects.map((project) => (
                <div className="project-card" key={project.id}>
                  <div className="project-image">
                    {project.image ? (<img src={project.image}/>) : (<div className="project-placeholder">Interior Design Cover Picture</div>)}
                    {project.style && (<span className="project-tag">{project.style}</span>)}
                  </div>

                  <div className="project-info">
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <ProjectCompanyBox projectId={project.project_id ?? project.id}
                      userId={project.user_id}
                      cardView={true} companySummary={project.company}
                      onCompanyUnavailable={markCompanyUnavailable} />
                    <div className="project-actions">
                      <button
                        type="button"
                        className="project-view-button"
                        onClick={() => viewProject(project.project_id ?? project.id)}
                      >View Project</button>

                      <button
                        className="project-favourite-button"
                        disabled={saving}
                        onClick={() => addFavourite(project.project_id ?? project.id)}>♡ Favourite</button>
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
              <p className="project-empty">
                No projects found
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
export default Project;
