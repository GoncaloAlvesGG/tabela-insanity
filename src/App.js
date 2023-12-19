import './App.css';
import axios from "axios";
import Table from "./tabela";
import React, { useMemo, useState, useEffect } from "react";
import loadingImage from './assets/waiting.gif';

const App = () => {
  const [data, setData] = useState([]);
  const [isAddFormVisible, setAddFormVisible] = useState(false);
  const [tables, setTables] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
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
              <span style={{ fontSize: `${row.index < 3 ? 29 - row.index : 24}px` }}>
                {row.original.nome}
              </span>
            ),
          },
          {
            Header: "Resultado",
            accessor: "resultado",
            Cell: ({ row }) => (
              <span style={{ fontSize: `${row.index < 3 ? 29 - row.index : 24}px`, fontWeight: "bold" }}>
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
      setTables(resultTables.data.tables);
      if (resultTables.data.tables.length > 0 && !selectedTable) {
        setSelectedTable(resultTables.data.tables[0]);
      }
      setError(null);
      const allData = [];
      for (const tableName of tables) {
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


  const rotateTableData = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (tables.length + 1)); // Including images

    if (currentIndex < tables.length) {
      // If the current index is within the table range
      const nextTableName = tables[(currentIndex + 1) % tables.length];
      handleDynamicHeaderChange(nextTableName);
    }
  };
  // useEffect for initial data fetching
  useEffect(() => {

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable]);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    // Handle the dropped files (e.g., upload to server, display preview, etc.)
    handleImageUpload(files);
  };

  // useEffect for interval to rotate data
  useEffect(() => {
    const intervalId = setInterval(() => {
      rotateTableData();
    }, 5000);

    return () => clearInterval(intervalId);

  }, [currentIndex, tables]);

  const handleImageUpload = (files) => {
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        // Display the uploaded image (or upload to server)
        const imageUrl = e.target.result;
        images.push(imageUrl);
        setImages([...images, ...uploadedImages]);
        // Handle the images array as needed
      };

      // Read the image file as a data URL
      reader.readAsDataURL(file);
    }
  };

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
            // Render an image if the current index is for images
            <div>
              {images.map((imageUrl, index) => (
                <img key={index} src={imageUrl} alt={`Image ${index}`} className="image-class" />
              ))}
            </div>
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

          <div className="drop-area" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} />
        </div>
      )}
    </div>
  )

}
export default App;