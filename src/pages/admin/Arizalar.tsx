import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CButton, CSpinner, CAlert } from '@coreui/react';

interface Section {
  id: number;
  name: string;
}

interface Direction {
  id: number;
  name: string;
  require_file: boolean;
  min_score: number;
  max_score: number;
  section: Section;
}

interface File {
  id: number;
  file_url: string;
  comment: string;
  section: number;
}

interface Score {
  value: number;
}

interface Application {
  id: number;
  student: number;
  direction: Direction;
  submitted_at: string;
  status: string;
  comment: string;
  scores: Score[];
  files: File[];
}

const PAGE_SIZE = 10;

const Arizalar = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchApplications = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error("Token mavjud emas, iltimos login qiling");

      const response = await fetch(
        `http://localhost:8000/api/komissiya/applications/?page=${page}&page_size=${PAGE_SIZE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Maʼlumotlarni olishda xatolik yuz berdi');
      }

      const data = await response.json();

      setApplications(data.results ?? []);
      setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchApplications(page);
  };

  return (
    <div>
      <h2 className="mb-4">📋 Arizalar ro'yxati</h2>

      {loading && (
        <div className="text-center my-3">
          <CSpinner color="primary" />
          <p>Yuklanmoqda...</p>
        </div>
      )}

      {error && (
        <CAlert color="danger" className="my-3">
          {error}
        </CAlert>
      )}

      <CTable striped hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">ID</CTableHeaderCell>
            <CTableHeaderCell scope="col">Yo'nalish</CTableHeaderCell>
            <CTableHeaderCell scope="col">Izoh</CTableHeaderCell>
            <CTableHeaderCell scope="col">Status</CTableHeaderCell>
            <CTableHeaderCell scope="col">Ball</CTableHeaderCell>
            <CTableHeaderCell scope="col">Amallar</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {!loading && applications.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={6} className="text-center">
                Ariza topilmadi
              </CTableDataCell>
            </CTableRow>
          ) : (
            applications.map((app) => {
              const scoreValue = app.scores.length > 0 ? app.scores[0].value : null;
              return (
                <CTableRow key={app.id}>
                  <CTableDataCell>{app.id}</CTableDataCell>
                  <CTableDataCell>{app.direction?.name || '-'}</CTableDataCell>
                  <CTableDataCell>{app.comment || '-'}</CTableDataCell>
                  <CTableDataCell>{app.status || '-'}</CTableDataCell>
                  <CTableDataCell>{scoreValue ?? '-'}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="info" size="sm" onClick={() => navigate(`/admin/check-ariza/${app.id}`)}>
                      Ko‘rish
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              );
            })
          )}
        </CTableBody>
      </CTable>

      <div className="d-flex justify-content-center align-items-center my-3 gap-3">
        <CButton
          color="secondary"
          disabled={currentPage === 1 || loading}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          &laquo; Oldingi
        </CButton>
        <span>
          Sahifa <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
        </span>
        <CButton
          color="secondary"
          disabled={currentPage === totalPages || loading}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Keyingi &raquo;
        </CButton>
      </div>
    </div>
  );
};

export default Arizalar;
