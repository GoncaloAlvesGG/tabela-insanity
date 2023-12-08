// App.js

import axios from "axios";
import React, { useMemo, useState, useEffect } from "react";
import loadingImage from './assets/waiting.gif';
import Table from "./tabela";
import "./App.css";

function App() {

  const [error, setError] = useState(null);
  const [isAddFormVisible, setAddFormVisible] = useState(false);
  const [newData, setNewData] = useState({
    nome: "",
    resultado: "",
  });
  const columns = useMemo(
    () => [
      {
        Header: "Ranking Touro Mecânico",
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
    []
  );

  // data state to store the TV Maze API data. Its initial value is an empty array
  const [data, setData] = useState([]);

  const handleAdd = async () => {
    try {
      // Validate input
      if (!newData.nome || !newData.resultado || isNaN(newData.resultado) || newData.resultado < 0) {
        setError("Introduza um nome/resultado válido!");
        return;
      }

      // Make a POST request to the server with the data to be inserted
      const response = await axios.post('https://insanity-api.onrender.com/api/insert/TouroMecanico', newData);

      // Handle the response as needed
      console.log(response.data);
      setAddFormVisible(false); // Close the form after successful insertion
      const updatedData = [...data, response.data];
      setData(updatedData);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error inserting data:", error.message);
      setError("Error inserting data. Please try again."); // Set error state for display
    }
  };

  const handleRemove = async () => {
    try {
      // Your logic to add data
      // Example: const response = await axios.post('your-api-endpoint', newData);
      // Update the data state accordingly
      // setData([...data, response.data]);
    } catch (error) {
      console.error('Error adding data:', error);
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

  // Using useEffect to call the API once mounted and set the data
  useEffect(() => {
    (async () => {
      const result = await axios("https://insanity-api.onrender.com/api/fetch/TouroMecanico");
      setData(result.data);
    })();
  }, []);



  return (
    <div className="App">
      {data.length === 1 ? (
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
        <>
          <Table columns={columns} data={data} />
          <div className="button-container">
            <button className="add-button" onClick={handleAddClick}>
              Adicionar
            </button>
            <button className="remove-button" onClick={handleRemove}>
              Remover
            </button>
          </div>

          {isAddFormVisible && (
            <div className="add-form">
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
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-text" style={{ color: "#e7e6e6" }}>
                {error}
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default App;