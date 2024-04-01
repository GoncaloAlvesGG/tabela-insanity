import './App.css';
import axios from "axios";
import Table from "./tabela";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import loadingImage from './assets/waiting.gif';

const App = () => {
  const [data, setData] = useState([]);
  const [isAddFormVisible, setAddFormVisible] = useState(false);
  const [tables, setTables] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTable, setSelectedTable] = useState('');
  const [dynamicHeader, setDynamicHeader] = useState("Titulo");
  const [newData, setNewData] = useState({
    nome: "",
    resultado: "",
  });

  const columns = useMemo(
    () => [
      {
        Header: dynamicHeader,
        columns: [
          {
            Header: "Nome",
            accessor: "nome",
            Cell: ({ row }) => (
              <span style={{ fontSize: `${row.index < 3 ? 34 - row.index : 28}px`, fontWeight: "bold" }}>
                {row.original.nome}
              </span>
            ),
          },
          {
            Header: "Resultado",
            accessor: "resultado",
            Cell: ({ row }) => (
              <span style={{ fontSize: `${row.index < 3 ? 34 - row.index : 28}px`, fontWeight: "bold" }}>
                {row.original.resultado}
              </span>
            ),
          },
        ],
      },
    ],
    [dynamicHeader]
  );

  const handleDynamicHeaderChange = (Titulo) => {
    // Set the new dynamic header value
    setDynamicHeader(Titulo);
  };

  const handleAdd = async () => {
    try {
      if (!selectedTable || !newData.nome || !newData.resultado || isNaN(newData.resultado) || newData.resultado < 0) {
        setError("Introduza um nome/resultado válido!");
        return;
      }

      const response = await axios.post(`https://insanity-api.onrender.com/api/insert/${selectedTable}`, newData);

      setAddFormVisible(false);
      const updatedData = [...data, response.data];
      setData(updatedData);
      setError(null);
      setNewData({
        nome: "",
        resultado: "",
      });
      fetchData(selectedTable);
    } catch (error) {
      console.error("Error inserting data:", error.message);
      setError("Error inserting data. Please try again.");
    }
  };

  const handleAddClick = () => {
    // Show the add form
    setAddFormVisible(true);
  };

  const handleInputChange = (e) => {
    // Update the new data state when text boxes change
    setNewData({
      ...newData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTableChange = (e) => {
    setSelectedTable(e.target.value);
  };

  const fetchData = async () => {
    try {
      const resultTables = await axios("https://insanity-api.onrender.com/api/tables");
      const resultImages = await axios.get("https://insanity-api.onrender.com/api/listImage");
      const filteredTables = resultTables.data.tables.filter(table => table !== "Imagens");
      setTables(filteredTables);

      if (filteredTables.length > 0 && !selectedTable) {
        setSelectedTable(filteredTables[0]);
      }

      const validImageExtensions = [".jpg", ".jpeg", ".png"];
      const filteredImages = resultImages.data.filter(image =>
        validImageExtensions.some(ext => image.name.toLowerCase().endsWith(ext))
      );
      setImages(filteredImages);

      setError(null);

      const allData = [];

      for (const tableName of filteredTables) {
        const result = await axios(`https://insanity-api.onrender.com/api/fetch/${tableName}`);
        const tableData = {
          tableName: tableName,
          data: result.data,
        };
        allData.push(tableData);
      }

      setData(allData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setError("Error fetching data. Please try again.");
    }
  };


  const rotateTableData = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (tables.length + 1));

    if (currentIndex < tables.length) {
      const nextTableName = tables[(currentIndex + 1) % tables.length];
      handleDynamicHeaderChange(nextTableName);
    }
  }, [currentIndex, tables]);
  // useEffect for initial data fetching
  useEffect(() => {

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable]);

  const rotateImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === images.length - 1) {
        // If the current index is the last index, reset to 0
        setCurrentIndex(0);
        return 0;
      } else {
        // Otherwise, increment the index
        return prevIndex + 1;
      }
    });
  }, [setCurrentImageIndex, images]);

  // useEffect for interval to rotate data
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (currentIndex < tables.length) {
        rotateTableData();
      } else {
        rotateImage();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [rotateTableData, currentIndex, tables, images, rotateImage]);



  console.log("Data:", data[currentIndex]?.data || []);
  return (
    <div className="App">
      {data.length === 0 ? (
        <div className="loading-container">
          <p className="loading-text">
            Se está preso, culpem a merda do Render. Aguardar um pouco!
          </p>
          <img
            src={loadingImage}
            alt="Loading"
            className="loading-gif"
          />
        </div>
      ) : (
        <div>
          {currentIndex < tables.length ? (
            <Table columns={columns} data={data[currentIndex]?.data || []} />
          ) : (
            currentIndex >= tables.length && (
              <div>
                <img
                  src={"https://drive.google.com/thumbnail?id=" + images[currentImageIndex].id + "&sz=w1000"}
                  alt={`Imagem ${currentImageIndex}`}
                  className="image-class" />
              </div>
            )
          )}
          <div className="button-container">
            <button className="add-button" onClick={handleAddClick}>
              Adicionar
            </button>
          </div>
        </div>
      )}

      {isAddFormVisible && (
        <div className="add-form">

          <select onChange={handleTableChange} value={selectedTable}>
            <option value="" disabled>Tabela</option>
            {tables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Nome"
            name="nome"
            value={newData.nome}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Resultado"
            name="resultado"
            value={newData.resultado}
            onChange={handleInputChange}
          />
          <button className="confirm-button" onClick={handleAdd}>
            Confirmar
          </button>

          {error && (
            <div className="error-container">
              <p className="error-text">{error}</p>
            </div>
          )}

        </div>
      )}
    </div>
  )

}
export default App;