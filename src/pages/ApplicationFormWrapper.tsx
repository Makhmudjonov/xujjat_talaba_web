import { useParams } from "react-router-dom";
import ApplicationForm from "./forms";

const ApplicationFormWrapper = () => {
  const { applicationTypeId } = useParams<{ applicationTypeId: string }>();
  const id = Number(applicationTypeId);

  return <ApplicationForm applicationTypeId={id} />;
};

export default ApplicationFormWrapper;
