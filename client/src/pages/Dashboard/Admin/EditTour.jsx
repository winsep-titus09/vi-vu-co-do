import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminCreateTour from "./CreateTour";
import { toursApi } from "../../../features/tours/api";
import Spinner from "../../../components/Loaders/Spinner";

export default function AdminEditTour() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tourData, setTourData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchTour = async () => {
      try {
        setLoading(true);
        const data = await toursApi.getTour(id);
        if (!ignore) setTourData(data);
      } catch (err) {
        if (!ignore) setError(err?.message || "Không thể tải tour");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    if (id) fetchTour();
    return () => { ignore = true; };
  }, [id]);

  if (loading) return <div className="py-12 flex items-center justify-center"><Spinner /></div>;
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>;
  if (!tourData) return <div className="py-12 text-center">Tour không tồn tại</div>;

  // Pass fetched tour as initialData and editId to AdminCreateTour
  return <AdminCreateTour initialData={tourData} editId={id} />;
}
