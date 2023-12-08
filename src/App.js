// App.js

import axios from "axios";
import React, { useMemo, useState, useEffect } from "react";
import loadingImage from './assets/waiting.gif';
import Table from "./tabela";
import "./App.css";

function App() {

  const [isAddFormVisible, setAddFormVisible] = useState(false);
  const [newData, setNewData] = useState({
    nome: "",
    resultado: "",
  });
  const columns = useMemo(
    () => [
      {
        Header: "Touro Mecânico",
        columns: [
          {
            Header: "Nome",
            accessor: "nome",
            // Add dynamic content with styling
            Cell: ({ row }) => (
              <span style={{ color: row.original.rowColor }}>{row.original.nome}</span>
            ),
          },
          {
            Header: "Resultado",
            accessor: "resultado",
            // Add dynamic content with styling
            Cell: ({ row }) => (
              <span style={{ fontWeight: "bold", color: row.original.rowColor }}>
                {row.original.resultado}
              </span>
            ),
          },
        ],
      },
    ],
    []
  );

  // Helper function to generate random color
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // data state to store the TV Maze API data. Its initial value is an empty array
  const [data, setData] = useState([]);

  const handleAdd = async () => {
    try {
      // Make a POST request to the server with the data to be inserted
      const response = await axios.post('https://insanity-api.onrender.com/api/insert/TouroMecanico', newData);

      // Handle the response as needed
      console.log(response.data);
      setAddFormVisible(false); // Close the form after successful insertion
      const updatedData = [...data, response.data];
      setData(updatedData);

    } catch (error) {
      console.error("Error inserting data:", error.message);
      // Handle error as needed
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
      const dataWithColor = result.data.map(row => ({ ...row, rowColor: getRandomColor() }));
      setData(dataWithColor);
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
        </>
      )}

    </div>
  );
}

export default App;