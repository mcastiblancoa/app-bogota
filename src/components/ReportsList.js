import { useEffect, useState } from "react";

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          "https://www.datos.gov.co/resource/4rxi-8m8d.json?$order=:id DESC&$limit=1000"
        );
        if (!response.ok) {
          throw new Error("Error fetching data");
        }
        const data = await response.json();

        // Filtrar los datos para obtener solo los de Bogotá
        const filteredData = data.filter((item) => item.municipio === "BOGOTA D.C.");

        // Agrupar los reportes por fecha y sumar la cantidad
        const groupedData = filteredData.reduce((acc, item) => {
          const date = new Date(item.fecha_hecho).toLocaleDateString();
          if (acc[date]) {
            acc[date] += parseInt(item.cantidad);
          } else {
            acc[date] = parseInt(item.cantidad);
          }
          return acc;
        }, {});

        // Convertir el objeto en un array para facilitar la visualización
        const groupedArray = Object.entries(groupedData).map(([date, count]) => ({
          date,
          count,
        }));

        setReports(groupedArray);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const getColorClass = (count) => {
    if (count >= 100) return "red";
    if (count <= 99 && count >= 50) return "yellow";
    return "blue"; // Para los menores a 50
  };

  return (
    <div className="reports-list">
      <h2 className="reportes-tittle">Últimos reportes oficiales de hurto en Bogotá</h2>
      <ul className="reports-list-container">
        {reports.map((report, index) => (
          <li
            key={index}
            className={`reports-list-item ${getColorClass(report.count)}`}
          >
            <strong>Fecha:</strong> <span className="date">{report.date}</span> - <strong>Cantidad:</strong> <span className="count">{report.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportsList;
