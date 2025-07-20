import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CircularProgress, Container, Alert } from "@mui/material";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import ApplicationForm from "./forms"

const ApplicationFormWrapper = () => {
  const { applicationTypeId } = useParams();
  const id = Number(applicationTypeId);

  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDirections = async () => {
      try {
        const res = await fetchWithAuth(
          `https://tanlov.medsfera.uz/api/directions/?application_type_id=${id}`
        );
        if (!res.ok) throw new Error("Yo'nalishlar olinmadi");
        const data = await res.json();
        setDirections(data);
      } catch (err: any) {
        setError("Yo'nalishlar yuklanishda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    };
    loadDirections();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="md">
      <ApplicationForm directions={directions} applicationTypeId={id} />
    </Container>
  );
};

export default ApplicationFormWrapper;
