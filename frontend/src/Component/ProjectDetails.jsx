import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProjectCompanyBox from "./ProjectCompanyBox";
import "./projectdetails.css";
import defaultImage from '../Image/ProjectDetailDefaultImage.png';

function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [checkingFavourite, setCheckingFavourite] = useState(true);
  const [favouriteError, setFavouriteError] = useState("");
  const viewerUserId = Number(localStorage.getItem("currentUserId"));

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjectDetails() {
      setLoading(true);
      setError("");
      setProject(null);
      setImages([]);
      setCurrentImageIndex(0);

      try {
        if (!Number.isInteger(viewerUserId) || viewerUserId <= 0) {
          throw new Error("Please log in first.");
        }
        const listResponse = await fetch(
          "http://127.0.0.1:8000/get_all_project",
          { signal: controller.signal }
        );

        if (!listResponse.ok) {
          throw new Error(`HTTP ${listResponse.status}`);
        }

        const listData = await listResponse.json();
        const items = Array.isArray(listData)
          ? listData
          : listData.projects ?? [];

        const selectedProject = items.find(
          (item) => String(item.project_id) === String(projectId)
        );

        if (!selectedProject) {
          throw new Error("Project not found.");
        }
        const response = await fetch(
          `http://127.0.0.1:8000/get_project/${encodeURIComponent(selectedProject.project_name)}/${viewerUserId}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        setProject({
          ...data,
          id: data.project_id,
          name: data.project_name,
          style: data.category_code,
        });

        setImages(
          data.project_image
            ? [{
                image_id: data.project_id,
                image_url: data.project_image,
              }]
            : []
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProjectDetails();

    return () => controller.abort();
  }, [projectId, viewerUserId]);
  
  useEffect(() => {
    const controller = new AbortController();

    async function checkFavourite() {
      setCheckingFavourite(true);
      setFavouriteError("");
      setIsFavourite(false);

      try {
        if (!Number.isInteger(viewerUserId) || viewerUserId <= 0) {
          return;
        }

        const response = await fetch(
          `http://127.0.0.1:8000/get_all_favorite/${viewerUserId}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const favourites = Array.isArray(data) ? data : [];

        const found = favourites.some(
          (item) => String(item.project_id) === String(projectId)
        );

        if (!controller.signal.aborted) {
          setIsFavourite(found);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setFavouriteError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCheckingFavourite(false);
        }
      }
    }

    checkFavourite();

    return () => controller.abort();
  }, [projectId, viewerUserId]);

  function previousImage() {
    setCurrentImageIndex((previous) =>
    previous === 0
        ? images.length - 1
        : previous - 1
      );
  }

  function nextImage() {
    setCurrentImageIndex((previous) =>
    previous === images.length - 1
      ? 0
      : previous + 1);
  }

  async function toggleFavourite() {
    if (!Number.isInteger(viewerUserId) || viewerUserId <= 0) {
      alert("Please log in first");
      return;
    }

    if (saving || checkingFavourite || favouriteError) return;

    if (
      isFavourite &&
      !window.confirm("Remove this project from your favourites?")
    ) {
      return;
    }

    setSaving(true);

    try {
      let response;

      if (isFavourite) {
        const listResponse = await fetch(
          `http://127.0.0.1:8000/get_all_favorite/${viewerUserId}`,
          { cache: "no-store" }
        );

        if (!listResponse.ok) {
          throw new Error(`HTTP ${listResponse.status}`);
        }

        const listData = await listResponse.json();
        const favourites = Array.isArray(listData) ? listData : [];

        const favourite = favourites.find(
          (item) => String(item.project_id) === String(projectId)
        );

        if (!favourite) {
          setIsFavourite(false);
          return;
        }

        response = await fetch(
          `http://127.0.0.1:8000/delete_favorite/${favourite.favourite_id}`,
          { method: "DELETE" }
        );
      } else {
        const params = new URLSearchParams({
          user_id: String(viewerUserId),
          project_id: String(projectId),
        });

        response = await fetch(
          `http://127.0.0.1:8000/save_favorite?${params}`,
          { method: "POST" }
        );
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : `HTTP ${response.status}`
        );
      }

      setIsFavourite(!isFavourite);
      alert(data.message || "Favourites updated.");
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="project-details-page">
      {loading && <p>Loading project details...</p>}
      {error && (<p style={{ color: "red" }}>{error}</p>)}
      {!loading && !error && project && (
        <>
          <section className="project-slider-section">
            {images.length === 0 ? (<img src={defaultImage}   alt="No project photos yet" className="project-no-image"/>) 
              : (
              <>
                <div className="project-slider">
                  <img src={images[currentImageIndex].image_url} alt={`${project.name} - ${currentImageIndex + 1}`} className="project-slider-image"/>
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="project-slider-prev"
                        onClick={previousImage}
                        aria-label="Previous image"
                      >
                        &#10094;
                      </button>

                      <button
                        type="button"
                        className="project-slider-next"
                        onClick={nextImage}
                        aria-label="Next image"
                      >
                        &#10095;
                      </button>
                    </>
                  )}

                  <div className="project-image-counter">{currentImageIndex + 1} / {images.length}</div>
                </div>
                
                {images.length > 1 && (
                  <div className="project-slider-dots">
                    {images.map((image, index) => (
                      <button
                        type="button"
                        key={image.image_id}
                        className={currentImageIndex === index? "project-dot active": "project-dot"}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Show image ${index + 1}`}/>))}
                  </div>
                )}
              </>
            )}

          </section>
          <section className="project-details-info">
            {(project.category_code || project.style) && (
              <span className="project-details-category">
                {project.category_code || project.style}
              </span>
            )}
            <h1>{project.name ?? project.project_name}</h1>
            <p className="project-details-description">
              {project.description || "No description available"}
            </p>
          </section>
          <section className="project-company-section">
            <button type="button"
                className={`project-detail-favourite-button ${isFavourite ? "active" : ""}`}
                disabled={saving || checkingFavourite || !!favouriteError}
                onClick={toggleFavourite}
            >{isFavourite ? "Unfavourite" : "Favourite"}</button>
            <ProjectCompanyBox
              key={project.project_id}
              projectId={project.project_id}
              userId={project.user_id}
            />
          </section>
        </>
      )}
    </div>
  );
}

export default ProjectDetails;
