import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./projectcompanybox.css";

function ProjectCompanyBox({ projectId, userId, cardView = false, companySummary, onCompanyUnavailable }) {
    const [loadedCompany, setLoadedCompany] = useState(null);
    const [companyLoading, setCompanyLoading] = useState(true);
    const [knownInactive, setKnownInactive] = useState(false);
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const company = companySummary === undefined ? loadedCompany : companySummary;
    const loading = companySummary === undefined && companyLoading;

    useEffect(() => {
        if (companySummary !== undefined) return;
        const controller = new AbortController();

        async function loadCompany() {
            setCompanyLoading(true);
            setLoadedCompany(null);
            setError("");
            try {
                const response = await fetch(
                `http://127.0.0.1:8000/get_companyprofile/${userId}`,
                { signal: controller.signal }
                );
                const data = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(typeof data?.detail === "string" ? data.detail : "Unable to load company information.");
                }
                if (!controller.signal.aborted){setLoadedCompany(data?.company_profile ?? null);}

            } catch (err) {
                if (!controller.signal.aborted) setError(err.message);
            } finally {
                if (!controller.signal.aborted) setCompanyLoading(false);
            }
        }

        loadCompany();
        return () => controller.abort();
    }, [projectId,userId, companySummary]);

    async function viewCompanyProfile() {
        if (!company || checking || userId == null) return;

        setChecking(true);

        try {
            const response = await fetch(
            `http://127.0.0.1:8000/get_companyprofile/${userId}`,
            { cache: "no-store" }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
            throw new Error("Unable to load company profile.");
            }

            if (data?.company_profile?.status !== "ACTIVE") {
            setKnownInactive(true);
            onCompanyUnavailable?.(projectId);
            throw new Error("This company profile is unavailable.");
            }

            navigate(
            `/projects/${projectId}/company-profile?user_id=${userId}`,
            { state: { from: location.pathname } }
            );
        } catch (err) {
            alert(err.message);
        } finally {
            setChecking(false);
        }
        }

    if (cardView && !loading && !error && (knownInactive || company?.status !== "ACTIVE")) {
        return (
            <aside className="ProjectCompanyBox ProjectCompanyBox--card ProjectCompanyBox--unavailable"
                aria-label="Designer company unavailable">
                <p>Not available now</p>
            </aside>
        );
    }

    return (
        <aside className={`ProjectCompanyBox${cardView ? " ProjectCompanyBox--card" : ""}`} aria-label="Designer company">
            {company ? <h2 title={company.company_name || undefined}>{company.company_name || "Company name not provided"}</h2>
                : <p>Company information unavailable.</p>}
            <button type="button" onClick={viewCompanyProfile}
                disabled={loading || Boolean(error) || !company || checking}>
                {checking ? "Checking..." : "View designer company profile"}
            </button>
        </aside>
    );
}

export default ProjectCompanyBox;
