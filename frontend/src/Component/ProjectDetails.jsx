import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProjectCompanyBox from "./ProjectCompanyBox";
import "./projectdetails.css";

function ProjectDetails( {currentUser} ) {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const currentEmail = localStorage.getItem("currentEmail");
  const [isFavourite, setIsFavourite] = useState(false);
  const [checkingFavourite, setCheckingFavourite] = useState(true);
  const [favouriteError, setFavouriteError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadProjectDetails() {
        setLoading(true);
        setError("");
        setProject(null);
        setImages([]);
        setCurrentImageIndex(0);

        try {
            const response = await fetch(`http://127.0.0.1:8000/projects/${projectId}`, {
                signal: controller.signal,
            });
            if (!response.ok) {throw new Error("Failed to load project details");}
            const data = await response.json();

            if (!controller.signal.aborted) {
            setProject(data.project);
            setImages(data.images ?? []);
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
        loadProjectDetails();
        return () => controller.abort();
    }, [projectId]);
  
  useEffect(() => {
    const controller = new AbortController();
    async function checkFavourite() {
      setCheckingFavourite(true);
      setFavouriteError("");
      setIsFavourite(false);

      if (!currentEmail) {
        setCheckingFavourite(false);
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/favourite",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: currentEmail,
            }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {throw new Error("Failed to check favourite");}
        const data = await response.json();
        const favourites = Array.isArray(data)? data: data.favourites ?? [];
        const found = favourites.some((item) => {
        const id = Array.isArray(item)? item[0]: item.project_id ?? item.id;
        return String(id) === String(projectId);});

        if (!controller.signal.aborted) {
          setIsFavourite(found);
        }

      } catch (error) {
        if (error.name !== "AbortError") {
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

  }, [projectId, currentEmail]);

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
    if (!currentEmail) {
      alert("Please log in first");
      return;
    }

    if (saving || checkingFavourite || favouriteError) {
      return;
    }

    // Confirm before removing
    if (isFavourite) {
      const confirmed = window.confirm("Are you sure you want to remove this project from your favourites?");
      if (!confirmed) {return;}
    }

    setSaving(true);
    try {
      const url = isFavourite
        ? "http://127.0.0.1:8000/favourite/remove"
        : "http://127.0.0.1:8000/addTofavourites";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: currentUser,
          email: currentEmail,
          project_id: Number(projectId),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
          (typeof data.detail === "string"
            ? data.detail
            : `Failed to update favourite: ${response.status}`)
        );
      }
      setIsFavourite((prev) => !prev);
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
            {images.length === 0 ? (
              <div className="project-no-image">No images available</div>) 
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
            <ProjectCompanyBox key={projectId} projectId={projectId} />
          </section>
        </>
      )}
    </div>
  );
}

export default ProjectDetails;
